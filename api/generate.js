import FormData from "form-data";

export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  try {
    const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY 환경변수가 설정되어 있지 않습니다.");
    }

    const { prompt, model, aspect_ratio = "1:1", output_format = "jpg", imageUrls = [] } = req.body || {};
    console.log("===== 🟢 /api/generate 호출 시작 =====");
    console.log("🧾 요청 데이터:", { prompt, model, imageUrlsCount: imageUrls.length });

    if (!prompt) {
      return res.status(400).json({ message: "프롬프트가 없습니다." });
    }

    // 업로드 함수
    async function uploadBase64ToReplicate(base64Data) {
      console.log("📤 업로드 시작...");
      const mimeMatch = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
      const ext = mimeType.split("/")[1];
      const base64Content = base64Data.split(",")[1];
      const buffer = Buffer.from(base64Content, "base64");
      console.log(`🧩 mimeType=${mimeType}, ext=${ext}, bufferSize=${buffer.length}`);

      if (buffer.length === 0) {
        throw new Error("⚠️ base64 변환 후 버퍼가 비어 있음");
      }

      const form = new FormData();
      form.append("file", buffer, {
        filename: `upload.${ext}`,
        contentType: mimeType
      });

      const uploadRes = await fetch("https://api.replicate.com/v1/files", {
        method: "POST",
        headers: {
          Authorization: `Token ${REPLICATE_API_KEY}`,
          ...form.getHeaders()
        },
        body: form
      });
      const uploadJson = await uploadRes.json();
      console.log("📦 Replicate 업로드 응답:", uploadJson, "상태코드:", uploadRes.status);

      if (!uploadRes.ok) {
        throw new Error(uploadJson.detail || `파일 업로드 실패 (status ${uploadRes.status})`);
      }
      if (!uploadJson.serving_url) {
        throw new Error("serving_url이 반환되지 않았습니다.");
      }

      console.log("✅ 업로드 완료:", uploadJson.serving_url);
      return uploadJson.serving_url;
    }

    // 이미지 URLs 처리
    const uploadedUrls = [];
    for (const img of imageUrls) {
      if (typeof img === "string" && img.startsWith("data:image/")) {
        const url = await uploadBase64ToReplicate(img);
        if (url) uploadedUrls.push(url);
      } else if (typeof img === "string" && img.startsWith("http")) {
        // 이미 URL로 된 경우
        uploadedUrls.push(img);
      } else {
        console.warn("⚠️ imageUrls 항목이 유효하지 않음:", img);
      }
    }
    console.log("🖼️ 최종 image_input:", uploadedUrls);

    // 모델별 endpoint
    const MODEL_ENDPOINTS = {
      "google/imagen-4-fast": "https://api.replicate.com/v1/models/google/imagen-4-fast/predictions",
      "google/nano-banana": "https://api/replicate.com/v1/models/google/nano-banana/predictions",
      "bytedance/seedream-4": "https://api.replicate.com/v1/models/bytedance/seedream-4/predictions"
    };
    const endpoint = MODEL_ENDPOINTS[model];
    if (!endpoint) {
      return res.status(400).json({ message: "유효하지 않은 모델입니다." });
    }

    // 입력 데이터 구성
    const inputData = { prompt, aspect_ratio, output_format };
    if (uploadedUrls.length > 0) {
      inputData.image_input = uploadedUrls;
    }
    console.log("🧠 최종 inputData:", inputData);

    // 예측 요청
    const predRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "wait"
      },
      body: JSON.stringify({ input: inputData })
    });

    const predJson = await predRes.json();
    console.log("🔍 모델 응답:", predJson, "상태코드:", predRes.status);

    if (!predRes.ok) {
      throw new Error(predJson.error || predJson.detail || `예측 요청 실패 (status ${predRes.status})`);
    }

    let urls = [];
    if (Array.isArray(predJson.output)) urls = predJson.output;
    else if (typeof predJson.output === "string") urls = [predJson.output];

    if (urls.length === 0) {
      throw new Error("이미지 출력이 없습니다.");
    }

    res.status(200).json({ imageUrls: urls });
  } catch (err) {
    console.error("🔥 /api/generate 내부 오류:", err);
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