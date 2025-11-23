import json
import re
import os
from pathlib import Path
import json


def jsonpretty(input_path,output_path):
    with open(input_path, "r", encoding="utf-8") as f:
        raw_content = f.read().strip()

#  Remove wrapping quotes if present
    if raw_content.startswith('"') and raw_content.endswith('"'):
         raw_content = raw_content[1:-1]

# Remove Markdown code block markers
    raw_content = re.sub(r"^```json\s*|\s*```$", "", raw_content, flags=re.DOTALL).strip()

# Replace escaped newlines (\n) with real newlines
    raw_content = raw_content.replace("\\n", "\n")

#  Replace escaped quotes (\") with real quotes
    raw_content = raw_content.replace('\\"', '"')

# Now try parsing
    try:
       data = json.loads(raw_content)
    except json.JSONDecodeError as e:
       print("Still invalid JSON:", e)
       print("Preview after cleaning:\n", raw_content[:200])
       exit(1)

# Save beautified JSON
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    print(f"Beautified JSON saved to {output_path}")