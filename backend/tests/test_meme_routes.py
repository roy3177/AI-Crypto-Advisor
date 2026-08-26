def test_random_meme_is_public_and_returns_valid_shape(client):
    response = client.get("/api/memes/random")
    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == {"id", "title", "image_url", "alt_text", "content_key"}
    assert body["content_key"] == f"meme:{body['id']}"
