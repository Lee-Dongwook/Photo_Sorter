from pathlib import Path

import face_recognition

_SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def load_reference_encodings(reference_dir: Path) -> dict[str, list]:
    """
    Reference 폴더(kids/)에서 인물별 얼굴 인코딩을 로드합니다.

    파일명에서 인물 이름을 추출합니다 (예: kids/철수.jpg → '철수').
    한 인물당 여러 장이면 인코딩을 리스트로 묶어 반환합니다.

    Args:
        reference_dir: 기준 사진이 있는 디렉터리 (예: Path("kids")).

    Returns:
        인물 이름을 키로, 해당 인물의 얼굴 인코딩 리스트를 값으로 하는 딕셔너리.
        예: {"철수": [enc1, enc2], "영희": [enc3]}
    """
    reference_encodings: dict[str, list] = {}

    if not reference_dir.is_dir():
        return reference_encodings

    for path in reference_dir.glob("**/*"):
        if not path.is_file() or path.suffix.lower() not in _SUPPORTED_EXTENSIONS:
            continue

        name = path.stem
        try:
            image = face_recognition.load_image_file(str(path))
            encodings = face_recognition.face_encodings(image)
        except OSError:
            continue

        if not encodings:
            continue  

        if name not in reference_encodings:
            reference_encodings[name] = []
        
        reference_encodings[name].extend(encodings)

    return reference_encodings
