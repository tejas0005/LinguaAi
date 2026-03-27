from gtts import gTTS
import tempfile
import os

async def text_to_speech(text: str, lang: str = "en"):
    """
    Convert text to speech using gTTS (Google Text-to-Speech).
    Saves the output as an mp3 file and returns its path.
    """
    try:
        # Generate speech
        tts = gTTS(text=text, lang=lang)

        # Save to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            file_path = tmp.name
            tts.save(file_path)

        return file_path

    except Exception as e:
        raise Exception(f"TTS generation failed: {str(e)}")
