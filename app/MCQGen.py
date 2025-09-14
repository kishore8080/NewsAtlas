# mcq_generator.py

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from openai import OpenAI
import json
import os
from pathlib import Path
import json

load_dotenv()
client = OpenAI()

def generate_mcqs(news_text: str):
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.4)

    prompt = ChatPromptTemplate.from_template("""
    You are an assistant that generates multiple-choice questions.
    Based on the following text, generate 10 MCQs That can be asked in UPSC exams.
    Each MCQ should have:
    - A question
    - Four options (A, B, C, D)
    - The correct answer key (A-D)

    Return output in JSON format as a list of:
    {{
        "question": "...",
        "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
        "answer": "B"
    }}

    TEXT:
    {text}
    """)

    chain = prompt | llm
    result = chain.invoke({"text": news_text})
    return result.content

if __name__ == "__main__":
    from FetchAPI import fetch_news_articles
    articles = fetch_news_articles()
    quiz = generate_mcqs(articles)  
    print("Type:",type(quiz))
    print(quiz)
    
    #mcqs_json = json.dumps(quiz, indent=4)
    current_file_path = Path(__file__).resolve()
    parent_path = current_file_path.parent.parent
    output_file_path = os.path.join(parent_path,"tmp", "mcqs_output.json")
    
    #os.makedirs(output_file_path, exist_ok=True)
    try:
        with open(output_file_path, 'w') as f:
             json.dump(quiz, f, indent=4)
        print(f"Successfully wrote data to: {output_file_path}")
        pretty_json_path = os.path.join(parent_path,"json-output-files", "mcqs_output.json")
        from jsonpretty import jsonpretty
        jsonpretty(output_file_path,pretty_json_path)
    except Exception as e:
        print(f"An error occurred: {e}")
    #with open(output_file_path,"w") as f:
     #     f.write(mcqs_json)   
