# React + FastAPI Application Template

This is a full-stack application template using React for the frontend and FastAPI for the backend.

## Project Structure

```
react-connect-to-fastapi/
├── frontend/                # React frontend using Vite
│   ├── src/                 # React source code
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── Dockerfile           # Frontend Docker configuration
│
├── backend/                 # FastAPI backend
│   ├── app/                 # Backend application code
│   ├── tests/               # Backend tests
│   ├── pyproject.toml       # Backend dependencies
│   └── Dockerfile           # Backend Docker configuration
│
└── docker-compose.yml       # Docker Compose configuration for both services
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local frontend development)
- Python 3.13+ (for local backend development)

### Running with Docker Compose

The easiest way to run the entire application is with Docker Compose:

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

Once running:

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:8000>
- API Documentation: <http://localhost:8000/docs>

### Local Development

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

The development server will run at <http://localhost:5173> with hot-reload enabled.

#### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload
```

The backend will run at <http://localhost:8000>.

## Features

- **Frontend**:
  - React with modern hooks
  - Vite for fast development
  - React Router for navigation
  - Optimized Nginx configuration for production

- **Backend**:
  - FastAPI with async/await support
  - SQLAlchemy 2.0 ORM
  - JWT authentication
  - Comprehensive validation with Pydantic
  - Loguru for structured logging
  - Docker configuration with uv package manager

## License

This project is licensed under the MIT License.
