FROM python:3.13-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1

COPY --from=ghcr.io/astral-sh/uv:0.5.11 /uv /uvx /bin/

ENV UV_COMPILE_BYTE=1

ENV UV_LINK_MODE=copy

# Change the working directory to the `app` directory
WORKDIR /app

ENV PATH="/app/.venv/bin:$PATH"

COPY ./pyproject.toml ./uv.lock ./.python-version /app/

# Install dependencies
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

# Copy the project into the image
COPY ./app /app/app

# Create logs directory
RUN mkdir -p /app/logs

# Sync the project and add bcrypt patch for passlib compatibility
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev && \
    echo 'import bcrypt; bcrypt.__about__ = type("", (), {"__version__": bcrypt.__version__})()' > /app/.venv/lib/python3.13/site-packages/bcrypt_patch.py && \
    echo 'import bcrypt_patch' >> /app/.venv/lib/python3.13/site-packages/passlib/handlers/bcrypt.py

CMD ["fastapi", "dev", "app/main.py", "--host", "0.0.0.0"] 