#create_datasets

import os
import pickle
import mediapipe as mp
import cv2

# --- Configuration ---
ROOT_DATA_DIR = './signLanguage'
TRAIN_DATA_FILE = 'train_data.pickle'
TEST_DATA_FILE = 'test_data.pickle'

# Initialize MediaPipe Hands for landmark detection
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, min_detection_confidence=0.3)

def process_directory(data_path, output_file):
    """Processes images in a given data path and saves features to a pickle file."""
    data = []
    labels = []
    
    print(f"--- Starting Feature Extraction for: {data_path} ---")

    # Iterate through each class folder (e.g., A, B, C, del)
    for class_name in sorted(os.listdir(data_path)):
        class_path = os.path.join(data_path, class_name)
        
        # Skip files or non-directory entries
        if not os.path.isdir(class_path):
            continue
            
        print(f"Processing class: {class_name}")

        # Iterate through all images in the class folder
        for img_name in os.listdir(class_path):
            if not (img_name.endswith('.jpg') or img_name.endswith('.png')):
                continue

            img_full_path = os.path.join(class_path, img_name)
            img = cv2.imread(img_full_path)
            
            # Check if image was loaded
            if img is None:
                print(f"Warning: Could not load image at {img_full_path}")
                continue
                
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = hands.process(img_rgb)

            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    data_aux = []
                    # Extract X and Y coordinates for all 21 landmarks
                    for i in range(len(hand_landmarks.landmark)):
                        x = hand_landmarks.landmark[i].x
                        y = hand_landmarks.landmark[i].y
                        data_aux.append(x)
                        data_aux.append(y)
                    
                    data.append(data_aux)
                    labels.append(class_name) # The label is the folder name (e.g., 'A')

    # --- Save Data ---
    with open(output_file, 'wb') as f:
        pickle.dump({'data': data, 'labels': labels}, f)

    print(f"Data saved successfully to {output_file}!")
    print(f"Total samples for {data_path}: {len(data)}")


# --- Run for both Train and Test directories ---
process_directory(os.path.join(ROOT_DATA_DIR, 'train'), TRAIN_DATA_FILE)
process_directory(os.path.join(ROOT_DATA_DIR, 'test'), TEST_DATA_FILE)