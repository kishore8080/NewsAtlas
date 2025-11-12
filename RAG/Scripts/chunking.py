from langchain_text_splitters import RecursiveCharacterTextSplitter
import json

text_splitter=RecursiveCharacterTextSplitter(
    chunk_size=300,
    chunk_overlap=75,
)

clean_text_path ="/home/kishorereddy2rana/eazyprepAI/RAG/documents/eazyprepAI_clean.txt"

with open(clean_text_path, "r",encoding="utf-8") as f:
       clean_text_file = f.read()

chunks = text_splitter.split_text(clean_text_file)

#validation
#print(len(chunks))
#for i,chunk in enumerate(chunks,1):
#     print(f"chunk {i} ({len(chunk)} chars) \n{chunk}\n{'-'*60}")

documents=[
    {
        "content":chunk,
        "metadata":{
            "source_file":"eazyprepAI_clean.txt",
            "chunk":i
        }
    }
    for i,chunk in enumerate(chunks,1)
]
#print(documents)

with open ("/home/kishorereddy2rana/eazyprepAI/RAG/documents/chunk_file.json","w",encoding="utf-8") as f:
        json.dump(documents,f,ensure_ascii=False, indent=2)
print("chunk file saved")



