"""
Photo Sorter Streamlit 웹 대시보드
실행: streamlit run app.py
- 사진 입력: 서버 업로드(간이 DB) + 브라우저 IndexedDB(간이). 나중에 실제 DB 연동 예정.
"""
import base64
import sys
from pathlib import Path

# 프로젝트 루트를 path에 추가 (config, src import용)
sys.path.insert(0, str(Path(__file__).resolve().parent))

import streamlit as st

from config import (
    COPY_MODE,
    DISTANCE_THRESHOLD,
    OUTPUT_DIR,
    REFERENCE_DIR,
    TARGET_DIR,
)
from src.sorter import classify_and_save, load_reference_encodings
from src.store import get_photo_store


def _indexed_db_html() -> None:
    """브라우저 IndexedDB에 사진 보관 + 서버로 전송(1장 데모) UI."""
    html = r"""
    <div id="idb-root" style="font-family: sans-serif;">
        <input type="file" id="idb-input" accept="image/jpeg,image/png,image/webp" multiple />
        <p id="idb-list">저장된 사진: 0장</p>
        <button id="idb-send">서버로 전송</button>
    </div>
    <script>
    (function() {
        const DB_NAME = 'photo_sorter_idb';
        const STORE_NAME = 'photos';
        let db = null;

        function openDB() {
            return new Promise((resolve, reject) => {
                const r = indexedDB.open(DB_NAME, 1);
                r.onerror = () => reject(r.error);
                r.onsuccess = () => { db = r.result; resolve(db); };
                r.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
            });
        }

        function getAll() {
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const req = tx.objectStore(STORE_NAME).getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => reject(req.error);
            });
        }

        function add(file) {
            return new Promise((resolve, reject) => {
                const id = Date.now() + '-' + Math.random().toString(36).slice(2);
                const reader = new FileReader();
                reader.onload = () => {
                    const tx = db.transaction(STORE_NAME, 'readwrite');
                    tx.objectStore(STORE_NAME).put({ id, name: file.name, data: reader.result });
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => reject(tx.error);
                };
                reader.readAsDataURL(file);
            });
        }

        const input = document.getElementById('idb-input');
        const listEl = document.getElementById('idb-list');
        const sendBtn = document.getElementById('idb-send');

        function refreshList() {
            getAll().then(items => {
                listEl.textContent = '저장된 사진: ' + items.length + '장';
            });
        }

        openDB().then(() => {
            refreshList();
            input.addEventListener('change', function() {
                const files = Array.from(this.files || []);
                Promise.all(files.map(f => add(f))).then(refreshList);
                this.value = '';
            });
            sendBtn.addEventListener('click', function() {
                getAll().then(items => {
                    if (items.length === 0) { alert('전송할 사진이 없습니다.'); return; }
                    var item = items[0];
                    var payload = [{ name: item.name, data: item.data }];
                    window.parent.location.href = window.location.pathname + '?idb_sent=1&payload=' + encodeURIComponent(JSON.stringify(payload));
                });
            });
        });
    })();
    </script>
    """
    st.components.v1.html(html, height=120)


st.set_page_config(page_title="Photo Sorter", page_icon="📷", layout="wide")
st.title("📷 Photo Sorter")
st.caption("얼굴 인식 기반 사진 분류 — 사진 입력(업로드/IndexedDB) → 분류 실행 → 결과")

store = get_photo_store()


def _get_query_param(key: str):
    """Streamlit 1.28(experimental_*) / 1.30+(query_params) 호환."""
    if hasattr(st, "query_params"):
        return st.query_params.get(key)
    params = st.experimental_get_query_params()
    vals = params.get(key, [])
    return vals[0] if vals else None


def _clear_query_params() -> None:
    """쿼리 파라미터 비우기 (버전 호환)."""
    if hasattr(st, "query_params") and hasattr(st.query_params, "clear"):
        st.query_params.clear()
    else:
        st.experimental_set_query_params({})


# IndexedDB → 서버 전송 (쿼리스트링으로 1장만 전달되는 데모)
_idb_query = _get_query_param("idb_sent")
_idb_payload = _get_query_param("payload")
if _idb_query and _idb_payload:
    try:
        import urllib.parse
        _payload = __import__("json").loads(urllib.parse.unquote(_idb_payload))
        for _item in _payload:
            _name = _item.get("name", "image.jpg")
            _data = _item.get("data", "")
            if _data.startswith("data:"):
                _data = _data.split(",", 1)[1]
            store.save(base64.b64decode(_data), _name)
        st.session_state["idb_sent"] = True
    except Exception as e:
        st.session_state["idb_sent_error"] = str(e)
    _clear_query_params()

