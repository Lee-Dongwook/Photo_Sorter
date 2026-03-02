"""match_face_to_person 유닛 테스트."""

from unittest.mock import patch

import pytest

from src.utils.match_face_to_person import match_face_to_person


@pytest.fixture
def mock_face_distance():
    with patch("src.utils.match_face_to_person.face_recognition") as m:
        yield m


def test_returns_name_when_min_distance_at_or_below_threshold(
    mock_face_distance,
) -> None:
    enc_a = [1.0] * 128
    enc_b = [2.0] * 128
    reference = {"철수": [enc_a], "영희": [enc_b]}
    query = [1.1] * 128  # 철수와 가까움

    # face_distance(flat=[enc_a, enc_b], query) → [0.1, 0.9] 가정 (철수가 더 가까움)
    mock_face_distance.face_distance.return_value = [0.1, 0.9]

    result = match_face_to_person(query, reference, threshold=0.6)

    assert result == "철수"
    mock_face_distance.face_distance.assert_called_once()


def test_returns_none_when_min_distance_above_threshold(mock_face_distance) -> None:
    enc_a = [1.0] * 128
    reference = {"철수": [enc_a]}
    query = [9.0] * 128  # 먼 얼굴

    mock_face_distance.face_distance.return_value = [1.0]  # threshold 0.6 초과

    result = match_face_to_person(query, reference, threshold=0.6)

    assert result is None


def test_returns_none_when_reference_empty() -> None:
    with patch("src.utils.match_face_to_person.face_recognition"):
        result = match_face_to_person([1.0] * 128, {}, threshold=0.6)
    assert result is None


def test_returns_correct_name_when_multiple_encodings_per_person(
    mock_face_distance,
) -> None:
    enc1 = [1.0] * 128
    enc2 = [1.2] * 128
    enc3 = [5.0] * 128
    reference = {"철수": [enc1, enc2], "영희": [enc3]}
    query = [1.1] * 128

    # flat order: 철수 enc1, 철수 enc2, 영희 enc3 → 거리 0.1, 0.2, 4.0
    mock_face_distance.face_distance.return_value = [0.1, 0.2, 4.0]

    result = match_face_to_person(query, reference, threshold=0.6)

    assert result == "철수"


def test_exactly_at_threshold_returns_name(mock_face_distance) -> None:
    enc = [1.0] * 128
    reference = {"철수": [enc]}
    mock_face_distance.face_distance.return_value = [0.6]

    result = match_face_to_person([1.0] * 128, reference, threshold=0.6)

    assert result == "철수"
