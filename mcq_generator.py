# mcq_generator.py

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from openai import OpenAI
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
    from article_fetch_api import fetch_news_articles
    articles = fetch_news_articles()
    quiz = generate_mcqs(articles)  
    print("Type:",type(quiz))
    print(quiz)
    mcqs_json = json.dumps(quiz, indent=4)
    with open("mcqs_output.json", "w") as f:
          f.write(mcqs_json)

