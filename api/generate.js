// /api/generate.js
export default async function handler(req, res) {
  const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

  console.log("===== 🟢 /api/generate 호출 시작 =====");

  try {
    const {
      prompt,
      model,
      aspect_ratio,
      output_format = "jpg",
      imageCount = 1,
      imageUrls = [], // base64 or HTTP URL
    } = req.body;

    console.log("🧾 요청 데이터:", {
      prompt: prompt?.slice(0, 80) + "...",
      model,
      aspect_ratio,
      output_format,
      imageCount,
      imageUrlsCount: imageUrls.length,
    });

    if (!prompt)
      return res.status(400).json({ message: "⚠️ 프롬프트가 없습니다." });

    // ===== 모델 엔드포인트 설정 =====
    const MODEL_ENDPOINTS = {
      "google/imagen-4-fast": "https://api.replicate.com/v1/models/google/imagen-4-fast/predictions",
      "google/nano-banana": "https://api.replicate.com/v1/models/google/nano-banana/predictions",
      "bytedance/seedream-4": "https://api.replicate.com/v1/models/bytedance/seedream-4/predictions",
    };
    const endpoint = MODEL_ENDPOINTS[model];
    if (!endpoint)
      return res.status(400).json({ message: "❌ 유효하지 않은 모델입니다." });

    // ===== base64 → Replicate 업로드 함수 =====
    async function uploadBase64ToReplicate(base64Data) {
      try {
        console.log("📤 Replicate 업로드 시작...");
        const base64Content = base64Data.split(",")[1];
        const binary = Uint8Array.from(atob(base64Content), (c) => c.charCodeAt(0));
        const blob = new Blob([binary]);
        const formData = new FormData();
        formData.append("file", blob, "upload.png");

        const response = await fetch("https://api.replicate.com/v1/files", {
          method: "POST",
          headers: { Authorization: `Token ${REPLICATE_API_KEY}` },
          body: formData,
        });

        const json = await response.json();
        console.log("📦 Replicate 업로드 응답:", json);

        if (!response.ok) throw new Error(json.detail || "파일 업로드 실패");
        console.log("✅ 업로드 완료:", json.url);
        return json.url;
      } catch (err) {
        console.error("🚫 업로드 실패:", err);
        return null;
      }
    }

    // ===== 이미지 URL 정리 =====
    const finalImageUrls = [];
    for (const img of imageUrls) {
      if (img.startsWith("data:image/")) {
        console.log("🧩 base64 이미지 감지 → 업로드 중...");
        const uploadedUrl = await uploadBase64ToReplicate(img);
        if (uploadedUrl) finalImageUrls.push(uploadedUrl);
      } else {
        finalImageUrls.push(img);
      }
    }

    console.log("🖼️ 최종 image_input 배열:", finalImageUrls);

    // ===== 모델별 입력 구성 =====
    let inputData = {};

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
        aspect_ratio: "1:1", // nano-banana는 고정
        output_format,
      };
      if (finalImageUrls.length > 0)
        inputData.image_input = finalImageUrls;
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
      if (finalImageUrls.length > 0)
        inputData.image_input = finalImageUrls;
    }

    console.log("🧠 최종 inputData:", inputData);

    // ===== Replicate 호출 =====
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

    if (!r.ok) {
      console.error("🧨 Replicate 응답 오류:", pred);
      throw new Error(pred.error || pred.detail || "API 요청 실패");
    }

    // ===== 결과 파싱 =====
    let urls = [];
    if (Array.isArray(pred.output)) urls = pred.output;
    else if (typeof pred.output === "string") urls = [pred.output];

    // ===== Nano Banana 지연 처리 (polling) =====
    if (model === "google/nano-banana" && urls.length === 0 && pred.id) {
      console.log("⏳ 출력 비어있음 → 2초 후 polling 시작:", pred.id);
      await new Promise((r) => setTimeout(r, 2000));

      const pollRes = await fetch(
        `https://api.replicate.com/v1/predictions/${pred.id}`,
        { headers: { Authorization: `Token ${REPLICATE_API_KEY}` } }
      );
      const pollJson = await pollRes.json();
      console.log("🔁 Polling 결과:", pollJson);

      if (Array.isArray(pollJson.output)) urls = pollJson.output;
      else if (typeof pollJson.output === "string") urls = [pollJson.output];
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