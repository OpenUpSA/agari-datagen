#!/bin/bash

# Copy only schemas to functions directory (fastas are generated on-demand)
mkdir -p netlify/functions/data
cp -r schemas netlify/functions/data/

echo "Build complete - schemas copied to functions directory"
