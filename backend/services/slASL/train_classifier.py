import pickle
import numpy as np
from sklearn.preprocessing import LabelEncoder 
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# --- Configuration ---
TRAIN_DATA_FILE = 'train_data.pickle'
TEST_DATA_FILE = 'test_data.pickle'
MODEL_FILE = 'model.pickle'
LABEL_ENCODER_FILE = 'label_encoder.pickle' 

# --- Load Data Helper ---
def load_data(file_path):
    """Loads feature data (X) and labels (y) from a pickle file."""
    try:
        with open(file_path, 'rb') as f:
            data_dict = pickle.load(f)
        return np.asarray(data_dict['data']), np.asarray(data_dict['labels'])
    except FileNotFoundError:
        print(f"ERROR: Data file not found at {file_path}. Please run 1_create_datasets.py first.")
        exit()

# Load Train and Test Features/Labels
X_train, y_train = load_data(TRAIN_DATA_FILE)
X_test, y_test = load_data(TEST_DATA_FILE)

# --- Label Encoding (Convert 'A', 'B', 'C' to 0, 1, 2, ...) ---
le = LabelEncoder()
y_train_encoded = le.fit_transform(y_train)
y_test_encoded = le.transform(y_test)

# --- Model Training ---
print(f"Training on {len(X_train)} samples...")
print(f"Total classes detected: {len(le.classes_)}")

# Initialize the Random Forest Classifier
model = RandomForestClassifier(n_estimators=100)
# Train the model
model.fit(X_train, y_train_encoded)
print("Training complete.")

# --- Evaluation ---
print(f"Evaluating on {len(X_test)} test samples...")
# Make predictions
y_predict_encoded = model.predict(X_test)

# Calculate overall accuracy
score = accuracy_score(y_test_encoded, y_predict_encoded)

print(f'\nAccuracy score on dedicated Test Set: {score * 100:.2f}%')
print("\n--- Classification Report ---")

# FIX: Create a NumPy array with all possible encoded labels (0 to N-1)
# This prevents the ValueError if the test set is missing any classes.
all_encoded_labels = np.arange(len(le.classes_))

# Print the full classification report
print(classification_report(
    y_test_encoded, 
    y_predict_encoded, 
    target_names=le.classes_, 
    labels=all_encoded_labels,  # Force the report to check all classes
    zero_division=0             # Display 0 for precision/recall for missing classes
))

# --- Save Model and Label Encoder ---
# Save the trained model
with open(MODEL_FILE, 'wb') as f:
    pickle.dump({'model': model}, f)

# Save the label encoder (needed for the final real-time script)
with open(LABEL_ENCODER_FILE, 'wb') as f:
    pickle.dump(le, f)

print(f"Model saved successfully to {MODEL_FILE}")
print(f"Label Encoder saved to {LABEL_ENCODER_FILE}")