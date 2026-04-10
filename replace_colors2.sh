#!/bin/bash

find frontend/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/rgba(15, 23, 42, 0.8)/var(--bg-glass-80)/g' \
  -e 's/rgba(30, 41, 59, 0.8)/var(--bg-card-80)/g' \
  -e 's/rgba(30, 41, 59, 0.6)/var(--bg-card-60)/g' \
  -e 's/rgba(51, 65, 85, 0.8)/var(--border-dark-80)/g' \
  -e 's/rgba(99, 102, 241, 0.5)/var(--accent-bg-50)/g' \
  -e 's/rgba(99, 102, 241, 0.6)/var(--accent-bg-60)/g'

echo "Done round 2"
