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
        console.error('서버 내부 오류:', error);
        res.status(500).json({ message: error.message || '서버 내부 오류가 발생했습니다.' });
    }
}