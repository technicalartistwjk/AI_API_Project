export default async function handler(req, res) {
  const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: '프롬프트가 없습니다.' });
  }

  try {
    // 1 Replicate에 이미지 생성 요청 보내기
    const startResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "8b88b46d58a4d2f729b2e9045d95bbebee9f4507b87a6e6f648e5b0b77c7b518", // imagen-4-fast 버전 ID
        input: { prompt }
      })
    });

    if (!startResponse.ok) {
      const details = await startResponse.text();
      throw new Error(`요청 실패: ${startResponse.statusText}\n세부: ${details}`);
    }

    let prediction = await startResponse.json();
    const predictionId = prediction.id;

    // 2 결과가 나올 때까지 1초마다 확인
    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const resultResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { 'Authorization': `Token ${REPLICATE_API_KEY}` }
      });

      prediction = await resultResponse.json();
    }

    // 3️최종 결과 반환
    if (prediction.status === "succeeded" && prediction.output && prediction.output.length > 0) {
      res.status(200).json({ imageUrl: prediction.output[0] });
    } else {
      throw new Error(`이미지 생성 실패: ${prediction.error || "출력 데이터 없음"}`);
    }

  } catch (error) {
    console.error("서버 내부 오류:", error);
    res.status(500).json({ message: error.message });
  }
}




/*
export default async function handler(req, res) {
    
    // 1. Vercel 대시보드에서 API 키겟
    const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

    // 2. 프론트엔드에서 'prompt' 값 리턴
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: '프롬프트가 없습니다.' });
    }

    try {
        // 'Prefer: wait' 헤더를 사용해, 결과가 나올 때까지 
        // 주소도 모델 '전용 주소'로 변경
        const response = await fetch('https://api.replicate.com/v1/models/google/imagen-4-fast/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${REPLICATE_API_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'wait' //
            },
            body: JSON.stringify({
                input: {
                    prompt: prompt,
                    aspect_ratio: "4:3" // (예제에 있던 값 추가)
                }
                // 'version' 키가 필요X
            })
        });
        // ------------------

        if (!response.ok) {
            const errorDetails = await response.text(); // 더 자세한 에러 확인
            throw new Error(`API 요청 실패: ${response.statusText} (세부: ${errorDetails})`);
        }

        const prediction = await response.json();

        // 최종 결과를 프론트엔드로 전송
        if (prediction.status === 'succeeded') {
            res.status(200).json({ imageUrl: prediction.output[0] });
        } else {
            res.status(500).json({ message: `이미지 생성 실패: ${prediction.error}` });
        }

    } catch (error) {
        console.error('서버 내부 오류:', error);//
        res.status(500).json({ message: error.message || '서버 내부 오류가 발생했습니다.' });
    }
}
    */