#!/bin/bash

# Copy schemas and fastas to functions directory for bundling
mkdir -p netlify/functions/data
cp -r schemas netlify/functions/data/
cp -r fastas netlify/functions/data/

echo "Build complete - data copied to functions directory"
