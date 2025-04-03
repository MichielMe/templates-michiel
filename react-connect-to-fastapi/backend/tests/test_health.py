from fastapi.testclient import TestClient

from app.core.config import settings


def test_health_check(client: TestClient):
    """
    Test health check endpoint
    """
    response = client.get(f"{settings.API_V1_STR}/health/")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
