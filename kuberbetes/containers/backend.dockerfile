FROM python:latest
WORKDIR /app
COPY . .
RUN git clean -dfx
RUN pip install -r requirements.txt
RUN pip install uvicorn
ENV ENV=containerized
ENTRYPOINT uvicorn --host 0.0.0.0 --port 80 api.api:app