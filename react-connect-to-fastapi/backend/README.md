# FastAPI Backend

A modern FastAPI backend application with user authentication, SQLAlchemy ORM integration, and a clean architecture following the principles outlined in the backend rules.

## Features

- Modern FastAPI architecture with async/await support and proper lifespan management
- JWT authentication with token-based sessions
- SQLAlchemy 2.0 ORM with async support
- Role-based access control
- Structured error handling
- Request validation with Pydantic
- Comprehensive logging with Loguru
- Docker support with uv package manager and fastapi-cli
- Comprehensive test support

## Getting Started

### Prerequisites

- Python 3.13+
- Docker and Docker Compose (optional)

### Setup

1. Clone the repository
2. Set up a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:

```bash
# Using pip
pip install -e .

# Or using uv
pip install uv
uv pip install -e .
```

4. Initialize the database:

```bash
# Using the run.py helper script
python run.py init-db
```

5. Run the development server:

```bash
# Using the run.py helper script
python run.py serve

# Or using uvicorn directly
uvicorn app.main:app --reload

# Or using fastapi-cli
fastapi dev app/main.py
```

### Using Docker

1. Build and start the container:

```bash
# From parent directory
docker-compose up --build api

# Or just the backend
cd ..
docker-compose up --build api
```

2. The API will be available at <http://localhost:8000>

## API Documentation

Once the server is running, you can access:

- Swagger UI: <http://localhost:8000/docs>
- ReDoc: <http://localhost:8000/redoc>

## Project Structure

```
backend/
├── app/
│   ├── api/            # API endpoints and routes
│   ├── core/           # Core functionality (config, security, errors)
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas for request/response validation
│   ├── services/       # Business logic and database operations
│   └── utils/          # Utility functions
├── logs/               # Application logs
├── tests/              # Test directory
├── run.py              # Helper script for common tasks
└── pyproject.toml      # Project dependencies and settings
```

## Logging

The application uses Loguru for structured logging. Logs are written to both:

- Console (INFO level)
- File (DEBUG level, with rotation at logs/app.log)

## Testing

Run tests with pytest:

```bash
pytest
```

## License

This project is licensed under the MIT License.
