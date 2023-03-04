FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /srv/api

RUN adduser --disabled-password --gecos "" appuser \
  && mkdir -p uploads logs certs/docusign \
  && chown -R appuser:appuser /srv/api

COPY pyproject.toml ./
RUN pip install --no-cache-dir -e .

COPY app ./app

USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:3000/health')"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
