from fastapi.testclient import TestClient

from app.core.config import settings


def test_user_registration_and_login(client: TestClient):
    """
    Test user registration and login flow
    """
    # Test user registration
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "Password123",
        "full_name": "Test User",
    }

    # Register the user
    register_response = client.post(
        f"{settings.API_V1_STR}/auth/register", json=user_data
    )

    assert register_response.status_code == 201
    assert register_response.json()["email"] == user_data["email"]
    assert register_response.json()["username"] == user_data["username"]
    assert register_response.json()["full_name"] == user_data["full_name"]
    assert "id" in register_response.json()

    # Test user login
    login_data = {"username": user_data["username"], "password": user_data["password"]}

    login_response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data=login_data,  # Use form data for OAuth2 password flow
    )

    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
    assert login_response.json()["token_type"] == "bearer"

    # Test authenticated endpoint access
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me_response = client.get(f"{settings.API_V1_STR}/users/me", headers=headers)

    assert me_response.status_code == 200
    assert me_response.json()["email"] == user_data["email"]
    assert me_response.json()["username"] == user_data["username"]
