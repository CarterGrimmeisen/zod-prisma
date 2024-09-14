#!/bin/bash

# Log the current working directory
echo "Current working directory: $(pwd)"

# Navigate to the src/test/functional directory
cd src/test/functional || { echo "Failed to navigate to ../src/test/functional"; exit 1; }

# Loop through each folder in the current directory
for dir in */; do
  echo "Processing directory: $dir"
  
  # Check if the actual and expected directories exist
  if [ -d "$dir/actual" ] && [ -d "$dir/expected" ]; then
    echo "Found 'actual' and 'expected' directories in $dir"
    
    # Copy files from actual to expected
    cp -r "$dir/actual/"* "$dir/expected/"
    
    if [ $? -eq 0 ]; then
      echo "Files copied successfully from $dir/actual to $dir/expected"
    else
      echo "Failed to copy files from $dir/actual to $dir/expected"
    fi
  else
    echo "'actual' or 'expected' directory not found in $dir"
  fi
done