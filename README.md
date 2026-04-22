# Smart Assist

Microservice-style setup with React (Vite) frontend, FastAPI backend, and MySQL in Docker Compose.

## Structure

- frontend/ React + Vite
- backend/ FastAPI
- docker-compose.yml orchestration

## Run

```bash
docker-compose up --build
```

## URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs

## Notes

- The FastAPI app auto-creates the `guidelines` table on startup.
- Add MySQL data by inserting rows into `smart_assist.guidelines`.
