# Photo Sorter — 핵심 로직 구현 가이드라인

이 문서는 `src/sorter.py`의 네 가지 함수를 **순서대로** 구현할 때 참고하는 가이드입니다.  
하나씩 구현한 뒤 `main.py`에서 연결해 전체 플로우를 완성하세요.

---

## 0. 사전 준비

- **의존성**: `face_recognition`, `Pillow`(또는 OpenCV)가 `requirements.txt`에 있어야 함.
- **용어**
  - **Reference**: 기준 사진 — `kids/철수.jpg`처럼 **인물 이름**이 파일명에 들어 있는 사진.
  - **Encoding**: `face_recognition`이 얼굴에서 뽑은 128차원 벡터. 이걸로 “누구 얼굴인지” 비교함.
  - **Threshold**: 유클리드 거리가 이 값 **이하**면 “같은 사람”으로 판단 (보통 `0.6`).

---

## 1단계: `scan_target_photos(target_dir)`

**목적**: 분류할 **대상 사진 파일 목록**만 만드는 것. 얼굴 인식은 하지 않음.

**할 일**

1. `target_dir`이 존재하는지 확인하고, 없으면 빈 리스트 반환 또는 예외 처리.
2. 이미지 확장자만 골라서 리스트로 반환 (예: `.jpg`, `.jpeg`, `.png`, `.webp` 등).
3. 반환 타입: `list[Path]`.

**힌트**

- `Path.iterdir()`, `Path.glob("**/*")` 등으로 파일 순회.
- 확장자는 `path.suffix.lower()`로 통일해서 비교.
- `Path` 객체 그대로 반환하면 다음 단계에서 그대로 사용 가능.

**체크리스트**

- [ ] `target/`에 jpg, png 넣고 호출 시 해당 경로들만 반환되는지 확인.

---

## 2단계: `load_reference_encodings(reference_dir)`

**목적**: `kids/` 같은 폴더에서 **인물별 얼굴 인코딩**을 로드.  
파일명에서 이름 추출 (예: `철수.jpg` → `"철수"`), 한 사람당 여러 장이면 인코딩을 리스트로 묶음.

**할 일**

1. `reference_dir` 내 이미지 파일만 순회 (확장자 필터링은 1단계와 동일).
2. 파일명에서 **인물 이름** 추출: `stem` 사용 (확장자 제거). 예: `Path("철수.jpg").stem` → `"철수"`.
3. 각 이미지에 대해:
   - `face_recognition.load_image_file(path)` 로 이미지 로드.
   - `face_recognition.face_encodings(img)` 로 얼굴 인코딩 리스트 획득.
   - 한 장에 얼굴이 여러 개면 여러 개 다 넣거나, 첫 번째만 써도 됨 (가이드: 한 장당 한 얼굴 기준 사진 권장).
4. 반환: `dict[str, list]` — 키는 인물 이름, 값은 그 인물의 인코딩 리스트.

**주의**

- 얼굴이 검출 안 되면 해당 파일은 스킵하거나 로그만 남기고 진행.
- `reference_dir`이 없거나 비어 있으면 빈 딕셔너리 반환 처리.

**체크리스트**

- [ ] `kids/철수.jpg`, `kids/영희.jpg` 넣고 호출 시 `{"철수": [...], "영희": [...]}` 형태로 나오는지 확인.
- [ ] 인코딩 하나당 길이 128인 리스트인지 확인 (`len(encoding) == 128`).

---

## 3단계: `match_face_to_person(face_encoding, reference_encodings, threshold)`

**목적**: **한 개**의 얼굴 인코딩이 reference 인물들 중 누구와 가장 가까운지 판별.

**할 일**

1. `reference_encodings`: `{"철수": [enc1, enc2], "영희": [enc3]}` 형태.
2. 모든 reference 인코딩과 `face_encoding` 사이의 **유클리드 거리** 계산.
   - `face_recognition.face_distance(list_of_encodings, face_encoding)` 사용하면 한 번에 거리 리스트 나옴.
3. 거리 중 **최솟값**이 `threshold` **이하**일 때만 매칭 성공.
4. 매칭 성공 시 → 그 최솟값에 해당하는 **인물 이름** 반환.  
   실패 시 → `None` 반환.

**힌트**

