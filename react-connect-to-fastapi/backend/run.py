#!/usr/bin/env python
"""
Helper script to initialize the database and start the application.
Usage:
    # Initialize the database
    python run.py init-db
    
    # Run the application
    python run.py serve
"""

import asyncio
import os
import sys

import uvicorn
from loguru import logger

from app.core.init_db import init_db


async def initialize_database():
    """Initialize the database with tables and initial data"""
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialization complete.")


def serve():
    """Start the FastAPI application with uvicorn"""
    logger.info("Starting FastAPI application...")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide a command: init-db or serve")
        sys.exit(1)

    command = sys.argv[1]

    if command == "init-db":
        asyncio.run(initialize_database())
    elif command == "serve":
        serve()
    else:
        print(f"Unknown command: {command}")
        print("Available commands: init-db, serve")
        sys.exit(1)
