# ~/.claude/hooks/security_hook.py
#!/usr/bin/env python3
import json, sys, os
from pathlib import Path
  
def is_safe_path(file_path):
    try:
        Path(file_path).resolve().relative_to(Path.cwd().resolve())
        return True
    except ValueError:
        return False

def is_dangerous_command(cmd):
    dangerous = ["rm -rf", "sudo", "/etc/passwd", "chmod 777"]
    return any(danger in cmd.lower() for danger in dangerous)
  
# 메인 로직
input_data = json.load(sys.stdin)
tool_name = input_data.get('tool_name', '')
tool_input = input_data.get('tool_input', {})

# 파일 접근 검사
if tool_name in ['Read', 'Write', 'Edit']:
    file_path = tool_input.get('file_path', '')
    if not is_safe_path(file_path) or any(sensitive in file_path for sensitive in ['.env', '.ssh', '.aws']):
        print("차단됨: 위험한 파일 접근", file=sys.stderr)
        sys.exit(2)

# 명령어 검사
elif tool_name == 'Bash':
    command = tool_input.get('command', '')
    if is_dangerous_command(command):
        print("차단됨: 위험한 명령어", file=sys.stderr)
        sys.exit(2)

sys.exit(0)  # 허용
