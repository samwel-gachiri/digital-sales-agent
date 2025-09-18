import requests
import json
from datetime import datetime

def check_coral_server():
    try:
        response = requests.get("http://localhost:5555", timeout=5)
        return True, f"Coral Server running (Status: {response.status_code})"
    except requests.exceptions.ConnectionError:
        return False, "Coral Server not running"
    except Exception as e:
        return False, f"Coral Server error: {str(e)}"

def check_backend():
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            agent_status = data.get("agent_status", "unknown")
            elevenlabs_status = data.get("elevenlabs_status", "unknown")
            return True, f"Backend running - Agent: {agent_status}, ElevenLabs: {elevenlabs_status}"
        else:
            return False, f"Backend unhealthy (Status: {response.status_code})"
    except requests.exceptions.ConnectionError:
        return False, "Backend not running"
    except Exception as e:
        return False, f"Backend error: {str(e)}"

def main():
    print("DIGITAL SALES AGENT SYSTEM CHECK")
    print("=" * 50)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    checks = [
        ("Coral Server", check_coral_server),
        ("Backend API", check_backend),
    ]

    for name, check_func in checks:
        success, message = check_func()
        status = "PASS" if success else "FAIL"
        print(f"{name}: {status} - {message}")

if __name__ == "__main__":
    main()