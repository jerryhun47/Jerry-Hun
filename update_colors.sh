#!/bin/bash
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i -E 's/bg-red-/bg-primary-/g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i -E 's/text-red-/text-primary-/g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i -E 's/border-red-/border-primary-/g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i -E 's/from-red-/from-primary-/g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i -E 's/to-red-/to-primary-/g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i -E 's/via-red-/via-primary-/g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i -E 's/shadow-red-/shadow-primary-/g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i -E 's/ring-red-/ring-primary-/g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i -E 's/fill-red-/fill-primary-/g' {} +
