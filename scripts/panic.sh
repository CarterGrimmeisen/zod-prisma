#!/bin/bash

# Change to the root directory of the project
cd "$(dirname "$0")/.."

echo "Panic: Cleaning up the project, removing all untracked files and directories"

git clean -fdx \
  -e .env \
  -e examples/.env