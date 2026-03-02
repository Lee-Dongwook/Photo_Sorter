"""classify_and_save 유닛 테스트."""

from pathlib import Path
from unittest.mock import patch

import pytest

from src.utils.classify_and_save import classify_and_save


def test_returns_empty_when_no_target_photos(tmp_path: Path) -> None:
    """대상 디렉터리에 이미지가 없으면 빈 dict 반환."""
    empty = tmp_path / "empty"
    empty.mkdir()
    result = classify_and_save(empty, tmp_path / "out", {}, 0.6, copy_mode=True)
    assert result == {}


def test_classifies_matched_as_person_name(tmp_path: Path) -> None:
    """매칭되면 해당 인물 이름 키로 분류."""
    target = tmp_path / "target"
    target.mkdir()
    (target / "a.jpg").write_bytes(b"\xff\xd8\xff")
    enc = [1.0] * 128
    reference = {"철수": [enc]}
    out = tmp_path / "out"

    with (
        patch("src.utils.classify_and_save.face_recognition") as m_fr,
        patch("src.utils.classify_and_save.match_face_to_person", return_value="철수"),
    ):
        m_fr.load_image_file.return_value = None
        m_fr.face_encodings.return_value = [enc]
        result = classify_and_save(target, out, reference, 0.6, copy_mode=True)

    assert "철수" in result
    assert len(result["철수"]) == 1
    assert result["철수"][0].name == "a.jpg"


def test_classifies_unmatched_as_unknown(tmp_path: Path) -> None:
    """매칭 실패 시 unknown으로 분류."""
    target = tmp_path / "target"
    target.mkdir()
    (target / "a.jpg").write_bytes(b"\xff\xd8\xff")
    reference = {"철수": [[1.0] * 128]}

    with (
        patch("src.utils.classify_and_save.face_recognition") as m_fr,
        patch("src.utils.classify_and_save.match_face_to_person", return_value=None),
    ):
        m_fr.load_image_file.return_value = None
        m_fr.face_encodings.return_value = [[2.0] * 128]
        result = classify_and_save(target, tmp_path / "out", reference, 0.6)

    assert "unknown" in result
    assert len(result["unknown"]) == 1
    assert result["unknown"][0].name == "a.jpg"


def test_skips_photo_with_no_face(tmp_path: Path) -> None:
    """얼굴 미검출 시 unknown으로 분류, match_face_to_person은 호출 안 함."""
    target = tmp_path / "target"
    target.mkdir()
    (target / "a.jpg").write_bytes(b"\xff\xd8\xff")

    with patch("src.utils.classify_and_save.face_recognition") as m_fr:
        m_fr.load_image_file.return_value = None
        m_fr.face_encodings.return_value = []
    with patch("src.utils.classify_and_save.match_face_to_person") as m_match:
        result = classify_and_save(target, tmp_path / "out", {}, 0.6)

    assert result["unknown"] == [target / "a.jpg"]
    m_match.assert_not_called()


def test_skips_on_load_error(tmp_path: Path) -> None:
    """이미지 로드 실패 시 unknown으로 분류."""
    target = tmp_path / "target"
    target.mkdir()
    (target / "a.jpg").write_bytes(b"\xff\xd8\xff")

    with patch("src.utils.classify_and_save.face_recognition") as m_fr:
        m_fr.load_image_file.side_effect = OSError("invalid image")
    with patch("src.utils.classify_and_save.match_face_to_person") as m_match:
        result = classify_and_save(target, tmp_path / "out", {}, 0.6)

    assert result["unknown"] == [target / "a.jpg"]
    m_match.assert_not_called()


def test_multiple_photos_split_by_match(tmp_path: Path) -> None:
    """여러 장을 각각 매칭 결과에 따라 인물별로 분류."""
    target = tmp_path / "target"
    target.mkdir()
    (target / "a.jpg").write_bytes(b"\xff\xd8\xff")
    (target / "b.png").write_bytes(b"\x89PNG")
    ref = {"철수": [[1.0] * 128], "영희": [[2.0] * 128]}

    with (
        patch("src.utils.classify_and_save.face_recognition") as m_fr,
        patch("src.utils.classify_and_save.match_face_to_person") as m_match,
    ):
        m_fr.load_image_file.return_value = None
        m_fr.face_encodings.return_value = [[1.0] * 128]
        m_match.side_effect = ["철수", "영희"]
        result = classify_and_save(target, tmp_path / "out", ref, 0.6)

    # glob 순서에 따라 철수/영희에 매핑되는 파일이 바뀔 수 있음
    assert len(result) == 2
    assert set(result.keys()) == {"철수", "영희"}
    paths = result["철수"] + result["영희"]
    assert set(p.name for p in paths) == {"a.jpg", "b.png"}
    assert len(result["철수"]) == 1 and len(result["영희"]) == 1
