import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

load_dotenv()

# Initialize the LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.4)

# Define reusable UPSC prompt template
prompt = ChatPromptTemplate.from_template("""
Convert the following quiz into UPSC Prelims style:

Question: {question}
Options: {options}
Answer: {answer}

Rules:
- Use formal, neutral UPSC tone.
- Prefer 'Consider the following statements' format.
- Always number statements as "1., 2., 3."
- Give 4 options in UPSC style (1 only, 2 only, Both 1 and 2, Neither 1 nor 2).
- Always return clean JSON with keys: question, statements, options, answer.
- The 'options' must be a list like ["A) 1 only", "B) 2 only", "C) Both 1 and 2", "D) Neither 1 nor 2"].
- The 'answer' must only be "A", "B", "C" or "D".
""")

# Build a chain once
chain = prompt | llm

def clean_output(raw_text):
    """Remove markdown fences and fix JSON formatting."""
    # Remove ```json ... ``` wrappers
    raw_text = re.sub(r"^```json|```$", "", raw_text.strip(), flags=re.MULTILINE).strip()
    raw_text = re.sub(r"^```|```$", "", raw_text.strip(), flags=re.MULTILINE).strip()

    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError:
        return {"raw_output": raw_text}

    # Ensure uniform format
    cleaned = {
        "question": data.get("question", "").strip(),
        "statements": [s.strip() for s in data.get("statements", [])],
        "options": [],
        "answer": data.get("answer", "").strip()
    }

    # Fix options format (dict → list)
    opts = data.get("options", [])
    if isinstance(opts, dict):
        # Convert dict {"A": "...", "B": "..."} → ["A) ...", "B) ..."]
        cleaned["options"] = [f"{k}) {v}" for k, v in opts.items()]
    elif isinstance(opts, list):
        # Ensure every option has "A) ..." format
        cleaned["options"] = [opt if re.match(r"^[A-D]\)", opt) else f"{chr(65+i)}) {opt}" 
                              for i, opt in enumerate(opts)]
    
    # Normalize answer to A/B/C/D
    ans = cleaned["answer"]
    if ans not in ["A", "B", "C", "D"]:
        mapping = {v: k for k, v in zip(["1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2"], ["A", "B", "C", "D"])}
        cleaned["answer"] = mapping.get(ans, ans)  # fallback if mismatch

    return cleaned

def reframe_to_upsc(question_data):
    result = chain.invoke({
        "question": question_data["question"],
        "options": ", ".join(question_data["options"]),
        "answer": question_data["answer"]
    })
    return clean_output(result.content)

# File paths
current_file_path = Path(__file__).resolve()
parent_path = current_file_path.parent
input_file_path = os.path.join(parent_path, "json-output-files", "mcqs_output.json")
output_file_path = os.path.join(parent_path, "json-output-files", "upsc_mcqs.json")

# Read input quiz file
with open(input_file_path) as f:
    quiz = json.load(f)

# Transform each question
upsc_quiz = []
for q in quiz:
    upsc_q = reframe_to_upsc(q)
    upsc_quiz.append(upsc_q)

# Save the UPSC-style MCQs
with open(output_file_path, "w", encoding="utf-8") as f:
    json.dump(upsc_quiz, f, ensure_ascii=False, indent=4)

print(f"UPSC MCQs saved to {output_file_path}")
