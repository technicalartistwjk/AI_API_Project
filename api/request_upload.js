// /api/request_upload.js ✅ Replicate uploads 방식 (정답)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const { file_name, content_type } = body || {};

    console.log("📦 Request body:", body);

    if (!file_name || !content_type) {
      return res.status(400).json({
        message: 'file_name and content_type are required',
      });
    }

    // ✅ 올바른 엔드포인트: uploads
    const response = await fetch("https://api.replicate.com/v1/uploads", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_name,
        content_type
      }),
    });

    const data = await response.json();
    console.log("📤 Replicate upload response:", data);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const upload_url = data.upload_url;
    const serving_url =
      data.serving_url ||
      data.url ||
      data.output_url;

    if (!upload_url || !serving_url) {
      console.error("⚠️ upload_url / serving_url missing:", data);
      return res.status(500).json({ message: "Invalid upload response" });
    }

    return res.status(200).json({ upload_url, serving_url });
  } catch (err) {
    console.error("🔥 upload error:", err);
    return res.status(500).json({ message: err.message });
  }
}
