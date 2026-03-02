import face_recognition


def match_face_to_person(
    face_encoding: list,
    reference_encodings: dict[str, list],
    threshold: float,
) -> str | None:
    """
    한 얼굴 인코딩을 reference와 유클리드 거리로 비교.
    threshold 이하인 경우 가장 가까운 인물 이름 반환, 없으면 None.
    """
    flat_encodings: list = []
    names: list[str] = []
    for name, encodings in reference_encodings.items():
        for enc in encodings:
            flat_encodings.append(enc)
            names.append(name)

    if not flat_encodings:
        return None

    distances = face_recognition.face_distance(flat_encodings, face_encoding)
    min_idx = min(range(len(distances)), key=lambda i: distances[i])
    min_distance = distances[min_idx]

    if min_distance <= threshold:
        return names[min_idx]
    return None
