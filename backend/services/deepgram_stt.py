import httpx
import os
from dotenv import load_dotenv

load_dotenv()
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

async def transcribe_audio(file_path: str, source_lang: str = "en"):
    url = "https://api.deepgram.com/v1/listen"
    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": "audio/wav"
    }

    with open(file_path, "rb") as f:
        audio_data = f.read()

    async with httpx.AsyncClient(timeout=None) as client:
        response = await client.post(
            url,
            headers=headers,
            params={"language": source_lang},
            content=audio_data
        )

    data = response.json()
    print("Deepgram response:", data)

    if "results" in data:
        return data["results"]["channels"][0]["alternatives"][0]["transcript"]
    else:
        return f"Deepgram error: {data}"
