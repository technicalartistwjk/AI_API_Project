// /api/upload.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const fileName = req.headers["x-file-name"];
    const contentType = req.headers["x-content-type"];
    if (!fileName || !contentType) {
      return res.status(400).json({ message: "Missing headers (x-file-name, x-content-type)" });
    }

    // 1️⃣ Replicate 업로드 URL 요청
    const createRes = await fetch("https://api.replicate.com/v1/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_name: fileName,      // ✅ 여기 중요! filename ❌ → file_name ✅
        content_type: contentType,
      }),
    });

    const createData = await createRes.json().catch(() => ({}));

    if (!createRes.ok || !createData.upload_url) {
      console.error("❌ Failed to get Replicate upload URL:", createData);
      return res
        .status(createRes.status)
        .json({ message: createData?.detail || "Failed to get upload URL" });
    }

    const { upload_url, serving_url } = createData;

    // 2️⃣ 클라이언트 파일을 Replicate로 PUT 업로드
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const putRes = await fetch(upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: buffer,
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      console.error("❌ Upload PUT failed:", errText);
      return res.status(500).json({ message: "File upload to Replicate failed" });
    }

    console.log("✅ File uploaded successfully:", serving_url);
    return res.status(200).json({ url: serving_url });
  } catch (err) {
    console.error("🔥 Upload handler error:", err);
    return res.status(500).json({ message: err.message });
  }
}
