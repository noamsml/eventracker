FROM python:latest
WORKDIR /app
COPY . .
ARG is_github_actions=false
ENV is_github_actions=${is_github_actions}
RUN if [ $is_github_actions = "false" ]; then git clean -dfx; fi
RUN pip install -r requirements-production.txt
ENV ENV=containerized
ENTRYPOINT uvicorn --host 0.0.0.0 --port 80 api.api:app