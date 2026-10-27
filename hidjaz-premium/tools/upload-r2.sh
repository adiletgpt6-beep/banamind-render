#!/usr/bin/env bash
# Загрузка финального MP4 в Cloudflare R2 (S3 API) и ссылка на 7 дней.
# Нужны R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY.
# Значения не печатаются; presigned-ссылка пишется в файл $2 (не в лог).
set -euo pipefail
FILE="$1"; LINK_FILE="$2"
KEY="ads/hidjaz-premium/$(basename "$FILE")"
export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" AWS_DEFAULT_REGION=auto
EP="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
aws s3 cp "$FILE" "s3://${R2_BUCKET_NAME}/${KEY}" --endpoint-url "$EP" --content-type video/mp4 --only-show-errors
aws s3 presign "s3://${R2_BUCKET_NAME}/${KEY}" --endpoint-url "$EP" --expires-in 604800 > "$LINK_FILE"
echo "R2: загружено ${KEY}"
