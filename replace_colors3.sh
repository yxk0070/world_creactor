#!/bin/bash
find frontend/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/rgba(30, 41, 59, 0.98)/var(--bg-solid-card-85)/g' \
  -e 's/rgba(30,41,59,0.95)/var(--bg-solid-card-85)/g' \
  -e 's/rgba(15, 23, 42, 0.4)/var(--input-bg)/g' \
  -e 's/rgba(45,61,90,0.95)/var(--bg-card-80)/g' \
  -e 's/rgba(71, 85, 105, 0.8)/var(--border-dark-80)/g'

echo "Done round 3"
