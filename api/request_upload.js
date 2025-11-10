// /api/request_upload.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const body = req.body || (await req.json?.());
    const { file_name, content_type } = body || {};

    if (!file_name || !content_type) {
      return res.status(400).json({ message: 'file_name and content_type are required' });
    }

    //  최신 Replicate 업로드 엔드포인트 (uploads → files)
    const response = await fetch("https://api.replicate.com/v1/files", {
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
      const error = await response.json();
      console.error("Replicate upload request failed:", error);
      return res.status(500).json({ detail: error.detail || 'Failed to get upload URL' });
    }

    const uploadData = await response.json();

    // ✅ 새로운 구조: upload_url → upload_url, url → serving_url
    const uploadUrl = uploadData.upload_url;
    const servingUrl = uploadData.url || uploadData.serving_url || uploadData.output_url;

    if (!uploadUrl || !servingUrl) {
      console.error("Invalid Replicate upload response:", uploadData);
      return res.status(500).json({ message: "Invalid upload URL structure" });
    }

    return res.status(200).json({
      upload_url: uploadUrl,
      serving_url: servingUrl,
    });
  } catch (err) {
    console.error("request_upload error:", err);
    return res.status(500).json({ message: "Error requesting upload URL" });
  }
}
