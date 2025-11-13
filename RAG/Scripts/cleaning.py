
from pathlib import Path
import os

#Load the clean script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  
ROOT_DIR = os.path.dirname(BASE_DIR)
text = Path(rf"{ROOT_DIR}\documents\eazyprepAI.txt").read_text(encoding="utf-8")

clean_text = " ".join(text.split())
Path(rf"{ROOT_DIR}\documents\eazyprepAI_clean.txt").write_text(clean_text, encoding="utf-8")
