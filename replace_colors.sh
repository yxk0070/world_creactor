#!/bin/bash

find frontend/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/rgba(15, 23, 42, 0.6)/var(--bg-glass)/g' \
  -e 's/rgba(30, 41, 59, 0.4)/var(--bg-card)/g' \
  -e 's/rgba(30, 41, 59, 0.5)/var(--bg-card-hover)/g' \
  -e 's/rgba(30, 41, 59, 0.85)/var(--bg-solid-card-85)/g' \
  -e 's/#0f172a/var(--bg-root)/g' \
  -e 's/#1e293b/var(--bg-solid-card)/g' \
  -e 's/rgba(71, 85, 105, 0.4)/var(--border-light)/g' \
  -e 's/rgba(71, 85, 105, 0.3)/var(--border-light)/g' \
  -e 's/rgba(71, 85, 105, 0.5)/var(--border-dark)/g' \
  -e 's/rgba(51, 65, 85, 0.5)/var(--border-dark)/g' \
  -e 's/#f8fafc/var(--text-primary)/g' \
  -e 's/#e2e8f0/var(--text-secondary)/g' \
  -e 's/#cbd5e1/var(--text-tertiary)/g' \
  -e 's/#94a3b8/var(--text-muted)/g' \
  -e 's/rgba(99, 102, 241, 0.2)/var(--accent-bg)/g' \
  -e 's/rgba(99, 102, 241, 0.3)/var(--accent-bg-hover)/g' \
  -e 's/#818cf8/var(--accent-purple)/g' \
  -e 's/#6366f1/var(--accent-primary)/g'

echo "Done"
