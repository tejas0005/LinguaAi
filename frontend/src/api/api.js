export const processAudio = async (file, sourceLang, targetLang) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("source_lang", sourceLang);
  formData.append("target_lang", targetLang);

  const response = await fetch("http://127.0.0.1:8000/process_audio/", {
    method: "POST",
    body: formData,
  });

  return await response.json();
};

export const processText = async (text, sourceLang, targetLang) => {
  const formData = new FormData();
  formData.append("text", text);
  formData.append("source_lang", sourceLang);
  formData.append("target_lang", targetLang);

  const response = await fetch("http://127.0.0.1:8000/process_text/", {
    method: "POST",
    body: formData,
  });

  return await response.json();
};


export const processTTS = async (text, sourceLang = "en", targetLang = "en") => {
  const formData = new FormData();
  formData.append("text", text);
  formData.append("source_lang", sourceLang);
  formData.append("target_lang", targetLang);

  const response = await fetch("http://127.0.0.1:8000/process_tts/", {
    method: "POST",
    body: formData,
  });

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const processSTS = async (file, sourceLang = "en", targetLang = "fr") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("source_lang", sourceLang);
  formData.append("target_lang", targetLang);

  const response = await fetch("http://127.0.0.1:8000/process_sts/", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Failed to process STS");

  return await response.json(); // ✅ return JSON with transcript + translation + audio
};


/*
export const processSignVideo = async (files, sourceLang = "en", targetLang = "fr") => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file);
    });
    formData.append("source_lang", sourceLang);
    formData.append("target_lang", targetLang);
    
    try {
        const response = await fetch("http://127.0.0.1:8000/process-sign-video/", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error processing sign video:", error);
        throw error;
    }
};
*/

// --- Sign Language (Single Frame Prediction) ---
export const predictSign = async (imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch("http://127.0.0.1:8000/predict-sign", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to predict sign.");
    }

    return await response.json(); // Expected output: { prediction: 'A' }
  } catch (error) {
    console.error("Error predicting sign:", error);
    throw error;
  }
};
