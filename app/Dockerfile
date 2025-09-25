FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ .
COPY json-output-files ./json-output-files

EXPOSE 8000
CMD ["python", "main.py"]