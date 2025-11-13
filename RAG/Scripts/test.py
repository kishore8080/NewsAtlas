from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from pathlib import Path
import os

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  
ROOT_DIR = os.path.dirname(BASE_DIR)
chroma_persist_dir = Path(BASE_DIR) /"VectorDB"/"chroma_db"

# --- Embedding model (same as used for building) ---
embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# --- Load existing Chroma DB ---
vectorstore = Chroma(
    persist_directory=str(chroma_persist_dir),
    embedding_function=embedding
)

#print("Loaded Chroma DB successfully!")
#print("Collections:", vectorstore._collection.count())

# --- Query the vector store ---

query = input("EazyBot: ")
results = vectorstore.similarity_search(query, k=2)
#print("Results:",results)
# --- Display results ---
#for i, doc in enumerate(results, 1):
 #   print(f"\nResult {i}:")
   # print(doc.page_content)
  #  print("Metadata:", doc.metadata)

retrived_docs =[doc.page_content for doc in results]
context = retrived_docs[0]
#print(retrived_docs)

#Build a RAG prompt

augmented_prompt = f""" 
     Use the following context to answer the user's question.
If the answer is not in the context, say "I don't know."
context: {context}

Question: {query}
Answer:
"""


from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client=OpenAI()

response = client.chat.completions.create(
    model="gpt-4o-mini",  # or gpt-4-turbo
    messages=[
        {"role": "system", "content": "You are a helpful assistant that answers based on given context."},
        {"role": "user", "content": augmented_prompt}
    ],
    temperature=0.3
)

print(response.choices[0].message.content)
