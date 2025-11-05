export default async function handler(req, res) {
  const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
  const {
    prompt,
    model,
    aspect_ratio,
    output_format = "jpg",
    imageCount = 1,
    imageUrls = [],
  } = req.body;

  if (!prompt)
    return res.status(400).json({ message: "프롬프트가 없습니다." });

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

  // ✅ 안전한 파일 업로드 (Vercel 호환)
  async function uploadToReplicate(base64Data) {
    try {
      console.log("📤 [UPLOAD INIT] 데이터 길이:", base64Data?.length || 0);

      if (!base64Data || !base64Data.startsWith("data:image/")) {
        throw new Error("유효하지 않은 Base64 이미지 데이터입니다.");
      }

      const base64Content = base64Data.split(",")[1];
      const mimeType = base64Data.substring(
        base64Data.indexOf(":") + 1,
        base64Data.indexOf(";")
      );
      const buffer = Buffer.from(base64Content, "base64");

      const boundary = "----replicateBoundary" + Math.random().toString(16);
      const head = Buffer.from(
        `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="file"; filename="upload.${mimeType.split("/")[1] || "png"}"\r\n` +
          `Content-Type: ${mimeType}\r\n\r\n`
      );
      const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
      const body = Buffer.concat([head, buffer, tail]);

      console.log("📦 [UPLOAD TRY] 크기:", body.length, "bytes");

      const response = await fetch("https://api.replicate.com/v1/files", {
        method: "POST",
        headers: {
          Authorization: `Token ${REPLICATE_API_KEY}`,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
        },
        body,
      });

      const text = await response.text();
      console.log("📬 [UPLOAD RESPONSE RAW]:", text);

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("응답 JSON 파싱 실패: " + text);
      }

      if (!response.ok || !json.url) {
        throw new Error(
          `파일 업로드 실패 (${response.status}): ${
            json.detail || json.error || text
          }`
        );
      }

      console.log("🧩 [UPLOAD OK] Replicate URL:", json.url);
      return json.url;
    } catch (err) {
      console.error("❌ 파일 업로드 오류:", err);
      return null;
    }
  }

  // Base64 → Replicate 파일 URL 변환
  let uploadedUrls = [];
  for (const img of imageUrls) {
    if (img.startsWith("data:image/")) {
      const url = await uploadToReplicate(img);
      if (url) uploadedUrls.push(url);
    } else uploadedUrls.push(img);
  }

  // ✅ 모델별 입력값 구성
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
      aspect_ratio: aspect_ratio || "1:1",
      output_format,
    };
    if (uploadedUrls.length > 0) inputData.image_input = uploadedUrls;
  } else if (model === "bytedance/seedream-4") {
    inputData = {
      prompt,
      aspect_ratio: aspect_ratio || "4:3",
      output_format,
      max_images: imageCount,
      size: "2K",
      width: 2048,
      height: 2048,
      enhance_prompt: true,
      sequential_image_generation: "disabled",
    };
    if (uploadedUrls.length > 0) inputData.image_input = uploadedUrls;
  }

  console.log("🚀 [SEND TO REPLICATE]", model, inputData);

  try {
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
    console.log("📥 [REPLICATE RESPONSE]", pred);

    if (!r.ok) throw new Error(pred.error || pred.detail || "API 요청 실패");

    let urls = [];
    if (Array.isArray(pred.output)) urls = pred.output;
    else if (typeof pred.output === "string") urls = [pred.output];

    // ✅ nano-banana의 지연 응답 처리
    if (model === "google/nano-banana" && urls.length === 0 && pred.id) {
      console.log("⌛ Nano Banana 지연 → 재조회 중...");
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await fetch(
        `https://api.replicate.com/v1/predictions/${pred.id}`,
        { headers: { Authorization: `Token ${REPLICATE_API_KEY}` } }
      );
      const p = await poll.json();
      if (Array.isArray(p.output)) urls = p.output;
      else if (typeof p.output === "string") urls = [p.output];
      console.log("✅ [폴링 후 출력]", urls);
    }

    if (!urls.length) throw new Error("이미지 출력이 없습니다.");

    res.status(200).json({ imageUrls: urls });
  } catch (err) {
    console.error("서버 오류:", err);
    res.status(500).json({ message: err.message });
  }
}


