document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('prompt-input');
  const generateButton = document.getElementById('generate-button');
  const modelSelect = document.getElementById('model-select');
  const ratioSelect = document.getElementById('ratio-select');
  const uploadInput = document.getElementById('image-upload');
  const addToInputToggle = document.getElementById('add-to-input-toggle');
  const resultContainer = document.getElementById('result-container');
  const uploadStatus = document.getElementById('upload-status');

  let uploadedUrls = [];
  let lastGeneratedUrls = [];

  // Cloudinary 익명 업로드용 (테스트 계정)
  const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/demo/image/upload";
  const CLOUDINARY_PRESET = "docs_upload_example_us_preset";

  const MODEL_RATIOS = {
    "google/imagen-4-fast": ["1:1", "4:3", "3:2", "16:9"],
    "google/nano-banana": ["1:1"],
    "bytedance/seedream-4": ["1:1", "4:3", "3:4", "16:9"]
  };

  modelSelect.addEventListener('change', () => {
    const selectedModel = modelSelect.value;
    ratioSelect.innerHTML = "";
    MODEL_RATIOS[selectedModel].forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      ratioSelect.appendChild(opt);
    });
  });

  // Cloudinary 업로드
  uploadInput.addEventListener('change', async (e) => {
    const files = e.target.files;
    uploadedUrls = [];
    uploadStatus.textContent = "이미지 업로드 중...";

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_PRESET);

      const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formData });
      const data = await res.json();

      if (data.secure_url) uploadedUrls.push(data.secure_url);
    }

    uploadStatus.textContent = `${uploadedUrls.length}개 이미지 업로드 완료`;
  });

  generateButton.addEventListener('click', async () => {
    const promptText = promptInput.value.trim();
    const model = modelSelect.value;
    const aspect = ratioSelect.value;

    if (!promptText) return alert("프롬프트를 입력하세요.");

    let imageUrls = [...uploadedUrls];
    if (addToInputToggle.checked && lastGeneratedUrls.length > 0)
      imageUrls.push(...lastGeneratedUrls);

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          model,
          aspect_ratio: aspect,
          imageUrls
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "API 오류 발생");

      resultContainer.innerHTML = "";
      lastGeneratedUrls = data.imageUrls;

      data.imageUrls.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.width = 512;

        const dl = document.createElement("a");
        dl.href = url;
        dl.download = "result.jpg";
        dl.textContent = "다운로드";

        const div = document.createElement("div");
        div.appendChild(img);
        div.appendChild(document.createElement("br"));
        div.appendChild(dl);
        resultContainer.appendChild(div);
      });

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  });

  function setLoading(state) {
    generateButton.disabled = state;
    generateButton.textContent = state ? "이미지 생성 중..." : "이미지 생성하기";
  }

  modelSelect.dispatchEvent(new Event('change'));
});



/*생성이미지 기반 변경 가능
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

/*
document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('prompt-input');
  const generateButton = document.getElementById('generate-button');
  const resultImage = document.getElementById('result-image');
  const modelSelect = document.getElementById('model-select');
  const modelInfo = document.getElementById('model-info');
  const ratioSelect = document.getElementById('ratio-select');
  const ratioInfo = document.getElementById('ratio-info');

  // 모델별 가격 정보
  const MODEL_INFO = {
    "google/imagen-4-fast": "Google Imagen 4 Fast — 약 $0.02(한화 약 28.9원) / 빠른 속도, 보통 화질",
    "google/nano-banana": "Google Nano Banana — 약 $0.039(한화 약 56.36원) / 고품질, 이미지 편집 지원 (Gemini 2.5)",
    "bytedance/seedream-4": "Bytedance Seedream 4 — 약 $0.03(한화 약 43.35원) / 4K 고화질 이미지 생성"
  };

  // 모델별 지원 비율 목록
  const MODEL_RATIOS = {
    "google/imagen-4-fast": ["1:1", "4:3", "3:2", "16:9"],
    "google/nano-banana": ["1:1"],
    "bytedance/seedream-4": ["1:1", "4:3", "3:4", "16:9"]
  };

  // 모델 변경 시 자동으로 정보 및 비율 목록 갱신
  modelSelect.addEventListener('change', () => {
    const selectedModel = modelSelect.value;
    modelInfo.textContent = MODEL_INFO[selectedModel] || "모델 정보를 불러오는 중...";

    // 지원 비율 리스트 초기화
    ratioSelect.innerHTML = "";
    MODEL_RATIOS[selectedModel].forEach(ratio => {
      const option = document.createElement('option');
      option.value = ratio;
      option.textContent = ratio;
      ratioSelect.appendChild(option);
    });

    ratioInfo.textContent = `지원 비율: ${MODEL_RATIOS[selectedModel].join(", ")}`;
  });

  // 페이지 처음 로드될 때 기본 모델 정보 표시
  modelSelect.dispatchEvent(new Event('change'));

  // 이미지 생성 처리
  generateButton.addEventListener('click', handleImageGeneration);

  async function handleImageGeneration() {
    const promptText = promptInput.value;
    const selectedModel = modelSelect.value;
    const selectedRatio = ratioSelect.value;

    if (!promptText) {
      alert('프롬프트를 입력해주세요!');
      return;
    }

    setLoadingState(true);

    try {
      // 백엔드 호출 시 model, ratio 함께 전달
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          model: selectedModel,
          aspect_ratio: selectedRatio
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API 요청 실패');
      }

      const data = await response.json();
      resultImage.src = data.imageUrl;

    } catch (error) {
      console.error('처리 중 에러 발생:', error);
      alert(error.message);
    } finally {
      setLoadingState(false);
    }
  }

  function setLoadingState(isLoading) {
    if (isLoading) {
      generateButton.textContent = '이미지 생성 중...';
      generateButton.disabled = true;
      resultImage.src = "";
    } else {
      generateButton.textContent = '이미지 생성하기';
      generateButton.disabled = false;
    }
  }
});
*/

/* Start Code
document.addEventListener('DOMContentLoaded', () => {

    const promptInput = document.getElementById('prompt-input');
    const generateButton = document.getElementById('generate-button');
    const resultImage = document.getElementById('result-image');

    generateButton.addEventListener('click', handleImageGeneration);

    async function handleImageGeneration() {
        const promptText = promptInput.value;
        if (!promptText) {
            alert('프롬프트를 입력해주세요!');
            return;
        }

        setLoadingState(true);

        try {
            // '백엔드'(/api/generate)를 호출
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: promptText }) // 프롬프트만 백엔드로 전송
            });
            // --------------------------

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'API 요청 실패');
            }

            // 백엔드가 Replicate에서 받아온 최종 결과를 JSON으로 전달
            const data = await response.json();
            
            // 백엔드가 준 이미지 URL을 화면에 표시
            resultImage.src = data.imageUrl;

        } catch (error) {
            console.error('처리 중 에러 발생:', error);
            alert(error.message);
        } finally {
            setLoadingState(false);
        }
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            generateButton.textContent = '이미지 생성 중...';
            generateButton.disabled = true;
            resultImage.src = "";
        } else {
            generateButton.textContent = '이미지 생성하기';
            generateButton.disabled = false;
        }
    }
});
*/