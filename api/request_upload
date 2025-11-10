// api/request_upload.js

export default async function handler(req, res) {
  // 1. POST 요청 및 파라미터 확인
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { file_name, content_type } = req.body;
  if (!file_name || !content_type) {
    return res.status(400).json({ message: 'file_name and content_type are required' });
  }

  try {
    // 2. Replicate API 호출 (Vercel 환경 변수 REPLICATE_API_KEY 사용)
    const response = await fetch("https://api.replicate.com/v1/uploads", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "file_name": file_name,
        "content_type": content_type,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Replicate upload request failed:", error);
      return res.status(500).json({ detail: error.detail || 'Failed to get upload URL' });
    }

    // 3. 클라이언트에 upload_url과 serving_url 반환
    const uploadData = await response.json();
    res.status(200).json(uploadData); // { upload_url, serving_url }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error requesting upload URL' });
  }
}