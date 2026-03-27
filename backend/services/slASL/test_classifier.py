#test_classifier

import pickle
import cv2
import mediapipe as mp
import numpy as np

# --- Configuration ---
MODEL_FILE = 'model.pickle'
LABEL_ENCODER_FILE = 'label_encoder.pickle'

# --- Load Model and Encoder ---
with open(MODEL_FILE, 'rb') as f:
    model_dict = pickle.load(f)
model = model_dict['model']

with open(LABEL_ENCODER_FILE, 'rb') as f:
    le = pickle.load(f)
    
# We will use the LabelEncoder to get the class names from the model's prediction
# The map is now dynamic based on your dataset!

# --- Initialize Real-time Components ---
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

hands = mp_hands.Hands(static_image_mode=False, min_detection_confidence=0.5, max_num_hands=1)
cap = cv2.VideoCapture(0) # 0 for default webcam, adjust if necessary

# --- Real-Time Loop ---
while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1) # Flip for mirror view
    H, W, _ = frame.shape
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = hands.process(frame_rgb)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            data_aux = []
            x_ = []
            y_ = []

            # Extract normalized coordinates (0 to 1) and actual pixel coordinates
            for i in range(len(hand_landmarks.landmark)):
                x = hand_landmarks.landmark[i].x
                y = hand_landmarks.landmark[i].y
                data_aux.append(x)
                data_aux.append(y)
                x_.append(x * W) # Scaled to screen width
                y_.append(y * H) # Scaled to screen height

            # --- Draw Landmarks ---
            mp_drawing.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS,
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style()
            )

            # --- Model Prediction ---
            # Reshape features and predict the encoded class number
            prediction_encoded = model.predict(np.asarray([data_aux]))[0]
            
            # Use the LabelEncoder to get the actual sign letter (e.g., 'A')
            predicted_char = le.inverse_transform([prediction_encoded])[0]

            # --- Bounding Box & Text Display ---
            # Calculate pixel coordinates for the bounding box
            x1 = int(min(x_)) - 10 # Add padding
            y1 = int(min(y_)) - 10
            x2 = int(max(x_)) + 10
            y2 = int(max(y_)) + 10
            
            # Draw the bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 0), 4) 
            
            # Draw the predicted character label
            cv2.putText(
                frame,
                predicted_char,
                (x1, y1 - 10), 
                cv2.FONT_HERSHEY_SIMPLEX,
                1.3,
                (255, 255, 255), 
                3,
                cv2.LINE_AA
            )

    # Display the frame
    cv2.imshow('Sign Language Detector', frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# --- Cleanup ---
cap.release()
cv2.destroyAllWindows()
print("Detector stopped.")