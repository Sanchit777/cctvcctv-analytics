#!/bin/bash
echo "Build script started"
echo "Current directory: $(pwd)"

if [ -f "requirements.txt" ]; then
    echo "Found requirements.txt in root"
    pip install -r requirements.txt
elif [ -f "backend/requirements.txt" ]; then
    echo "Found backend/requirements.txt"
    pip install -r backend/requirements.txt
else
    echo "Error: requirements.txt not found"
    ls -R
    exit 1
fi

# Cleanup to reduce size
echo "Cleaning up..."
find . -name 'tests' -type d -exec rm -rf {} +
find . -name '__pycache__' -type d -exec rm -rf {} +
rm -rf $(pip cache dir)
echo "Build complete"
