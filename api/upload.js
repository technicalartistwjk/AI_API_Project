// /api/upload.js
import FormData from "form-data";

/**
 * 로컬 또는 브라우저에서 받은 파일을 Replicate 업로드 API로 중계
 * - 클라이언트는 body로 실제 파일 Blob을 보냄
 * - 여기서 FormData로 다시 감싸서 Replicate에 전송
 */
export const config = {
  api: {
    bodyParser: false, // FormData로 직접 처리할 예정이므로 bodyParser 비활성화
  },
};

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

    // 요청 본문을 버퍼로 읽기
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Replicate에 멀티파트 전송 준비
    const formData = new FormData();
    formData.append("file", buffer, { filename: fileName, contentType });

    const replicateRes = await fetch("https://api.replicate.com/v1/uploads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_KEY}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const data = await replicateRes.json().catch(() => ({}));

    if (!replicateRes.ok) {
      console.error("❌ Replicate upload failed:", data);
      return res.status(replicateRes.status).json({
        message: data?.detail || "Failed to upload to Replicate",
      });
    }

    console.log("✅ Replicate upload success:", data);
    return res.status(200).json({ url: data?.serving_url });
  } catch (err) {
    console.error("🔥 Upload failed:", err);
    return res.status(500).json({ message: err.message });
  }
}
