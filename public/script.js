document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('prompt-input');
  const generateButton = document.getElementById('generate-button');
  const resultImage = document.getElementById('result-image');
  const modelSelect = document.getElementById('model-select');
  const modelInfo = document.getElementById('model-info'); // 

    const MODEL_INFO = {
    "google/imagen-4-fast": "Google Imagen 4 Fast — 약 $0.02(한화 28.9원) / 빠른 속도, 보통 화질",
    "google/nano-banana": "Google Nano Banana — 약 $0.039(한화 56.36원) / 고품질, 이미지 편집 지원 (Gemini 2.5)",
    "bytedance/seedream-4": "Bytedance Seedream 4 — 약 $0.03(한화 43.35원) / 4K 고화질 이미지 생성"
  };
  
  modelSelect.addEventListener('change', () => {
    const selectedModel = modelSelect.value;
    modelInfo.textContent = MODEL_INFO[selectedModel] || "모델 정보를 불러오는 중...";
  });

  generateButton.addEventListener('click', handleImageGeneration);

  async function handleImageGeneration() {
    const promptText = promptInput.value;
    const selectedModel = modelSelect.value;

    if (!promptText) {
      alert('프롬프트를 입력해주세요!');
      return;
    }

    setLoadingState(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          model: selectedModel
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