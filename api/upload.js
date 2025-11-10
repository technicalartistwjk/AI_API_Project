// /api/upload.js
export const config = {
  api: {
    bodyParser: false, // 파일을 스트림으로 수신
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const fileName = req.headers["x-file-name"] || `upload_${Date.now()}.jpg`;
    const contentType = req.headers["x-content-type"] || "image/jpeg";

    // 브라우저가 전송한 파일 읽기
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const fileBuffer = Buffer.concat(chunks);

    // multipart/form-data 본문 생성
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: contentType });
    formData.append("file", blob, fileName);

    // Replicate API 호출
    const uploadRes = await fetch("https://api.replicate.com/v1/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`,
      },
      body: formData,
    });

    const uploadData = await uploadRes.json();
    console.log("📤 Replicate upload response:", uploadData);

    if (!uploadRes.ok) {
      return res.status(uploadRes.status).json(uploadData);
    }

    const publicUrl = uploadData.url;
    if (!publicUrl) throw new Error("No URL returned from Replicate");

    console.log("✅ Uploaded to Replicate:", publicUrl);
    return res.status(200).json({ url: publicUrl });
  } catch (err) {
    console.error("🔥 Upload error:", err);
    return res.status(500).json({ message: err.message });
  }
}
