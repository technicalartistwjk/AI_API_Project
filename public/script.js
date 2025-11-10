document.addEventListener('DOMContentLoaded', () => {
  const modelSelect = document.getElementById('model-select');
  const ratioSelect = document.getElementById('ratio-select');
  const promptInput = document.getElementById('prompt-input');
  const generateButton = document.getElementById('generate-button');
  const resultContainer = document.getElementById('result-container');
  const downloadButton = document.getElementById('download-button');
  const imageUpload = document.getElementById('image-upload');
  const addToInputToggle = document.getElementById('add-to-input-toggle');
  const formatSelect = document.getElementById('format-select');
  const imageCount = document.getElementById('image-count');

  let generatedImages = [];
  let autoAddedImage = null;

  // [업로드 헬퍼]
  async function uploadFileAndGetUrl(file) {
    console.log("📤 업로드 요청:", file.name);

    const uploadRequestRes = await fetch('/api/request_upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_name: file.name,
        content_type: file.type,
      }),
    });

    if (!uploadRequestRes.ok) {
      throw new Error(`업로드 URL 요청 실패: ${file.name}`);
    }

    const { upload_url, serving_url } = await uploadRequestRes.json();
    if (!upload_url || !serving_url)
      throw new Error("upload_url/serving_url 누락됨");

    console.log("⬆️ 파일 업로드 중:", serving_url);
    const uploadRes = await fetch(upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!uploadRes.ok) throw new Error(`파일 업로드 실패: ${file.name}`);
    return serving_url;
  }

  // [이미지 생성]
  async function handleGenerate() {
    const prompt = promptInput.value.trim();
    const model = modelSelect.value;
    const aspect_ratio = ratioSelect.value;
    const output_format = formatSelect.value;
    const count = parseInt(imageCount.value);
    if (!prompt) {
      alert("프롬프트를 입력해주세요!");
      return;
    }

    resultContainer.innerHTML = "";
    downloadButton.disabled = true;
    generateButton.disabled = true;
    generateButton.textContent = "🚀 업로드 중...";

    try {
      const imageUrls = [];

      // 이전 결과 이미지 추가
      if (addToInputToggle.checked && autoAddedImage) {
        imageUrls.push(autoAddedImage);
      }

      // 새 이미지 업로드
      const files = Array.from(imageUpload.files);
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFileAndGetUrl(files[i]);
        imageUrls.push(url);
        generateButton.textContent = `업로드 중 (${i + 1}/${files.length})...`;
      }

      // 모델 실행
      generateButton.textContent = "🤖 Replicate 모델 실행 중...";
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model,
          aspect_ratio,
          output_format,
          imageCount: count,
          imageUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "API 오류");

      // 결과 표시
      const urls = data.imageUrls || [data.imageUrl];
      generatedImages = urls;
      autoAddedImage = urls[0];
      resultContainer.innerHTML = "";
      urls.forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
        img.width = 512;
        resultContainer.appendChild(img);
      });

      downloadButton.disabled = false;
      generateButton.textContent = "✅ 완료";
    } catch (err) {
      console.error("❌ handleGenerate Error:", err);
      resultContainer.innerHTML = `<p style="color:red;">오류: ${err.message}</p>`;
      alert(err.message);
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = "이미지 생성하기";
    }
  }

  async function handleDownload() {
    if (generatedImages.length === 0) return;
    if (generatedImages.length === 1) {
      const link = document.createElement("a");
      link.href = generatedImages[0];
      link.download = "generated_image.jpg";
      link.click();
    } else {
      const zip = new JSZip();
      let i = 1;
      for (const url of generatedImages) {
        const blob = await fetch(url).then(r => r.blob());
        zip.file(`image_${i++}.jpg`, blob);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "generated_images.zip";
      a.click();
    }
  }

  generateButton.addEventListener('click', handleGenerate);
  downloadButton.addEventListener('click', handleDownload);
});


