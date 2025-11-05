document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('prompt-input');
  const generateButton = document.getElementById('generate-button');
  const resultImage = document.getElementById('result-image');
  const modelSelect = document.getElementById('model-select');
  const modelInfo = document.getElementById('model-info');
  const ratioSelect = document.getElementById('ratio-select');
  const ratioInfo = document.getElementById('ratio-info');
  const addToInputToggle = document.getElementById('add-to-input-toggle');
  const addContainer = document.getElementById('add-to-input-container');

  let autoAddedImage = null; // 자동 저장 이미지 (토글용)

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

  // 모델 변경 시 라벨, 비율, 이미지 입력 토글 상태 갱신
  modelSelect.addEventListener('change', () => {
    const selectedModel = modelSelect.value;
    modelInfo.textContent = MODEL_INFO[selectedModel] || "";

    // 비율 드롭다운 갱신
    ratioSelect.innerHTML = "";
    MODEL_RATIOS[selectedModel].forEach(ratio => {
      const option = document.createElement('option');
      option.value = ratio;
      option.textContent = ratio;
      ratioSelect.appendChild(option);
    });
    ratioInfo.textContent = `지원 비율: ${MODEL_RATIOS[selectedModel].join(", ")}`;

    // ✅ 이미지 입력 가능 여부에 따라 토글 비활성화
    if (selectedModel === "google/imagen-4-fast") {
      addToInputToggle.checked = false;
      addToInputToggle.disabled = true;
      addContainer.style.opacity = "0.5";
      addContainer.title = "이 모델은 이미지 추가를 지원하지 않습니다.";
    } else {
      addToInputToggle.disabled = false;
      addContainer.style.opacity = "1.0";
      addContainer.title = "";
    }
  });

  // 페이지 초기 상태 세팅
  modelSelect.dispatchEvent(new Event('change'));

  // 버튼 클릭 시 이미지 생성
  generateButton.addEventListener('click', handleImageGeneration);

  async function handleImageGeneration() {
    const promptText = promptInput.value;
    const selectedModel = modelSelect.value;
    const selectedRatio = ratioSelect.value;

    if (!promptText) {
      alert('프롬프트를 입력해주세요!');
      return;
    }

    let imageUrls = [];

    // ✅ Fast 모델은 이미지 추가 완전 차단
    if (selectedModel !== "google/imagen-4-fast") {
      if (addToInputToggle && addToInputToggle.checked && autoAddedImage) {
        imageUrls.push(autoAddedImage);
      }
    }

    setLoadingState(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          model: selectedModel,
          aspect_ratio: selectedRatio,
          imageUrls
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API 요청 실패');
      }

      const data = await response.json();
      resultImage.src = data.imageUrl;
      autoAddedImage = data.imageUrl; // ✅ 다음 요청에 자동 포함될 이미지 저장

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