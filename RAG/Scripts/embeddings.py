from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
import json

embedding = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2"  # small, fast, free
)


with open("/home/kishorereddy2rana/eazyprepAI/RAG/documents/chunk_file.json","r",encoding="utf-8") as f:
          documents = json.load(f)
texts=[doc["content"] for doc in documents]
metadatas=[doc["metadata"] for doc in documents]

#chromadb
chroma_persist_dir = "/home/kishorereddy2rana/eazyprepAI/RAG/VectorDB/chroma_db"

vectorstore = Chroma.from_texts(
     texts=texts,
     embedding=embedding,
     metadatas=metadatas,
     persist_directory=chroma_persist_dir
)

vectorstore.persist()
print(f"stored to {persist_directory}")