/*생성이미지 기반 변경 가능*/
/*
document.addEventListener('DOMContentLoaded', () => {
  const modelSelect = document.getElementById('model-select');
  const ratioSelect = document.getElementById('ratio-select');
  const modelInfo = document.getElementById('model-info');
  const ratioInfo = document.getElementById('ratio-info');
  const promptInput = document.getElementById('prompt-input');
  const generateButton = document.getElementById('generate-button');
  const resultContainer = document.getElementById('result-container');
  const downloadButton = document.getElementById('download-button');
  const imageUpload = document.getElementById('image-upload');
  const addToInputToggle = document.getElementById('add-to-input-toggle');
  const formatSelect = document.getElementById('format-select');
  const imageCount = document.getElementById('image-count');
  const countInfo = document.getElementById('count-info');

  let autoAddedImage = null;
  let generatedImages = [];

  const MODEL_INFO = {
    "google/imagen-4-fast": "Google Imagen 4 Fast — 약 $0.02(28.9원) / 빠른 속도, 보통 화질",
    "google/nano-banana": "Google Nano Banana — 약 $0.039(56.36원) / 고품질, 이미지 편집 지원 (Gemini 2.5)",
    "bytedance/seedream-4": "Bytedance Seedream 4 — 약 $0.03(43.35원) / 4K 고화질 이미지 생성"
  };

  const MODEL_RATIOS = {
    "google/imagen-4-fast": ["1:1", "4:3", "3:2", "16:9"],
    "google/nano-banana": ["1:1", "4:3", "3:4", "16:9", "9:16"],
    "bytedance/seedream-4": ["1:1", "4:3", "3:4", "16:9"]
  };

  const MULTI_IMAGE_SUPPORT = {
    "google/imagen-4-fast": false,
    "google/nano-banana": true,
    "bytedance/seedream-4": true
  };

  modelSelect.addEventListener('change', () => {
    const selectedModel = modelSelect.value;
    modelInfo.textContent = MODEL_INFO[selectedModel];

    ratioSelect.innerHTML = "";
    MODEL_RATIOS[selectedModel].forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      ratioSelect.appendChild(opt);
    });
    ratioInfo.textContent = `지원 비율: ${MODEL_RATIOS[selectedModel].join(", ")}`;

    const disableImageInput = selectedModel === "google/imagen-4-fast";
    imageUpload.disabled = disableImageInput;
    addToInputToggle.disabled = disableImageInput;
    document.getElementById("image-upload-section").style.opacity = disableImageInput ? "0.5" : "1.0";
    document.getElementById("add-to-input-container").style.opacity = disableImageInput ? "0.5" : "1.0";

    const supportsMulti = MULTI_IMAGE_SUPPORT[selectedModel];
    imageCount.disabled = !supportsMulti;
    countInfo.textContent = supportsMulti ? "최대 5장까지 생성 가능" : "이 모델은 단일 이미지만 생성 가능합니다.";
  });

  modelSelect.dispatchEvent(new Event('change'));

  generateButton.addEventListener('click', handleGenerate);
  downloadButton.addEventListener('click', handleDownload);

  async function handleGenerate() {
    const prompt = promptInput.value;
    const model = modelSelect.value;
    const aspect_ratio = ratioSelect.value;
    const output_format = formatSelect.value;
    const count = parseInt(imageCount.value);
    if (!prompt) {
      alert("프롬프트를 입력해주세요!");
      return;
    }

    resultContainer.innerHTML = "";
    generatedImages = [];
    downloadButton.disabled = true;
    generateButton.disabled = true;
    generateButton.textContent = "이미지 생성 중...";

    const imageUrls = [];
    if (addToInputToggle.checked && autoAddedImage) {
      imageUrls.push(autoAddedImage);
    }
    if (!imageUpload.disabled && imageUpload.files.length > 0) {
      for (const file of imageUpload.files) {
        const base64 = await fileToBase64(file);
        imageUrls.push(base64);
      }
    }

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model, aspect_ratio, output_format, imageCount: count, imageUrls })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "API 오류");
      return;
    }

    const urls = data.imageUrls || [data.imageUrl];
    urls.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.width = 512;
      resultContainer.appendChild(img);
    });
    generatedImages = urls;
    autoAddedImage = urls[0];
    downloadButton.disabled = false;
    generateButton.textContent = "이미지 생성하기";
    generateButton.disabled = false;
  }

  async function handleDownload() {
    if (generatedImages.length === 1) {
      const link = document.createElement("a");
      link.href = generatedImages[0];
      link.download = "generated_image.jpg";
      link.click();
    } else if (generatedImages.length > 1) {
      const zip = new JSZip();
      let i = 1;
      for (const url of generatedImages) {
        const blob = await fetch(url).then(r => r.blob());
        zip.file(`image_${i++}.jpg`, blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "generated_images.zip";
      link.click();
    }
  }

  function fileToBase64(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }
});
*/