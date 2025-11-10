// /api/upload.js
import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";

export const config = {
  api: {
    bodyParser: false, // FormData를 직접 수신하도록 설정
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // FormData 없이 바이너리 스트림 직접 수신
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const fileName = req.headers["x-file-name"] || `upload_${Date.now()}.jpg`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fsPromises.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await fsPromises.writeFile(filePath, buffer);

    // ✅ 브라우저 접근용 URL 생성
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const publicUrl = `${baseUrl}/uploads/${encodeURIComponent(fileName)}`;

    console.log("✅ Uploaded file:", publicUrl);
    return res.status(200).json({ url: publicUrl });
  } catch (err) {
    console.error("🔥 Upload failed:", err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
}
