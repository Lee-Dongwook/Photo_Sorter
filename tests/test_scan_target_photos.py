"""scan_target_photos 유닛 테스트."""

from pathlib import Path

import pytest

from src.utils.scan_target_photos import scan_target_photos


class TestWhenDirInvalid:
    """target_dir이 없거나 디렉터리가 아닐 때."""

    def test_returns_empty_list_when_path_does_not_exist(self, tmp_path: Path) -> None:
        missing = tmp_path / "nonexistent"
        assert not missing.exists()
        assert scan_target_photos(missing) == []

    def test_returns_empty_list_when_path_is_file(self, tmp_path: Path) -> None:
        (tmp_path / "file.txt").write_text("x")
        assert scan_target_photos(tmp_path / "file.txt") == []


class TestExtensionFiltering:
    """이미지 확장자만 반환."""

    def test_returns_only_image_files(self, tmp_path: Path) -> None:
        (tmp_path / "a.jpg").write_bytes(b"\xff\xd8\xff")
        (tmp_path / "b.jpeg").write_bytes(b"\xff\xd8\xff")
        (tmp_path / "c.png").write_bytes(b"\x89PNG")
        (tmp_path / "d.webp").write_bytes(b"RIFF")
        (tmp_path / "e.txt").write_text("x")
        (tmp_path / "f.gif").write_bytes(b"GIF")

        result = scan_target_photos(tmp_path)

        paths = {p.name for p in result}
        assert paths == {"a.jpg", "b.jpeg", "c.png", "d.webp"}
        assert len(result) == 4

    def test_skips_non_image_extensions(self, tmp_path: Path) -> None:
        (tmp_path / "readme.md").write_text("#")
        (tmp_path / "data.json").write_text("{}")
        assert scan_target_photos(tmp_path) == []

    def test_empty_dir_returns_empty_list(self, tmp_path: Path) -> None:
        assert scan_target_photos(tmp_path) == []


class TestSubdirs:
    """하위 디렉터리 재귀 스캔."""

    def test_includes_images_in_subdirs(self, tmp_path: Path) -> None:
        (tmp_path / "top.jpg").write_bytes(b"\xff\xd8\xff")
        sub = tmp_path / "sub"
        sub.mkdir()
        (sub / "nested.png").write_bytes(b"\x89PNG")

        result = scan_target_photos(tmp_path)

        names = {p.name for p in result}
        assert names == {"top.jpg", "nested.png"}
        assert len(result) == 2


class TestCaseInsensitive:
    """확장자 대소문자 무시."""

    def test_accepts_uppercase_extensions(self, tmp_path: Path) -> None:
        (tmp_path / "a.JPG").write_bytes(b"\xff\xd8\xff")
        (tmp_path / "b.PNG").write_bytes(b"\x89PNG")

        result = scan_target_photos(tmp_path)

        assert len(result) == 2
        assert {p.suffix for p in result} == {".JPG", ".PNG"}
