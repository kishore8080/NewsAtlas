# PowerShell script to copy JSON files for Vercel deployment

Write-Host "Setting up API files for Vercel deployment..." -ForegroundColor Cyan

# Create directory if it doesn't exist
if (-not (Test-Path "json-output-files")) {
    New-Item -ItemType Directory -Path "json-output-files" | Out-Null
}

# Copy JSON files from parent directory
if (Test-Path "..\json-output-files\upsc_mcqs.json") {
    Copy-Item "..\json-output-files\upsc_mcqs.json" -Destination "json-output-files\" -Force
    Write-Host "✅ Copied upsc_mcqs.json" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: ..\json-output-files\upsc_mcqs.json not found" -ForegroundColor Yellow
    Write-Host "   Please ensure the JSON file exists or update the path in the script" -ForegroundColor Yellow
}

if (Test-Path "..\json-output-files\mcqs_output.json") {
    Copy-Item "..\json-output-files\mcqs_output.json" -Destination "json-output-files\" -Force
    Write-Host "✅ Copied mcqs_output.json" -ForegroundColor Green
}

Write-Host "✅ Setup complete! JSON files are now in frontendnext\json-output-files\" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Commit these files to Git (they'll be included in Vercel deployment)"
Write-Host "2. Or set QUIZ_JSON_PATH environment variable in Vercel"

