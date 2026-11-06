#!/bin/bash
set -e

echo "=== JHOS DEPLOYMENT PIPELINE ==="

# Build workspaces
echo "Building Typescript..."
npm run build

# Deploy Worker
echo "Deploying Cloud Run Job (Worker)..."
gcloud run jobs deploy jhos-worker \
  --source . \
  --command "npm" \
  --args "run,start:worker" \
  --region ${GCP_REGION:-us-central1} \
  --project ${GCP_PROJECT_ID} \
  --set-env-vars="DRAFT_ONLY=true,VERTEX_MODEL=${VERTEX_MODEL:-gemini-1.5-pro}" \
  --max-retries 1 \
  --task-timeout 10m

# Deploy API
echo "Deploying Cloud Run Service (API)..."
gcloud run deploy jhos-api \
  --source . \
  --command "npm" \
  --args "run,start:api" \
  --region ${GCP_REGION:-us-central1} \
  --project ${GCP_PROJECT_ID} \
  --set-env-vars="DRAFT_ONLY=true,VERTEX_MODEL=${VERTEX_MODEL:-gemini-1.5-pro}" \
  --allow-unauthenticated \
  --platform managed

echo "=== DEPLOYMENT COMPLETE ==="
