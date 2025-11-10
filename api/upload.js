// /api/upload.js
// ✅ Works on Vercel (no local writes, uses Replicate upload API)

export const config = {
  api: {
    bodyParser: false, // 파일 스트림 직접 받기
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // 🔹 파일 이름 및 타입
    const fileName = req.headers["x-file-name"] || `upload_${Date.now()}.jpg`;
    const contentType = req.headers["x-content-type"] || "image/jpeg";

    // 🔹 Replicate 업로드용 URL 요청
    const uploadReq = await fetch("https://api.replicate.com/v1/uploads", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_name: fileName,
        content_type: contentType,
      }),
    });

    const uploadData = await uploadReq.json();
    if (!uploadReq.ok) {
      console.error("❌ Failed to request Replicate upload URL:", uploadData);
      return res.status(500).json(uploadData);
    }

    const { upload_url, serving_url } = uploadData;
    if (!upload_url || !serving_url) {
      throw new Error("Replicate upload response missing URL fields");
    }

    // 🔹 클라이언트가 보낸 파일을 그대로 Replicate로 전송
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const fileBuffer = Buffer.concat(chunks);

    const putRes = await fetch(upload_url, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: fileBuffer,
    });

    if (!putRes.ok) {
      console.error("❌ Failed to PUT file to Replicate storage:", await putRes.text());
      return res.status(500).json({ message: "File upload to Replicate failed" });
    }

    // ✅ 성공적으로 업로드 완료
    console.log("✅ Uploaded to Replicate:", serving_url);
    return res.status(200).json({ url: serving_url });
  } catch (err) {
    console.error("🔥 Upload handler error:", err);
    return res.status(500).json({ message: err.message });
  }
}
