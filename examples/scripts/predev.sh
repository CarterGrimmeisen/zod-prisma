#!/bin/bash

# Before running the script, make sure your DB is running
# docker compose up -d

cd "$(dirname "$0")/../.." && yarn build && cd examples && prisma generate && prisma db push