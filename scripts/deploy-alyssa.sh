#!/bin/bash
# Deploy to Alyssa's environment
cp .clasp-alyssa.json .clasp.json
npx clasp push
echo "Deployed to Alyssa's Google Apps Script successfully."
