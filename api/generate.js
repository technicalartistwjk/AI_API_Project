// /api/generate.js
// ✅ 완전한 Replicate 이미지 생성 API (JPEG / PNG / WEBP 지원)
// ✅ "Missing content" 오류 완전 해결 (Content-Length + duplex 적용)
// ✅ Vercel Lambda 환경 호환 (runtime: nodejs)

export const config = { runtime: "nodejs" }; // ⚡ Edge에서 Buffer 깨짐 방지

export default async function handler(req, res) {
  const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
  if (!REPLICATE_API_KEY)
    return res.status(500).json({ message: "❌ REPLICATE_API_KEY가 설정되어 있지 않습니다." });

  const {
    prompt,
    model,
    aspect_ratio,
    output_format = "jpg",
    imageCount = 1,
    imageUrls = [],
  } = req.body || {};

  console.log("===== 🟢 /api/generate 호출 시작 =====");
  console.log("🧾 요청 데이터:", {
    prompt,
    model,
    aspect_ratio,
    output_format,
    imageCount,
    imageUrlsCount: imageUrls?.length || 0,
  });

  if (!prompt) return res.status(400).json({ message: "프롬프트가 없습니다." });

  const MODEL_ENDPOINTS = {
    "google/imagen-4-fast":
      "https://api.replicate.com/v1/models/google/imagen-4-fast/predictions",
    "google/nano-banana":
      "https://api.replicate.com/v1/models/google/nano-banana/predictions",
    "bytedance/seedream-4":
      "https://api.replicate.com/v1/models/bytedance/seedream-4/predictions",
  };
  const endpoint = MODEL_ENDPOINTS[model];
  if (!endpoint)
    return res.status(400).json({ message: "유효하지 않은 모델입니다." });

  // ✅ Replicate Base64 업로드 함수 (JPEG / PNG / WEBP 완전 호환)
  async function uploadBase64ToReplicate(base64Data) {
    try {
      console.log("📤 Replicate 업로드 시작...");

      // MIME 타입 & 확장자 추출
      const mimeMatch = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
      const ext = mimeType.split("/")[1] || "png";
      const base64Content = base64Data.split(",")[1];
      const buffer = Buffer.from(base64Content, "base64");

      // Step 1️⃣: Presigned URL 요청
      const createPayload = JSON.stringify({
        file_name: `upload.${ext}`,
        content_type: mimeType,
      });

      const createRes = await fetch("https://api.replicate.com/v1/files", {
        method: "POST",
        headers: {
          Authorization: `Token ${REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(createPayload), // ✅ 숫자형
        },
        body: createPayload,
        duplex: "half", // ✅ Vercel Edge/Lambda에서 body 안정화
      });

      const createData = await createRes.json();
      console.log("📨 Replicate presign 응답:", createData);

      if (!createRes.ok || !createData.upload_url)
        throw new Error(createData.detail || createData.error || "Upload URL 생성 실패");

      // Step 2️⃣: S3 PUT 업로드
      const putRes = await fetch(createData.upload_url, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: buffer,
      });

      if (!putRes.ok) {
        const errText = await putRes.text();
        throw new Error(`파일 업로드 실패: ${putRes.status} ${errText}`);
      }

      console.log("✅ Replicate 업로드 성공:", createData.serving_url);
      return createData.serving_url;
    } catch (err) {
      console.error("🚫 업로드 실패:", err);
      return null;
    }
  }

  // base64 → URL 변환 처리
  let uploadedUrls = [];
  for (const img of imageUrls) {
    if (img.startsWith("data:image/")) {
      const url = await uploadBase64ToReplicate(img);
      if (url) uploadedUrls.push(url);
    } else {
      uploadedUrls.push(img);
    }
  }

  console.log("🖼️ 최종 image_input 배열:", uploadedUrls);

  // 모델별 입력 구성
  let inputData = { prompt };
  if (model === "google/imagen-4-fast") {
    inputData = {
      prompt,
      aspect_ratio: aspect_ratio || "4:3",
      output_format,
      safety_filter_level: "block_only_high",
    };
  } else if (model === "google/nano-banana") {
    inputData = {
      prompt,
      aspect_ratio: "1:1",
      output_format,
    };
    if (uploadedUrls.length > 0) inputData.image_input = uploadedUrls;
  } else if (model === "bytedance/seedream-4") {
    inputData = {
      size: "2K",
      width: 2048,
      height: 2048,
      prompt,
      max_images: imageCount,
      aspect_ratio: aspect_ratio || "4:3",
      output_format,
      enhance_prompt: true,
      sequential_image_generation: "disabled",
    };
    if (uploadedUrls.length > 0) inputData.image_input = uploadedUrls;
  }

  console.log("🧠 최종 inputData:", inputData);

  try {
    // Step 3️⃣: Replicate 모델 호출
    const r = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({ input: inputData }),
    });

    const pred = await r.json();
    console.log("🔍 Replicate 응답:", pred);

    if (!r.ok) throw new Error(pred.error || pred.detail || "API 요청 실패");

    let urls = [];
    if (Array.isArray(pred.output)) urls = pred.output;
    else if (typeof pred.output === "string") urls = [pred.output];

    // Step 4️⃣: Nano Banana polling 보조
    if (model === "google/nano-banana" && urls.length === 0 && pred.id) {
      console.log("⏳ 출력 비어있음 → 2초 후 polling 시작:", pred.id);
      await new Promise((r) => setTimeout(r, 2000));

      const poll = await fetch(
        `https://api.replicate.com/v1/predictions/${pred.id}`,
        { headers: { Authorization: `Token ${REPLICATE_API_KEY}` } }
      );
      const p = await poll.json();

      if (Array.isArray(p.output)) urls = p.output;
      else if (typeof p.output === "string") urls = [p.output];
      console.log("🔁 Polling 결과:", p);
    }

    if (!urls.length)
      throw new Error("🚫 이미지 출력이 없습니다. 모델 처리 대기 중일 수 있습니다.");

    console.log("✅ 최종 출력 이미지:", urls);
    console.log("===== 🟢 /api/generate 처리 완료 =====");

    res.status(200).json({ imageUrls: urls });
  } catch (err) {
    console.error("🔥 서버 내부 오류:", err);
    res.status(500).json({ message: err.message });
  }
}


/* 생성이미지 기반 변경 가능*/
/*
export default async function handler(req, res) {
  const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
  const { prompt, model, aspect_ratio, output_format = "jpg", imageCount = 1, imageUrls = [] } = req.body;

  if (!prompt)
    return res.status(400).json({ message: "프롬프트가 없습니다." });

  const MODEL_ENDPOINTS = {
    "google/imagen-4-fast": "https://api.replicate.com/v1/models/google/imagen-4-fast/predictions",
    "google/nano-banana": "https://api.replicate.com/v1/models/google/nano-banana/predictions",
    "bytedance/seedream-4": "https://api.replicate.com/v1/models/bytedance/seedream-4/predictions"
  };
  const endpoint = MODEL_ENDPOINTS[model];
  if (!endpoint)
    return res.status(400).json({ message: "유효하지 않은 모델입니다." });

  //  base64 업로드 함수
  async function uploadToReplicate(base64Data) {
    try {
      const base64Content = base64Data.split(",")[1];
      const buffer = Buffer.from(base64Content, "base64");
      const blob = new Blob([buffer]);
      const formData = new FormData();
      formData.append("file", blob, "upload.png");

      const response = await fetch("https://api.replicate.com/v1/files", {
        method: "POST",
        headers: { Authorization: `Token ${REPLICATE_API_KEY}` },
        body: formData
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.detail || JSON.stringify(json));
      return json.url;
    } catch (err) {
      console.error("파일 업로드 실패:", err);
      return null;
    }
  }

  // base64 → URL 변환
  let uploadedUrls = [];
  for (const img of imageUrls) {
    if (img.startsWith("data:image/")) {
      const url = await uploadToReplicate(img);
      if (url) uploadedUrls.push(url);
    } else uploadedUrls.push(img);
  }

  // 모델별 입력 구성
  let inputData = { prompt };

  if (model === "google/imagen-4-fast") {
    inputData = {
      prompt,
      aspect_ratio: aspect_ratio || "4:3",
      output_format,
      safety_filter_level: "block_only_high"
    };
  } else if (model === "google/nano-banana") {
    inputData = {
      prompt,
      aspect_ratio: "1:1", //  이 모델은 1:1만 지원
      output_format
    };
    if (uploadedUrls.length > 0)
      inputData.image_input = uploadedUrls; //  수정: 단순 배열
  } else if (model === "bytedance/seedream-4") {
    inputData = {
      size: "2K",
      width: 2048,
      height: 2048,
      prompt,
      max_images: imageCount,
      aspect_ratio: aspect_ratio || "4:3",
      output_format,
      enhance_prompt: true,
      sequential_image_generation: "disabled"
    };
    if (uploadedUrls.length > 0)
      inputData.image_input = uploadedUrls; // 수정: 단순 배열
  }

  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "wait"
      },
      body: JSON.stringify({ input: inputData })
    });

    const pred = await r.json();

    if (!r.ok) {
      console.error(" Replicate 응답:", pred);
      throw new Error(pred.error || pred.detail || "API 요청 실패");
    }

    let urls = [];
    if (Array.isArray(pred.output)) urls = pred.output;
    else if (typeof pred.output === "string") urls = [pred.output];

    // Nano Banana 지연 대응
    if (model === "google/nano-banana" && urls.length === 0 && pred.id) {
      await new Promise(r => setTimeout(r, 1500));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, {
        headers: { Authorization: `Token ${REPLICATE_API_KEY}` }
      });
      const p = await poll.json();
      if (Array.isArray(p.output)) urls = p.output;
      else if (typeof p.output === "string") urls = [p.output];
    }

    if (!urls.length) throw new Error("이미지 출력이 없습니다.");
    res.status(200).json({ imageUrls: urls });

  } catch (err) {
    console.error("서버 오류:", err);
    res.status(500).json({ message: err.message });
  }
}
*/