export default async function handler(req, res) {
  const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
  const { prompt, model, aspect_ratio } = req.body; // ✅ ratio 값도 함께 받기

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
      aspect_ratio: aspect_ratio || "4:3", // 사용자가 선택한 값
      output_format: "jpg",
      safety_filter_level: "block_only_high"
    };
  } 
  else if (model === "google/nano-banana") {
    inputData = {
      prompt,
      aspect_ratio: aspect_ratio || "1:1", // 기본값 1:1
      output_format: "jpg"
    };
  } 
  else if (model === "bytedance/seedream-4") {
    inputData = {
      size: "2K",
      width: 2048,
      height: 2048,
      prompt,
      max_images: 1,
      image_input: [],
      aspect_ratio: aspect_ratio || "4:3", // 선택된 값 반영
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
    console.log("🧩 Model response:", prediction);

    const imageUrl = prediction.output?.[0] || prediction.output || null;

    if (!imageUrl) {
      throw new Error("이미지 출력이 없습니다.");
    }

    res.status(200).json({ imageUrl });

  } catch (error) {
    console.error("서버 내부 오류:", error);
    res.status(500).json({ message: error.message || "서버 내부 오류가 발생했습니다." });
  }
}


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
