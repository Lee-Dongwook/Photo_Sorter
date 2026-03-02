# Photo Sorter - Makefile
# 사용: make        → CLI 실행 (main.py)
#       make app    → Streamlit 대시보드 실행
#       make run    → make와 동일 (CLI)

.PHONY: run app help install test

# 기본 타깃: CLI 실행
run:
	python main.py

# make만 입력해도 run 실행
default: run

# Streamlit 웹 앱 실행
app:
	streamlit run app.py

# 유닛 테스트
test:
	python -m pytest tests/ -v

# 도움말
help:
	@echo "Photo Sorter - 사용법"
	@echo "  make        또는  make run  → CLI 실행 (python main.py)"
	@echo "  make app                    → Streamlit 대시보드 (streamlit run app.py)"
	@echo "  make test                   → pytest 유닛 테스트"
	@echo "  make help                   → 이 도움말"

# 가상환경 + 의존성 설치 (선택)
install:
	python -m venv .venv
	@echo "가상환경 생성됨. 활성화: source .venv/bin/activate (Windows: .venv\\Scripts\\activate)"
	@echo "이후: pip install -r requirements.txt"
