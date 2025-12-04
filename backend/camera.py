import cv2
import numpy as np
import os
import time
import datetime
from detector import Detector
from database import get_db_conn, Detection
from dotenv import load_dotenv

load_dotenv()

def calculate_iou(boxA, boxB):
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0, xB - xA) * max(0, yB - yA)
    
    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

    if float(boxAArea + boxBArea - interArea) == 0:
        return 0

    iou = interArea / float(boxAArea + boxBArea - interArea)
    return iou

class CooldownManager:
    def __init__(self, cooldown_seconds=10):
        self.cooldown_seconds = cooldown_seconds
        # List of dicts: {'box': [x1,y1,x2,y2], 'timestamp': t, 'label': (gender, age)}
        self.active_sessions = []

    def should_save(self, gender, age, box):
        current_time = time.time()
        matched = False
        
        # Check against active sessions
        for session in self.active_sessions:
            iou = calculate_iou(box, session['box'])
            if iou > 0.3: # Threshold for "same person"
                # Match found!
                session['timestamp'] = current_time
                session['box'] = box # Update box to current position
                matched = True
                
                # If the gap was larger than cooldown, it counts as a new entry
                # But since we found it in active_sessions (which are cleaned up), 
                # it means it's within the window (or just slightly outside if cleanup hasn't run).
                # Actually, cleanup removes old ones. So if it's here, it's recent.
                return False
        
        # If no match found, add new session
        self.active_sessions.append({
            'box': box,
            'timestamp': current_time,
            'label': (gender, age)
        })
        return True
    
    def cleanup(self):
        current_time = time.time()
        # Remove sessions inactive for > cooldown_seconds
        self.active_sessions = [
            s for s in self.active_sessions 
            if current_time - s['timestamp'] < self.cooldown_seconds
        ]

class VideoCamera:
    def __init__(self):
        self.rtsp_url = os.getenv("RTSP_URL")
        # Use RTSP URL if available, otherwise default to None (no source)
        if self.rtsp_url and self.rtsp_url.isdigit():
            self.source = int(self.rtsp_url)
        else:
            self.source = self.rtsp_url if self.rtsp_url else None
        print(f"Video Source: {self.source}")
        
        self.video = None
        if self.source is not None:
            try:
                self.video = cv2.VideoCapture(self.source)
                if not self.video.isOpened():
                    print("Could not open video source.")
                    self.video = None
            except Exception as e:
                print(f"Error opening video source: {e}")
                self.video = None
        else:
            print("No video source provided. Camera will return dummy frames.")

        self.detector = Detector()
        self.current_stats = []
        self.cooldown_manager = CooldownManager(cooldown_seconds=10)

    def __del__(self):
        if self.video:
            self.video.release()

    def get_frame(self):
        if self.video is None or not self.video.isOpened():
            # Return a black dummy frame
            dummy = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(dummy, "No Video Source", (200, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            ret, jpeg = cv2.imencode('.jpg', dummy)
            return jpeg.tobytes(), []

        success, image = self.video.read()
        if not success:
            # Try to reconnect if stream is lost
            self.video.release()
            if self.source is not None:
                self.video = cv2.VideoCapture(self.source)
            return None, []
        
        # Perform detection
        processed_frame, results = self.detector.detect_and_predict(image)
        self.current_stats = results
        
        # Save to DB with cooldown check
        if results:
            self.save_to_db(results)
            self.cooldown_manager.cleanup()
        
        # Encode frame
        ret, jpeg = cv2.imencode('.jpg', processed_frame)
        return jpeg.tobytes(), results

    def save_to_db(self, results):
        try:
            saved_count = 0
            with get_db_conn() as conn:
                cursor = conn.cursor()
                for res in results:
                    # Pass box to should_save
                    if self.cooldown_manager.should_save(res['gender'], res['age'], res['box']):
                        cursor.execute(
                            "INSERT INTO detections (timestamp, gender, age) VALUES (?, ?, ?)",
                            (datetime.datetime.utcnow(), res['gender'], res['age'])
                        )
                        saved_count += 1
                
                if saved_count > 0:
                    conn.commit()
                    print(f"Saved {saved_count} new detections to DB.")
        except Exception as e:
            print(f"Error saving to DB: {e}")

    def get_stats(self):
        return self.current_stats
    
    def update_source(self, new_url):
        self.rtsp_url = new_url
        self.source = new_url if new_url else 0
        self.video.release()
        self.video = cv2.VideoCapture(self.source)
