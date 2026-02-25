# Build frontend
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --omit=dev
COPY frontend/ ./
RUN npm run build

# Run backend and serve frontend
FROM python:3.12-slim
WORKDIR /app
RUN useradd --create-home appuser
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY files/ ./files/
COPY --from=frontend /app/frontend/dist ./frontend/dist
ENV ENVIRONMENT=production
ENV HOST=0.0.0.0
ENV PORT=8000
EXPOSE 8000
USER appuser
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--chdir", "files"]
