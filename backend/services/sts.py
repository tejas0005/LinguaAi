from gtts import gTTS
import tempfile
import os

async def speech_to_speech(input_path: str, source_lang: str, target_lang: str):
    from backend.services.deepgram_stt import transcribe_audio
    from backend.services.translate import translate_text
    from backend.services.tts import text_to_speech

    # Step 1: STT
    transcript = await transcribe_audio(input_path, source_lang)

    # Step 2: Translate
    translated = await translate_text(transcript, target_lang, source_lang)

    # Step 3: TTS
    return text_to_speech(translated, target_lang)
