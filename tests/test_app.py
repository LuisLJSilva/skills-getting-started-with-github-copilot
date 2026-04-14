import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

# Test GET /activities
def test_get_activities():
    # Arrange: (nenhuma preparação especial necessária)
    # Act
    response = client.get("/activities")
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

# Test POST /activities/{activity}/signup
def test_signup_for_activity():
    # Arrange
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    # Act
    response = client.post(f"/activities/{activity}/signup?email={email}")
    # Assert
    assert response.status_code in (200, 400)  # 400 se já estiver inscrito
    if response.status_code == 200:
        assert f"Signed up {email}" in response.json()["message"]
    else:
        assert response.json()["detail"] == "Student already signed up for this activity"

# Test DELETE /activities/{activity}/participants/{email}
def test_remove_participant():
    # Arrange
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    # Act
    response = client.delete(f"/activities/{activity}/participants/{email}")
    # Assert
    assert response.status_code in (200, 404)
    if response.status_code == 200:
        assert f"Removed {email}" in response.json()["message"]
    else:
        assert response.json()["detail"] == "Participant not found in this activity"
