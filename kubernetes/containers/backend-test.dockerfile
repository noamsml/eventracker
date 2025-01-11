FROM python:latest
WORKDIR /app
COPY . .
ARG is_github_actions=false
ENV is_github_actions=${is_github_actions}
RUN if [ $is_github_actions = "false" ]; then git clean -dfx; fi
RUN pip install -r requirements-test.txt
ENV ENV=test
ENTRYPOINT pytest