from pathlib import Path

#Load the clean script
text = Path("/home/kishorereddy2rana/eazyprepAI/RAG/documents/eazyprepAI.txt").read_text(encoding="utf-8")
clean_text = " ".join(text.split())
Path("/home/kishorereddy2rana/eazyprepAI/RAG/documents/eazyprepAI_clean.txt").write_text(clean_text, encoding="utf-8")