/* 생성이미지 기반 변경 가능
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

  // ✅ base64 업로드 함수
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

/*
export default async function handler(req, res) {
  const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
  const { prompt, model, aspect_ratio } = req.body; // ratio 값도 함께 받기

  if (!prompt) {
    return res.status(400).json({ message: "프롬프트가 없습니다." });
  }

  // 모델별 엔드포인트 매핑
  const MODEL_ENDPOINTS = {
    "google/imagen-4-fast": "https://api.replicate.com/v1/models/google/imagen-4-fast/predictions",
    "google/nano-banana": "https://api.replicate.com/v1/models/google/nano-banana/predictions",
    "bytedance/seedream-4": "https://api.replicate.com/v1/models/bytedance/seedream-4/predictions"
  };

  const targetEndpoint = MODEL_ENDPOINTS[model];
  if (!targetEndpoint) {
    return res.status(400).json({ message: "유효하지 않은 모델입니다." });
  }

  // 모델별 입력값 구성 (ratio를 동적으로 반영)
  let inputData = { prompt };

  if (model === "google/imagen-4-fast") {
    inputData = {
      prompt,
      aspect_ratio: aspect_ratio || "4:3",
      output_format: "jpg",
      safety_filter_level: "block_only_high"
    };
  } else if (model === "google/nano-banana") {
    inputData = {
      prompt,
      aspect_ratio: aspect_ratio || "1:1",
      output_format: "jpg"
    };
  } else if (model === "bytedance/seedream-4") {
    inputData = {
      size: "2K",
      width: 2048,
      height: 2048,
      prompt,
      max_images: 1,
      image_input: [],
      aspect_ratio: aspect_ratio || "4:3",
      enhance_prompt: true,
      sequential_image_generation: "disabled"
    };
  }

  try {
    const response = await fetch(targetEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "wait"
      },
      body: JSON.stringify({ input: inputData })
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`API 요청 실패: ${response.statusText} (세부: ${errorDetails})`);
    }

    const prediction = await response.json();
    console.log(" Model response:", prediction);

    // output이 문자열이거나 배열일 수 있으므로 둘 다 처리
    let imageUrl = null;
    if (Array.isArray(prediction.output)) {
      imageUrl = prediction.output[0];
    } else if (typeof prediction.output === "string") {
      imageUrl = prediction.output;
    }

    // Nano Banana 특수 케이스: output이 null인데 id가 있으면 1.5초 후 재조회
    if (model === "google/nano-banana" && !imageUrl && prediction.id) {
      console.log(" Nano Banana returned empty output — polling once more...");
      await new Promise(r => setTimeout(r, 1500));
      const pollRes = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        { headers: { Authorization: `Token ${REPLICATE_API_KEY}` } }
      );
      const polled = await pollRes.json();
      if (Array.isArray(polled.output)) imageUrl = polled.output[0];
      else if (typeof polled.output === "string") imageUrl = polled.output;
    }

    if (!imageUrl) {
      throw new Error("이미지 출력이 없습니다. (출력 형식 불명 또는 지연)");
    }

    res.status(200).json({ imageUrl });

  } catch (error) {
    console.error("서버 내부 오류:", error);
    res.status(500).json({
      message: error.message || "서버 내부 오류가 발생했습니다."
    });
  }
}
  */


/* Start Code
export default async function handler(req, res) {
  const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "프롬프트가 없습니다." });
  }

  try {
    const response = await fetch(
      "https://api.replicate.com/v1/models/google/imagen-4-fast/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          input: {
            prompt: prompt,
            aspect_ratio: "4:3",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(
        `API 요청 실패: ${response.statusText} (세부: ${errorDetails})`
      );
    }

    const prediction = await response.json();
    console.log("🧩 Replicate raw response:", prediction);

    //  output이 문자열로 반환되므로 그대로 사용
    if (prediction.output) {
      res.status(200).json({ imageUrl: prediction.output });
    } else {
      throw new Error(`이미지 생성 실패: ${prediction.error || "출력 없음"}`);
    }
  } catch (error) {
    console.error("서버 내부 오류:", error);
    res
      .status(500)
      .json({ message: error.message || "서버 내부 오류가 발생했습니다." });
  }
}
*/
