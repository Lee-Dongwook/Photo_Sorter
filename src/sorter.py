"""
Photo Sorter 핵심 모듈 (스켈레톤)
워크플로우: [학습 데이터 로드] → [대상 사진 스캔] → [얼굴 인코딩 비교] → [파일 분류]
"""
from pathlib import Path

# TODO: 핵심 로직은 여기에 차근차근 구현


def load_reference_encodings(reference_dir: Path) -> dict[str, list]:
    """
    Reference 폴더(kids/)에서 인물별 얼굴 인코딩 로드.
    파일명/폴더명에서 이름 추출 (예: kids/철수.jpg → '철수')
    Returns: { "철수": [encoding, ...], "영희": [encoding, ...] }
    """
    raise NotImplementedError("TODO: 구현 예정")


def scan_target_photos(target_dir: Path) -> list[Path]:
    """대상 폴더에서 분류할 사진 파일 목록 반환 (이미지 확장자만)."""
    raise NotImplementedError("TODO: 구현 예정")


def match_face_to_person(face_encoding: list, reference_encodings: dict[str, list], threshold: float) -> str | None:
    """
    한 얼굴 인코딩을 reference와 유클리드 거리로 비교.
    threshold 이하인 경우 가장 가까운 인물 이름 반환, 없으면 None.
    """
    raise NotImplementedError("TODO: 구현 예정")


def classify_and_save(
    target_dir: Path,
    output_dir: Path,
    reference_encodings: dict[str, list],
    threshold: float,
    copy_mode: bool = True,
) -> dict[str, list[Path]]:
    """
    대상 사진 스캔 → 얼굴 검출 → 매칭 → output/인물명/ 폴더로 복사 또는 이동.
    Returns: { "철수": [Path, ...], "영희": [Path, ...], "unknown": [...] }
    """
    raise NotImplementedError("TODO: 구현 예정")
