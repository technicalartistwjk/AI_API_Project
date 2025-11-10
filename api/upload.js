// /api/upload.js
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // 1️⃣ multipart/form-data 파싱
    const form = formidable({ multiples: false });
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ message: "파일이 없습니다." });
    }

    // 2️⃣ Replicate 업로드
    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.filepath));

    const uploadRes = await fetch("https://api.replicate.com/v1/uploads", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
      },
      body: formData,
    });

    const uploadData = await uploadRes.json().catch(() => ({}));

    console.log("[upload:response]", uploadData);

    if (!uploadRes.ok || !uploadData.serving_url) {
      return res.status(uploadRes.status || 500).json({
        message: uploadData.detail || uploadData.error || "Upload failed",
      });
    }

    // ✅ 최종 URL 반환
    return res.status(200).json({ url: uploadData.serving_url });
  } catch (err) {
    console.error("[upload:error]", err);
    return res.status(500).json({ message: err.message });
  }
}
