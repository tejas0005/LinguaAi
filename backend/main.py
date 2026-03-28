#import sys
import os
#sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from fastapi.responses import FileResponse
from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
'''from backend.services.deepgram_stt import transcribe_audio
from backend.services.translate import translate_text
from backend.services.tts import text_to_speech
from backend.services.sts import speech_to_speech
from backend.services.slASL.inference import predict_sign'''
from services.deepgram_stt import transcribe_audio
from services.translate import translate_text
from services.tts import text_to_speech
from services.sts import speech_to_speech
from services.slASL.inference import predict_sign
import tempfile
#from backend.services.sign_language.inference import predict_sign # <-- New import'
import shutil

import base64

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process_audio/")
async def process_audio(
    file: UploadFile,
    source_lang: str = Form("en"),
    target_lang: str = Form("fr")
):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    transcript = await transcribe_audio(tmp_path, source_lang)
    translated = await translate_text(transcript, target_lang, source_lang)

    return {
        "source_lang": source_lang,
        "target_lang": target_lang,
        "transcript": transcript,
        "translation": translated
    }

# ✅ New Text-to-Text Translation Endpoint
@app.post("/process_text/")
async def process_text(
    text: str = Form(...),
    source_lang: str = Form("en"),
    target_lang: str = Form("fr")
):
    translated = await translate_text(text, target_lang, source_lang)

    return {
        "source_lang": source_lang,
        "target_lang": target_lang,
        "transcript": text,
        "translation": translated
    }

# ✅ Updated Text-to-Speech Endpoint
@app.post("/process_tts/")
async def process_tts(
    text: str = Form(...),
    source_lang: str = Form("en"),
    target_lang: str = Form("en")   # decides output speech language
):
    # Translate if needed
    if source_lang != target_lang:
        text = await translate_text(text, target_lang, source_lang)

    file_path = await text_to_speech(text, target_lang)
    return FileResponse(file_path, media_type="audio/mpeg", filename="speech.mp3")
from fastapi.responses import JSONResponse
from fastapi import File
import base64

@app.post("/process_sts/")
async def process_sts(
    file: UploadFile,
    source_lang: str = Form("en"),
    target_lang: str = Form("fr")
):
    # Save uploaded audio
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # Step 1: STT
    transcript = await transcribe_audio(tmp_path, source_lang)

    # Step 2: Translate
    translated = await translate_text(transcript, target_lang, source_lang)

    # Step 3: TTS (get audio file path)
    out_path = await text_to_speech(translated, target_lang)

    # Step 4: Return JSON with audio base64
    with open(out_path, "rb") as f:
        audio_bytes = f.read()
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

    return JSONResponse({
        "transcript": transcript,
        "translation": translated,
        "translated_audio": f"data:audio/mpeg;base64,{audio_b64}"
    })
'''
# 🆕 New endpoint for processing a series of sign language video frames
@app.post("/process-sign-video/")
async def process_sign_video(files: list[UploadFile] = Form(...), source_lang: str = Form("en"), target_lang: str = Form("fr")):
    
    predicted_signs = []
    
    # Process each frame and get a prediction
    for file in files:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            tmp.write(await file.read())
            predicted_sign = predict_sign(tmp.name)
            predicted_signs.append(predicted_sign)
            os.remove(tmp.name) # Clean up the temporary file

    # Filter out "No Hand Detected" and "Hand too small" predictions
    valid_signs = [sign for sign in predicted_signs if sign and sign not in ["No Hand Detected", "Hand too small/out of bounds"]]
    
    # Group consecutive identical signs and form a sentence
    if not valid_signs:
        return {"transcript": "", "translation": "", "error": "No valid signs detected."}
        
    sentence = ""
    last_sign = ""
    for sign in valid_signs:
        if sign != last_sign:
            sentence += sign + " "
            last_sign = sign

    # Translate the sentence
    translated_text = await translate_text(sentence.strip(), target_lang, source_lang)
    
    return {
        "transcript": sentence.strip(),
        "translation": translated_text
    }
'''

@app.post("/predict-sign")
async def predict_sign_endpoint(file: UploadFile = File(...)):
    result = predict_sign(file)
    return result