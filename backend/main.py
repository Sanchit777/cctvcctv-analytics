from fastapi import FastAPI, Response, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import uvicorn
import os
import datetime
from pydantic import BaseModel
from camera import VideoCamera
from database import get_db, init_db, Detection

# Initialize DB
init_db()

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

camera = VideoCamera()

class Settings(BaseModel):
    rtsp_url: str

def gen(camera):
    while True:
        frame, _ = camera.get_frame()
        if frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.get("/video_feed")
def video_feed():
    return StreamingResponse(gen(camera),
                    media_type='multipart/x-mixed-replace; boundary=frame')

@app.get("/stats")
def get_stats():
    # Aggregate stats for the current frame (or you could accumulate over time)
    stats = camera.get_stats()
    
    # Simple aggregation for the dashboard
    gender_counts = {"Male": 0, "Female": 0}
    age_counts = {}
    
    for item in stats:
        gender_counts[item['gender']] += 1
        age = item['age']
        age_counts[age] = age_counts.get(age, 0) + 1
        
    return {
        "total_people": len(stats),
        "gender_distribution": gender_counts,
        "age_distribution": age_counts,
        "raw_data": stats
    }

@app.get("/history")
def get_history(db: Session = Depends(get_db), limit: int = 100):
    detections = db.query(Detection).order_by(Detection.timestamp.desc()).limit(limit).all()
    return detections

@app.get("/history/daily_stats")
def get_daily_stats(date: str = None, db: Session = Depends(get_db)):
    if date:
        try:
            query_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    else:
        query_date = datetime.datetime.utcnow().date()
        
    start_of_day = datetime.datetime(query_date.year, query_date.month, query_date.day)
    end_of_day = start_of_day + datetime.timedelta(days=1)
    
    # Query detections for the specific date
    todays_detections = db.query(Detection).filter(
        Detection.timestamp >= start_of_day,
        Detection.timestamp < end_of_day
    ).all()
    
    total_count = len(todays_detections)
    age_counts = {}
    gender_counts = {"Male": 0, "Female": 0}
    
    for d in todays_detections:
        age_counts[d.age] = age_counts.get(d.age, 0) + 1
        gender_counts[d.gender] = gender_counts.get(d.gender, 0) + 1
        
    return {
        "date": query_date,
        "total_detections": total_count,
        "age_breakdown": age_counts,
        "gender_breakdown": gender_counts
    }

@app.post("/settings")
def update_settings(settings: Settings):
    # In a real app, you'd save this to .env or a config file
    # For now, we update the running camera instance
    print(f"Updating RTSP URL to: {settings.rtsp_url}")
    camera.update_source(settings.rtsp_url)
    return {"message": "Settings updated"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