# ---------- 사이드바 ----------
st.sidebar.header("설정")
st.sidebar.markdown(f"- **Reference:** `{REFERENCE_DIR}`")
st.sidebar.markdown(f"- **Target:** `{TARGET_DIR}` (또는 아래 업로드 저장소)")
st.sidebar.markdown(f"- **Output:** `{OUTPUT_DIR}`")
st.sidebar.markdown(f"- **Threshold:** {DISTANCE_THRESHOLD}")
st.sidebar.markdown(f"- **모드:** {'복사' if COPY_MODE else '이동'}")

use_upload_store = st.sidebar.checkbox(
    "분류 대상: 업로드 저장소 사용",
    value=True,
    help="체크 시 업로드한 사진만 분류, 해제 시 target 폴더 사용",
)

run = st.sidebar.button("🔄 분류 실행")

# ---------- 메인: 사진 입력 ----------
st.subheader("📤 사진 입력")

tab_upload, tab_idb = st.tabs(["서버 업로드 (간이 DB)", "브라우저 IndexedDB (간이)"])

with tab_upload:
    uploaded = st.file_uploader(
        "분류할 사진을 올려 주세요",
        type=["jpg", "jpeg", "png", "webp"],
        accept_multiple_files=True,
    )
    if uploaded:
        for f in uploaded:
            data = f.getvalue()
            store.save(data, f.name)
        st.success(f"{len(uploaded)}장 저장됨 (간이 DB). 아래 목록에서 확인하세요.")
        st.rerun()

    records = store.list_photos()
    if records:
        st.markdown(f"**저장된 사진 ({len(records)}장)**")
        cols = st.columns(min(4, len(records)) or 1)
        for i, r in enumerate(records[:20]):
            with cols[i % (min(4, len(records)) or 1)]:
                if r.path.exists():
                    st.image(str(r.path), caption=r.filename, use_container_width=True)
                else:
                    st.caption(f"⚠️ {r.filename} (파일 없음)")
        if len(records) > 20:
            st.caption(f"… 외 {len(records) - 20}장")
    else:
        st.info("위에서 사진을 업로드하면 여기 저장됩니다. (나중에 DB 연동 예정)")

with tab_idb:
    # 브라우저 IndexedDB 간이 사용 (나중에 DB/커스텀 컴포넌트로 전송 연동 예정)
    st.caption("브라우저에만 보관 (IndexedDB). '서버로 전송' 시 1장만 서버 저장(데모).")
    _indexed_db_html()
    if st.session_state.get("idb_sent"):
        st.success("IndexedDB에서 전송된 사진을 서버 저장소에 저장했습니다.")
        del st.session_state["idb_sent"]
    if st.session_state.get("idb_sent_error"):
        st.warning("전송 실패: " + st.session_state["idb_sent_error"])
        del st.session_state["idb_sent_error"]

# ---------- 분류 실행 및 결과 ----------
if run:
    target_dir = store.dir_for_scan() if use_upload_store else TARGET_DIR
    if not target_dir.is_dir():
        st.warning(f"대상 폴더가 없습니다: {target_dir}")
        st.stop()

    with st.spinner("Reference 인코딩 로드 중…"):
        reference_encodings = load_reference_encodings(REFERENCE_DIR)

    if not reference_encodings:
        st.warning(
            f"Reference 폴더(`{REFERENCE_DIR}`)에 인물 기준 사진이 없거나 "
            "얼굴이 검출되지 않았습니다. kids/철수.jpg, kids/영희.jpg 형태로 넣어 주세요."
        )
        st.stop()

    with st.spinner("대상 사진 스캔·매칭 중…"):
        result = classify_and_save(
            target_dir,
            OUTPUT_DIR,
            reference_encodings,
            DISTANCE_THRESHOLD,
            copy_mode=COPY_MODE,
        )

    total = sum(len(paths) for paths in result.values())
    if total == 0:
        st.info(
            f"대상 폴더(`{target_dir}`)에 분류할 이미지가 없습니다. "
            "사진을 업로드하거나 target 폴더에 넣어 주세요."
        )
        st.stop()

    st.success(f"분류 완료 — 총 **{total}**장")
    st.subheader("결과 요약")

    for name, paths in sorted(result.items(), key=lambda x: -len(x[1])):
        with st.expander(f"**{name}** — {len(paths)}장", expanded=(len(paths) <= 10)):
            for i, p in enumerate(paths[:50], 1):
                st.text(f"  {i}. {p.name}")
            if len(paths) > 50:
                st.caption(f"… 외 {len(paths) - 50}장")

else:
    st.subheader("결과")
    st.info("왼쪽에서 **분류 실행**을 누르면 여기에 결과가 표시됩니다.")
    if not REFERENCE_DIR.is_dir():
        st.caption(f"💡 `{REFERENCE_DIR}` 폴더에 인물별 기준 사진(파일명=이름)을 넣어 두세요.")


