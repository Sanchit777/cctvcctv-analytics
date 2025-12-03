import os
import requests

MODELS = {
    "face_deploy.prototxt": "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt",
    "face_net.caffemodel": "https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel",
    "age_deploy.prototxt": "https://raw.githubusercontent.com/GilLevi/AgeGenderDeepLearning/master/age_net_definitions/deploy.prototxt",
    "age_net.caffemodel": "https://github.com/GilLevi/AgeGenderDeepLearning/raw/master/models/age_net.caffemodel",
    "gender_deploy.prototxt": "https://raw.githubusercontent.com/GilLevi/AgeGenderDeepLearning/master/gender_net_definitions/deploy.prototxt",
    "gender_net.caffemodel": "https://github.com/GilLevi/AgeGenderDeepLearning/raw/master/models/gender_net.caffemodel"
}

WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), "weights")

def download_file(url, filepath):
    print(f"Downloading {url} to {filepath}...")
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        print("Done.")
    else:
        print(f"Failed to download {url}")

def main():
    if not os.path.exists(WEIGHTS_DIR):
        os.makedirs(WEIGHTS_DIR)
    
    for filename, url in MODELS.items():
        filepath = os.path.join(WEIGHTS_DIR, filename)
        if not os.path.exists(filepath):
            download_file(url, filepath)
        else:
            print(f"{filename} already exists.")

if __name__ == "__main__":
    main()
