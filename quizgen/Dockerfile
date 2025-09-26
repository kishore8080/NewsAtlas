FROM python:3.10-slim

WORKDIR /appquizgen

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY quizgen ./quizgen
COPY tmp ./tmp
COPY json-output-files ./json-output-files
COPY .env .

CMD ["python","quizgen/mainGen.py"]
