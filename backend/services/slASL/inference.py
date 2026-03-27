#inference.py
'''
import pickle
import cv2
import mediapipe as mp
import numpy as np
import tempfile

# Load model and label encoder
MODEL_PATH = "backend/services/slASL/model.pickle"
ENCODER_PATH = "backend/services/slASL/label_encoder.pickle"

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)["model"]

with open(ENCODER_PATH, "rb") as f:
    le = pickle.load(f)

# Initialize mediapipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1)
mp_drawing = mp.solutions.drawing_utils


def predict_sign(file):
    # Save uploaded image temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(file.file.read())
        temp_path = tmp.name

    image = cv2.imread(temp_path)
    if image is None:
        return {"error": "Invalid image"}

    H, W, _ = image.shape
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(image_rgb)

    if not results.multi_hand_landmarks:
        return {"prediction": "No hand detected"}

    for hand_landmarks in results.multi_hand_landmarks:
        data_aux = []
        for lm in hand_landmarks.landmark:
            data_aux.extend([lm.x, lm.y])

        prediction_encoded = model.predict([np.asarray(data_aux)])[0]
        predicted_char = le.inverse_transform([prediction_encoded])[0]

        return {"prediction": predicted_char}

    return {"prediction": "No sign detected"}
'''


# inference.py

import os
import pickle
import cv2
import mediapipe as mp
import numpy as np
import tempfile
import requests

# =========================

# PATHS

# =========================

MODEL_PATH = "backend/services/slASL/model.pickle"
ENCODER_PATH = "backend/services/slASL/label_encoder.pickle"

# Google Drive direct download link

MODEL_URL = "https://drive.google.com/uc?export=download&id=1b8nxBzY2f2Ld2au0VEfZTZvQyur8kTja"

# =========================

# DOWNLOAD MODEL IF MISSING

# =========================

def download_model():
    if not os.path.exists(MODEL_PATH):
        print("Downloading model from Google Drive...")


        # Ensure directory exists
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

        response = requests.get(MODEL_URL, stream=True)
        if response.status_code != 200:
            raise Exception("Failed to download model from Google Drive")

        # Handle large file properly
        with open(MODEL_PATH, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

        print("Model downloaded successfully!")


# =========================

# LOAD MODEL & ENCODER

# =========================

download_model()

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)["model"]

with open(ENCODER_PATH, "rb") as f:
    le = pickle.load(f)

# =========================

# MEDIAPIPE INIT

# =========================

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1)
mp_drawing = mp.solutions.drawing_utils

# =========================

# PREDICTION FUNCTION

# =========================

def predict_sign(file):
    # Save uploaded image temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(file.file.read())
        temp_path = tmp.name


    image = cv2.imread(temp_path)
    if image is None:
        return {"error": "Invalid image"}

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(image_rgb)

    if not results.multi_hand_landmarks:
        return {"prediction": "No hand detected"}

    for hand_landmarks in results.multi_hand_landmarks:
        data_aux = []
        for lm in hand_landmarks.landmark:
            data_aux.extend([lm.x, lm.y])

        prediction_encoded = model.predict([np.asarray(data_aux)])[0]
        predicted_char = le.inverse_transform([prediction_encoded])[0]

        return {"prediction": predicted_char}

    return {"prediction": "No sign detected"}

