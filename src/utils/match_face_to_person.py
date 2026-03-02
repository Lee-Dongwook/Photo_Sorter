import face_recognition

def match_face_to_person(face_encoding: list, reference_encodings: dict[str, list], threshold: float) -> str | None:
    """
    한 얼굴 인코딩을 reference와 유클리드 거리로 비교.
    threshold 이하인 경우 가장 가까운 인물 이름 반환, 없으면 None.
    """

    distances = face_recognition.face_distance(reference_encodings, face_encoding)
    min_distance = min(distances)
    if min_distance <= threshold:
        return reference_encodings[distances.index(min_distance)]
    else:
        return None
