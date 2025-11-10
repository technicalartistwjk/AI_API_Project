// /api/request_upload.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { file_name, content_type } = await req.json
      ? await req.json()
      : req.body;

    if (!file_name || !content_type) {
      return res.status(400).json({ message: 'file_name and content_type are required' });
    }

    // 1️ Replicate 업로드 URL 요청
    const response = await fetch("https://api.replicate.com/v1/uploads", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_name,
        content_type,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Replicate upload request failed:", err);
      return res.status(500).json({ detail: err.detail || 'Failed to get upload URL' });
    }

    // 2️ 응답 파싱
    const uploadData = await response.json();
    const servingUrl =
      uploadData.serving_url ||
      uploadData.url ||
      uploadData.output_url ||
      null;

    if (!uploadData.upload_url || !servingUrl) {
      console.error("Invalid Replicate upload response:", uploadData);
      return res.status(500).json({ message: "Invalid upload URL structure" });
    }

    // 3️ 클라이언트로 전달
    return res.status(200).json({
      upload_url: uploadData.upload_url,
      serving_url: servingUrl,
    });
  } catch (err) {
    console.error("request_upload error:", err);
    return res.status(500).json({ message: "Error requesting upload URL" });
  }
}