- `face_distance`에 넘길 때는 “평탄한 리스트”가 필요할 수 있음.  
  예: `ref_encodings_flat = [e for encs in reference_encodings.values() for e in encs]`  
  그리고 “몇 번째 인코딩이 어떤 이름인지” 인덱스–이름 매핑을 만들어 두면, 최솟값 인덱스로 이름을 찾을 수 있음.

**체크리스트**

- [ ] 알려진 얼굴 인코딩 넣었을 때 해당 인물 이름이 나오는지.
- [ ] threshold보다 먼 얼굴은 `None`이 나오는지.

---

## 4단계: `classify_and_save(target_dir, output_dir, reference_encodings, threshold, copy_mode)`

**목적**: 전체 파이프라인 — 대상 사진 스캔 → 얼굴 검출 → 매칭 → `output/인물명/`에 복사 또는 이동.

**할 일**

1. `scan_target_photos(target_dir)` 로 대상 파일 목록 획득.
2. `load_reference_encodings`는 이미 `main`에서 호출해 넘겨주므로, 여기선 `reference_encodings`만 사용.
3. 결과 담을 구조: `dict[str, list[Path]]` — 키는 인물 이름 또는 `"unknown"`, 값은 그 인물로 분류된 파일 경로 리스트.
4. 각 대상 파일에 대해:
   - 이미지 로드 → `face_encodings(img)` 로 얼굴 인코딩 리스트 획득.
   - 얼굴이 0개: 해당 사진은 `"unknown"` 등으로 분류 (또는 스킵 정책에 따라).
   - 얼굴이 1개 이상:
     - 정책 선택: “한 사진에 여러 얼굴이 있으면 한 명이라도 매칭되면 그 인물 폴더로” vs “가장 가까운 한 명만” 등.
     - 가이드: **가장 가까운 한 명**으로 분류하거나, **한 명이라도 매칭되면 그 인물**로 두는 방식 중 하나로 통일.
   - `match_face_to_person(enc, reference_encodings, threshold)` 로 이름 획득 → 없으면 `"unknown"`.
5. `output_dir / name` 폴더가 없으면 생성 (`mkdir(parents=True, exist_ok=True)`).
6. `copy_mode`가 True면 `shutil.copy2(src, dst)`, False면 `shutil.move(src, dst)`.
7. 복사/이동한 경로를 `result[name].append(dst_path)` 형태로 저장.
8. 반환: `result` (`dict[str, list[Path]]`).

**주의**

- 파일명 충돌 방지: 같은 이름 파일이 이미 있으면 덮어쓸 수 있으므로, 필요 시 `output_dir / name / source_file.name` 에서 이름에 번호 붙이기 등 처리.
- 대용량 시 메모리: 이미지 한 장씩 열고 닫으면서 처리하면 안정적.

**체크리스트**

- [ ] `target/`에 사진 넣고 실행 시 `output/철수/`, `output/영희/`, `output/unknown/` 등에 파일이 들어가는지.
- [ ] `COPY_MODE = False`일 때는 원본이 이동하는지 확인.

---

## 5단계: `main.py`에서 연결

`sorter`의 네 함수가 모두 구현되면:

1. `load_reference_encodings(REFERENCE_DIR)` 호출.
2. `classify_and_save(TARGET_DIR, OUTPUT_DIR, reference_encodings, DISTANCE_THRESHOLD, COPY_MODE)` 호출.
3. 반환된 `result`를 순회하며 `f"{name}: {len(paths)}장"` 형태로 출력.

`config.py`의 `REFERENCE_DIR`, `TARGET_DIR`, `OUTPUT_DIR`, `DISTANCE_THRESHOLD`, `COPY_MODE`를 그대로 사용하면 됨.

---

## 구현 순서 요약

| 순서 | 함수                       | 의존성                 |
| ---- | -------------------------- | ---------------------- |
| 1    | `scan_target_photos`       | 없음                   |
| 2    | `load_reference_encodings` | face_recognition       |
| 3    | `match_face_to_person`     | face_recognition       |
| 4    | `classify_and_save`        | 위 세 함수 + shutil 등 |
| 5    | `main.py` 연동             | config, sorter         |

---

## 참고: face_recognition API 요약

- `face_recognition.load_image_file(path)` → numpy 배열 (RGB).
- `face_recognition.face_encodings(image)` → list of 128-d encodings.
- `face_recognition.face_distance(list_of_encodings, single_encoding)` → list of distances (float).

이 가이드대로 1 → 2 → 3 → 4 → 5 순서로 구현하면 전체 플로우가 완성됩니다.
