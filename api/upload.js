// /api/upload.js
import FormData from "form-data";  // 필요한 경우 설치: npm install form-data

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
    const fileName = req.headers["x-file-name"];
    const contentType = req.headers["x-content-type"];
    if (!fileName || !contentType) {
      return res.status(400).json({
        message: "파일명(x-file-name) 또는 content-type(x-content-type) 헤더가 없습니다."
      });
    }

    // 1️⃣ signed URL 요청
    const endpoint = "https://api.replicate.com/v1/files";
    const bodyJson = JSON.stringify({
      file_name: fileName,
      content_type: contentType
    });

    const createRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyJson).toString()
      },
      body: bodyJson
    });

    const createData = await createRes.json().catch(() => ({}));
    console.log("[upload:create.res]", {
      ok: createRes.ok,
      status: createRes.status,
      detail: createData.detail,
      upload_url: createData.upload_url
    });

    if (!createRes.ok || !createData.upload_url) {
      return res.status(createRes.status || 500).json({
        message: createData.detail || "Upload URL 요청 실패"
      });
    }

    const { upload_url, serving_url } = createData;

    // 2️⃣ 파일 데이터 읽기
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);
    if (!fileBuffer.length) {
      return res.status(400).json({
        message: "파일 데이터가 비어 있습니다."
      });
    }

    // 3️⃣ 파일 PUT 업로드
    const putRes = await fetch(upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString()
      },
      body: fileBuffer
    });
    if (!putRes.ok) {
      const text = await putRes.text().catch(() => "");
      console.error("[upload:put.error]", putRes.status, text);
      return res.status(500).json({ message: "파일 업로드 실패" });
    }

    // 4️⃣ 응답
    return res.status(200).json({ url: serving_url });
  } catch (err) {
    console.error("[upload:handler.error]", err);
    return res.status(500).json({ message: err.message || "업로드 처리 오류" });
  }
}
