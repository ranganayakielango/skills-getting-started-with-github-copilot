from fastapi.testclient import TestClient
import pytest

from src.app import app, activities


@pytest.fixture(autouse=True)
def client():
    # Use a fresh client for each test
    return TestClient(app)


def test_get_activities(client):
    res = client.get('/activities')
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
    # Expect some known activity keys
    assert 'Basketball' in data


def test_signup_and_unregister_flow(client):
    activity = 'Basketball'
    email = 'teststudent@mergington.edu'

    # Ensure email not already registered
    if email in activities[activity]['participants']:
        activities[activity]['participants'].remove(email)

    # Sign up
    res = client.post(f"/activities/{activity}/signup", params={'email': email})
    assert res.status_code == 200
    assert email in activities[activity]['participants']

    # Attempt duplicate signup should fail
    res_dup = client.post(f"/activities/{activity}/signup", params={'email': email})
    assert res_dup.status_code == 400

    # Unregister
    res_unreg = client.delete(f"/activities/{activity}/participants", params={'email': email})
    assert res_unreg.status_code == 200
    assert email not in activities[activity]['participants']
