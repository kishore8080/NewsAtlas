from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
import json
import os
from pathlib import Path

embedding = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2"  # small, fast, free
)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  
ROOT_DIR = os.path.dirname(BASE_DIR)

with open(rf"{ROOT_DIR}\documents\chunk_file.json","r",encoding="utf-8") as f:
          documents = json.load(f)
texts=[doc["content"] for doc in documents]
metadatas=[doc["metadata"] for doc in documents]

#chromadb
chroma_persist_dir = Path(BASE_DIR) /"VectorDB"/"chroma_db"

vectorstore = Chroma.from_texts(
     texts=texts,
     embedding=embedding,
     metadatas=metadatas,
     persist_directory=str(chroma_persist_dir)
)

#vectorstore.persist()
print(f"stored to {chroma_persist_dir}")
