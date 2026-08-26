from app.services import meme_service


def test_returns_a_valid_meme_from_the_catalog():
    meme = meme_service.get_random_meme()
    assert meme.id
    assert meme.title
    assert meme.image_url.startswith("/memes/")
    assert meme.alt_text


def test_repeated_calls_stay_within_the_known_catalog():
    catalog_ids = {item["id"] for item in meme_service._load_memes()}
    for _ in range(20):
        assert meme_service.get_random_meme().id in catalog_ids
