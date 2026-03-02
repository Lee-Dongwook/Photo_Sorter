"""load_reference_encodings 유닛 테스트."""

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from src.utils.load_reference_encodings import load_reference_encodings


@pytest.fixture
def mock_face_recognition():
    """face_recognition 모듈을 모킹해 실제 이미지/인코딩 없이 테스트."""
    with patch("src.utils.load_reference_encodings.face_recognition") as m:
        yield m


class TestWhenDirInvalid:
    """reference_dir이 없거나 디렉터리가 아닐 때."""

    def test_returns_empty_dict_when_path_does_not_exist(self, tmp_path: Path) -> None:
        missing = tmp_path / "nonexistent"
        assert not missing.exists()
        assert load_reference_encodings(missing) == {}

    def test_returns_empty_dict_when_path_is_file_not_dir(self, tmp_path: Path) -> None:
        a_file = tmp_path / "file.txt"
        a_file.write_text("x")
        assert a_file.is_file()
        assert load_reference_encodings(a_file) == {}

    def test_returns_empty_dict_when_dir_empty(self, tmp_path: Path) -> None:
        assert load_reference_encodings(tmp_path) == {}


class TestExtensionFiltering:
    """확장자 필터링: 지원 확장자만 처리."""

    def test_skips_txt_and_other_non_images(
        self, tmp_path: Path, mock_face_recognition: MagicMock
    ) -> None:
        (tmp_path / "철수.txt").write_text("x")
        (tmp_path / "영희.gif").write_text("x")
        (tmp_path / "readme.md").write_text("x")
        assert load_reference_encodings(tmp_path) == {}
        mock_face_recognition.load_image_file.assert_not_called()

    def test_processes_supported_extensions(
        self, tmp_path: Path, mock_face_recognition: MagicMock
    ) -> None:
        fake_enc = [1.0] * 128
        mock_face_recognition.load_image_file.return_value = None
        mock_face_recognition.face_encodings.return_value = [fake_enc]

        (tmp_path / "a.jpg").write_bytes(b"\xff\xd8\xff")
        (tmp_path / "b.jpeg").write_bytes(b"\xff\xd8\xff")
        (tmp_path / "c.png").write_bytes(b"\x89PNG")
        (tmp_path / "d.webp").write_bytes(b"RIFF")

        result = load_reference_encodings(tmp_path)

        assert set(result.keys()) == {"a", "b", "c", "d"}
        assert mock_face_recognition.load_image_file.call_count == 4


class TestNameExtraction:
    """파일명(stem)에서 인물 이름 추출."""

    def test_uses_stem_as_name(
        self, tmp_path: Path, mock_face_recognition: MagicMock
    ) -> None:
        (tmp_path / "철수.jpg").write_bytes(b"\xff\xd8\xff")
        mock_face_recognition.load_image_file.return_value = None
        mock_face_recognition.face_encodings.return_value = [[1.0] * 128]

        result = load_reference_encodings(tmp_path)

        assert "철수" in result
        assert len(result["철수"]) == 1

    def test_subdir_stem_used(
        self, tmp_path: Path, mock_face_recognition: MagicMock
    ) -> None:
        sub = tmp_path / "sub"
        sub.mkdir()
        (sub / "영희.png").write_bytes(b"\x89PNG")
        mock_face_recognition.load_image_file.return_value = None
        mock_face_recognition.face_encodings.return_value = [[2.0] * 128]

        result = load_reference_encodings(tmp_path)

        assert "영희" in result
        assert len(result["영희"]) == 1


class TestMultipleImagesPerPerson:
    """한 인물당 여러 장일 때 인코딩 리스트로 묶음."""

    def test_combines_encodings_for_same_name(
        self, tmp_path: Path, mock_face_recognition: MagicMock
    ) -> None:
        (tmp_path / "철수.jpg").write_bytes(b"\xff\xd8\xff")
        (tmp_path / "철수.png").write_bytes(b"\x89PNG")
        enc1, enc2 = [1.0] * 128, [2.0] * 128
        mock_face_recognition.load_image_file.return_value = None
        mock_face_recognition.face_encodings.side_effect = [[enc1], [enc2]]

        result = load_reference_encodings(tmp_path)

        assert result["철수"] == [enc1, enc2]


class TestSkipConditions:
    """얼굴 미검출, 로드 실패 시 스킵."""

    def test_skips_when_no_face_detected(
        self, tmp_path: Path, mock_face_recognition: MagicMock
    ) -> None:
        (tmp_path / "무얼굴.jpg").write_bytes(b"\xff\xd8\xff")
        mock_face_recognition.load_image_file.return_value = None
        mock_face_recognition.face_encodings.return_value = []  # 얼굴 없음

        result = load_reference_encodings(tmp_path)

        assert result == {}

    def test_skips_on_load_os_error(
        self, tmp_path: Path, mock_face_recognition: MagicMock
    ) -> None:
        (tmp_path / "손상.jpg").write_bytes(b"\xff\xd8\xff")
        mock_face_recognition.load_image_file.side_effect = OSError("invalid image")

        result = load_reference_encodings(tmp_path)

        assert result == {}

    def test_continues_after_one_file_fails(
        self, tmp_path: Path, mock_face_recognition: MagicMock
    ) -> None:
        (tmp_path / "bad.jpg").write_bytes(b"x")
        (tmp_path / "good.jpg").write_bytes(b"\xff\xd8\xff")
        enc = [1.0] * 128
        mock_face_recognition.load_image_file.return_value = None
        mock_face_recognition.face_encodings.side_effect = [
            [],           # 첫 번째 파일: 얼굴 없음
            [enc],        # 두 번째 파일: 정상 (glob 순서에 따라 bad/good 중 하나)
        ]

        result = load_reference_encodings(tmp_path)

        # 한 파일은 스킵, 한 파일만 인코딩 1개 반환 (순서 무관)
        assert len(result) == 1
        (_, encodings) = next(iter(result.items()))
        assert len(encodings) == 1 and encodings[0] == enc


class TestMultipleFacesPerImage:
    """한 장에 얼굴이 여러 개면 모두 extend."""

    def test_extends_all_encodings_from_one_image(
        self, tmp_path: Path, mock_face_recognition: MagicMock
    ) -> None:
        (tmp_path / "두명.jpg").write_bytes(b"\xff\xd8\xff")
        enc1, enc2 = [1.0] * 128, [2.0] * 128
        mock_face_recognition.load_image_file.return_value = None
        mock_face_recognition.face_encodings.return_value = [enc1, enc2]

        result = load_reference_encodings(tmp_path)

        assert result["두명"] == [enc1, enc2]
