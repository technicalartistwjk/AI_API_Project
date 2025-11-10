// /api/request_upload.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { file_name, content_type } = req.body || {};
    if (!file_name || !content_type) {
      return res.status(400).json({
        message: "file_name과 content_type이 필요합니다.",
      });
    }

    const response = await fetch("https://api.replicate.com/v1/uploads", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file_name, content_type }),
    });

    const data = await response.json();
    console.log("📤 Replicate upload response:", data);

    if (!response.ok || !data.upload_url || !data.serving_url) {
      return res.status(response.status || 500).json({
        message: data.detail || "Failed to request upload URL",
      });
    }

    return res.status(200).json(data); // { upload_url, serving_url }
  } catch (error) {
    console.error("🔥 request_upload.js Error:", error);
    return res.status(500).json({ message: error.message });
  }
}
