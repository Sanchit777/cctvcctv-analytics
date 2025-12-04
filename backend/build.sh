#!/bin/bash
echo "Build script started"
mkdir -p packages
pip install -r reqs.txt --target packages
echo "Cleaning up..."
find packages -name 'tests' -type d -exec rm -rf {} +
find packages -name 'docs' -type d -exec rm -rf {} +
find packages -name '__pycache__' -type d -exec rm -rf {} +
rm -rf $(pip cache dir)
echo "Build complete"
