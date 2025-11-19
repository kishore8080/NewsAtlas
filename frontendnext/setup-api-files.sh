#!/bin/bash
# Script to copy JSON files for Vercel deployment

echo "Setting up API files for Vercel deployment..."

# Create directory if it doesn't exist
mkdir -p json-output-files

# Copy JSON files from parent directory
if [ -f "../json-output-files/upsc_mcqs.json" ]; then
    cp ../json-output-files/upsc_mcqs.json json-output-files/
    echo "Copied upsc_mcqs.json"
else
    echo " Warning: ../json-output-files/upsc_mcqs.json not found"
    echo "   Please ensure the JSON file exists or update the path in the script"
fi

if [ -f "../json-output-files/mcqs_output.json" ]; then
    cp ../json-output-files/mcqs_output.json json-output-files/
    echo "Copied mcqs_output.json"
fi

echo "Setup complete! JSON files are now in frontendnext/json-output-files/"
echo ""
echo "Next steps:"
echo "1. Commit these files to Git (they'll be included in Vercel deployment)"
echo "2. Or set QUIZ_JSON_PATH environment variable in Vercel"

