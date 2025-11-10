// /api/request_upload.js
//  Vercel 서버리스 / Edge 호환, Replicate 최신 API (2025 기준)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // ✅ Vercel 환경에서는 req.body가 문자열인 경우가 많음
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch {
      body = {};
    }

    const { file_name, content_type } = body || {};

    console.log("📦 Request body:", body);

    if (!file_name || !content_type) {
      console.error("❌ Missing parameters:", { file_name, content_type });
      return res.status(400).json({ message: 'file_name and content_type are required' });
    }

    // 최신 Replicate endpoint (uploads → files)
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

    //  Replicate 응답 확인
    const uploadData = await response.json();
    console.log("📤 Replicate response:", uploadData);

    if (!response.ok) {
      console.error("Replicate upload request failed:", uploadData);
      return res.status(500).json({
        detail: uploadData.detail || uploadData.error || 'Failed to get upload URL',
      });
    }

    //  새 구조 보정
    const uploadUrl = uploadData.upload_url;
    const servingUrl = uploadData.url || uploadData.serving_url || uploadData.output_url;

    if (!uploadUrl || !servingUrl) {
      console.error("⚠️ Invalid Replicate upload response structure:", uploadData);
      return res.status(500).json({ message: "Invalid upload URL structure" });
    }

    //  최종 성공 응답
    return res.status(200).json({
      upload_url: uploadUrl,
      serving_url: servingUrl,
    });
  } catch (err) {
    console.error("🔥 request_upload fatal error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
}
