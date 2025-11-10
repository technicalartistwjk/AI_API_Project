// /api/upload.js
// Replicate 파일 업로드 (서명 URL 발급 + PUT 업로드) 최종 안정판
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // 1) 프론트에서 보내는 헤더(네가 쓰던 방식): x-file-name / x-content-type
    //    (만약 JSON으로 보내고 싶다면 req.body.file_name / content_type도 수용)
    const headerFileName = req.headers["x-file-name"];
    const headerContentType = req.headers["x-content-type"];

    const body = req.body && typeof req.body === "object" ? req.body : {};
    const bodyFileName = body.file_name;
    const bodyContentType = body.content_type;

    const fileName = headerFileName || bodyFileName;
    const contentType = headerContentType || bodyContentType;

    if (!fileName || !contentType) {
      return res.status(400).json({
        message:
          "file_name / content_type 정보가 없습니다. (x-file-name / x-content-type 헤더 또는 JSON 바디로 전달하세요.)",
      });
    }

    // 2) Replicate 서명 URL 발급 (정확한 엔드포인트/키 이름)
    const payload = JSON.stringify({
      file_name: fileName,     // ✅ 정확: file_name
      content_type: contentType,
    });

    const createRes = await fetch("https://api.replicate.com/v1/files", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`, // ✅ Token 스킴
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload).toString(), // ✅ 일부 런타임에서 필수
      },
      body: payload,
    });

    const createData = await createRes.json().catch(() => ({}));

    // 디버깅 로그 (Vercel Functions Logs에서 확인)
    console.log("[upload:create.res]", {
      ok: createRes.ok,
      status: createRes.status,
      hasUploadUrl: !!createData?.upload_url,
      detail: createData?.detail,
      error: createData?.error,
    });

    if (!createRes.ok || !createData?.upload_url || !createData?.serving_url) {
      return res.status(createRes.status || 500).json({
        message:
          createData?.detail ||
          createData?.error ||
          "Failed to get Replicate upload URL",
      });
    }

    const { upload_url, serving_url } = createData;

    // 3) 요청 바디에서 파일 읽기 (프런트가 Blob을 그대로 body로 보냄)
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    if (!fileBuffer?.length) {
      return res.status(400).json({
        message:
          "업로드할 파일 데이터가 비어 있습니다. (브라우저 fetch에 body로 Blob을 그대로 보내야 합니다.)",
      });
    }

    // 4) Replicate 서명 URL로 PUT 업로드
    const putRes = await fetch(upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
      },
      body: fileBuffer,
    });

    // PUT 응답 본문은 대부분 비어 있음 → 상태만 확인
    if (!putRes.ok) {
      const errText = await putRes.text().catch(() => "");
      console.error("[upload:put.error]", putRes.status, errText);
      return res
        .status(500)
        .json({ message: "File upload to Replicate failed" });
    }

    // 5) 최종 공개 URL 반환
    console.log("[upload:success]", { serving_url });
    return res.status(200).json({ url: serving_url });
  } catch (err) {
    console.error("[upload:handler.error]", err);
    return res
      .status(500)
      .json({ message: err?.message || "Upload handler error" });
  }
}
