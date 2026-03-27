# backend/services/translate.py
import httpx
import os
from dotenv import load_dotenv

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

async def translate_text(text: str, target_lang: str = "en", source_lang: str = "auto"):
    """
    Translate text using OpenRouter (GPT model).
    """
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    # Make sure both source and target are clear to the model
    payload = {
        "model": "openai/gpt-4o-mini",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a precise translation engine. "
                    f"Translate from {source_lang} to {target_lang}. "
                    "Return only the translated text without explanations."
                )
            },
            {"role": "user", "content": text}
        ]
    }

    async with httpx.AsyncClient(timeout=None) as client:
        response = await client.post(url, headers=headers, json=payload)

    data = response.json()
    print("OpenRouter response:", data)

    if "choices" in data:
        return data["choices"][0]["message"]["content"].strip()
    else:
        return f"OpenRouter error: {data}"
