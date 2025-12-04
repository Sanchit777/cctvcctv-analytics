import cv2
import numpy as np
import os

# Paths to model files
from download_models import download_all_models

# Paths to model files
def get_weights_dir():
    # Check for local weights first (development)
    local_weights = os.path.join(os.path.dirname(__file__), "weights")
    if os.path.exists(local_weights) and any(os.scandir(local_weights)):
        return local_weights
    
    # Fallback to /tmp for serverless (production)
    tmp_weights = "/tmp/weights"
    if not os.path.exists(tmp_weights) or not any(os.scandir(tmp_weights)):
        print("Downloading models to /tmp...")
        download_all_models(tmp_weights)
    return tmp_weights

WEIGHTS_DIR = get_weights_dir()

FACE_PROTO = os.path.join(WEIGHTS_DIR, "face_deploy.prototxt")
FACE_MODEL = os.path.join(WEIGHTS_DIR, "face_net.caffemodel")

AGE_PROTO = os.path.join(WEIGHTS_DIR, "age_deploy.prototxt")
AGE_MODEL = os.path.join(WEIGHTS_DIR, "age_net.caffemodel")

GENDER_PROTO = os.path.join(WEIGHTS_DIR, "gender_deploy.prototxt")
GENDER_MODEL = os.path.join(WEIGHTS_DIR, "gender_net.caffemodel")

# Mean values for model normalization
MODEL_MEAN_VALUES = (78.4263377603, 87.7689143744, 114.895847746)

# Categories
AGE_LIST = ['(0-2)', '(4-6)', '(8-12)', '(15-20)', '(25-32)', '(38-43)', '(48-53)', '(60-100)']
GENDER_LIST = ['Male', 'Female']

class Detector:
    def __init__(self):
        print("Loading models...")
        self.face_net = cv2.dnn.readNet(FACE_MODEL, FACE_PROTO)
        self.age_net = cv2.dnn.readNet(AGE_MODEL, AGE_PROTO)
        self.gender_net = cv2.dnn.readNet(GENDER_MODEL, GENDER_PROTO)
        print("Models loaded.")

    def detect_and_predict(self, frame):
        height, width = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(frame, 1.0, (300, 300), [104, 117, 123], False, False)
        self.face_net.setInput(blob)
        detections = self.face_net.forward()

        results = [] # For stats

        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence > 0.7:
                x1 = int(detections[0, 0, i, 3] * width)
                y1 = int(detections[0, 0, i, 4] * height)
                x2 = int(detections[0, 0, i, 5] * width)
                y2 = int(detections[0, 0, i, 6] * height)
                
                # Extract face ROI
                face_roi = frame[max(0, y1-15):min(y2+15, height), max(0, x1-15):min(x2+15, width)]
                
                if face_roi.size == 0:
                    continue
                    
                # Gender Prediction
                gender_blob = cv2.dnn.blobFromImage(face_roi, 1.0, (227, 227), MODEL_MEAN_VALUES, swapRB=False)
                self.gender_net.setInput(gender_blob)
                gender_preds = self.gender_net.forward()
                gender = GENDER_LIST[gender_preds[0].argmax()]
                
                # Age Prediction
                self.age_net.setInput(gender_blob)
                age_preds = self.age_net.forward()
                age = AGE_LIST[age_preds[0].argmax()]
                
                label = f"{gender}, {age}"
                results.append({'gender': gender, 'age': age, 'box': [x1, y1, x2, y2]})

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, label, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2, cv2.LINE_AA)

        return frame, results
