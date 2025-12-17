"""
BrainSpark AI Model Integration Test Script
Tests Claude, Grok, and failover functionality
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_EMAIL = f"test_{datetime.now().timestamp()}@brainspark.test"
TEST_PASSWORD = "TestPassword123!"
TEST_CHILD_NAME = "TestChild"

# Colors for output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text:^60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}[OK] {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}[ERROR] {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}[INFO] {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}[WARN] {text}{Colors.ENDC}")

# Global variables
token = None
child_token = None  # Token for child user
child_id = None
conversation_id = None

def test_health_check():
    """Test if backend is running"""
    print_header("Health Check")
    try:
        response = requests.get(f"{BASE_URL.replace('/api', '')}/health")
        if response.status_code == 200:
            print_success("Backend is running!")
            return True
        else:
            print_error(f"Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Backend is not accessible: {e}")
        return False

def test_register():
    """Register a new test user"""
    print_header("User Registration")
    global token

    data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "name": "Test Parent",
        "role": "parent"
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=data)
        if response.status_code == 200:
            result = response.json()
            token = result["access_token"]
            print_success(f"Registered user: {TEST_EMAIL}")
            print_info(f"Token: {token[:20]}...")
            return True
        else:
            print_error(f"Registration failed: {response.text}")
            return False
    except Exception as e:
        print_error(f"Registration error: {e}")
        return False

def test_create_child():
    """Create a child profile"""
    print_header("Create Child Profile")
    global child_id, child_token

    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "name": TEST_CHILD_NAME,
        "age_group": "explorers",
        "avatar": "🧒"
    }

    try:
        response = requests.post(f"{BASE_URL}/children", json=data, headers=headers)
        if response.status_code == 201:
            result = response.json()
            print_info(f"Response: {result}")  # Debug
            child_id = result["child_id"]
            child_token = result.get("child_token")  # Get child token
            print_success(f"Created child profile: {TEST_CHILD_NAME}")
            print_info(f"Child ID: {child_id}")
            if child_token:
                print_info(f"Child Token: {child_token[:20]}...")
            else:
                print_error("No child_token in response!")
            return True
        else:
            print_error(f"Child creation failed: {response.text}")
            return False
    except Exception as e:
        print_error(f"Child creation error: {e}")
        return False

def test_grok_model():
    """Test Grok model directly"""
    print_header("Test 1: Grok Model (Direct)")
    global conversation_id

    headers = {"Authorization": f"Bearer {child_token}"}
    data = {
        "topic": "Space",
        "message": "Why is the sky blue?",
        "age_group": "explorers",
        "preferred_model": "grok",
        "enable_fallback": False  # Don't fallback, we want to test Grok only
    }

    print_info("Sending request to Grok API...")
    print_info(f"Model: grok (no fallback)")

    try:
        response = requests.post(f"{BASE_URL}/chat", json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            conversation_id = result["conversation_id"]

            print_success("Grok API responded successfully!")
            print_info(f"Model used: {result.get('model_used', 'unknown')}")
            print_info(f"Depth: {result['depth']}")
            print_info(f"Stars earned: {result['stars_earned']}")
            print(f"\n{Colors.OKBLUE}Response:{Colors.ENDC}")
            print(f"{result['response'][:200]}...")

            if result.get('model_used') == 'grok':
                print_success("Grok model working correctly!")
                return True
            else:
                print_warning(f"Expected 'grok' but got '{result.get('model_used')}'")
                return False
        else:
            print_error(f"Chat request failed: {response.text}")
            return False
    except Exception as e:
        print_error(f"Chat error: {e}")
        return False

def test_claude_model():
    """Test Claude model (should fail with placeholder key)"""
    print_header("Test 2: Claude Model (Expected to Fail)")

    headers = {"Authorization": f"Bearer {child_token}"}
    data = {
        "topic": "Science",
        "message": "What are atoms made of?",
        "age_group": "explorers",
        "preferred_model": "claude",
        "enable_fallback": False  # Don't fallback
    }

    print_info("Sending request to Claude API...")
    print_info("Model: claude (no fallback)")
    print_warning("Expected to fail with placeholder API key")

    try:
        response = requests.post(f"{BASE_URL}/chat", json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            model_used = result.get('model_used', 'unknown')

            if model_used == 'fallback':
                print_success("Correctly using fallback response (Claude key is placeholder)")
                print_info(f"Response preview: {result['response'][:100]}...")
                return True
            elif model_used == 'claude':
                print_warning("Claude API responded (unexpected - is your key real?)")
                return True
            else:
                print_error(f"Unexpected model: {model_used}")
                return False
        else:
            print_error(f"Chat request failed: {response.text}")
            return False
    except Exception as e:
        print_error(f"Chat error: {e}")
        return False

def test_failover_claude_to_grok():
    """Test automatic failover from Claude to Grok"""
    print_header("Test 3: Failover (Claude -> Grok)")

    headers = {"Authorization": f"Bearer {child_token}"}
    data = {
        "topic": "Nature",
        "message": "How do trees make oxygen?",
        "age_group": "explorers",
        "preferred_model": "claude",
        "enable_fallback": True  # Enable fallback
    }

    print_info("Sending request to Claude API with fallback enabled...")
    print_info("Expected: Claude fails -> Grok succeeds")

    try:
        response = requests.post(f"{BASE_URL}/chat", json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            model_used = result.get('model_used', 'unknown')

            print_info(f"Model used: {model_used}")

            if model_used == 'grok':
                print_success("Failover successful! Claude failed -> Grok responded")
                print(f"\n{Colors.OKBLUE}Grok Response:{Colors.ENDC}")
                print(f"{result['response'][:200]}...")
                return True
            elif model_used == 'claude':
                print_warning("Claude responded (is your Claude key valid?)")
                return True
            else:
                print_error(f"Unexpected model: {model_used}")
                return False
        else:
            print_error(f"Chat request failed: {response.text}")
            return False
    except Exception as e:
        print_error(f"Chat error: {e}")
        return False

def test_default_model():
    """Test default model (from .env)"""
    print_header("Test 4: Default Model (from .env)")

    headers = {"Authorization": f"Bearer {child_token}"}
    data = {
        "topic": "Math",
        "message": "Why is pi infinite?",
        "age_group": "masters",
        # Don't specify preferred_model - use default from .env
        "enable_fallback": True
    }

    print_info("Sending request without specifying model...")
    print_info("Should use DEFAULT_AI_MODEL from .env (claude with fallback to grok)")

    try:
        response = requests.post(f"{BASE_URL}/chat", json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            model_used = result.get('model_used', 'unknown')

            print_info(f"Model used: {model_used}")

            if model_used in ['claude', 'grok']:
                print_success(f"Default model working! Used: {model_used}")
                print(f"\n{Colors.OKBLUE}Response:{Colors.ENDC}")
                print(f"{result['response'][:200]}...")
                return True
            else:
                print_warning(f"Using fallback responses: {model_used}")
                return True
        else:
            print_error(f"Chat request failed: {response.text}")
            return False
    except Exception as e:
        print_error(f"Chat error: {e}")
        return False

def test_conversation_continuity():
    """Test conversation continues in same thread"""
    print_header("Test 5: Conversation Continuity")

    headers = {"Authorization": f"Bearer {child_token}"}
    data = {
        "topic": "Space",
        "message": "Tell me more about that!",
        "conversation_id": conversation_id,  # Continue previous conversation
        "age_group": "explorers",
        "preferred_model": "grok"
    }

    print_info(f"Continuing conversation: {conversation_id}")

    try:
        response = requests.post(f"{BASE_URL}/chat", json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()

            if result['conversation_id'] == conversation_id:
                print_success("Conversation continuity maintained!")
                print_info(f"Depth: {result['depth']}")
                print_info(f"Stars earned: {result['stars_earned']}")

                if result['depth'] > 1:
                    print_success(f"Depth increased to {result['depth']}")

                return True
            else:
                print_error("Conversation ID changed unexpectedly")
                return False
        else:
            print_error(f"Chat request failed: {response.text}")
            return False
    except Exception as e:
        print_error(f"Chat error: {e}")
        return False

def print_summary(results):
    """Print test summary"""
    print_header("Test Summary")

    total = len(results)
    passed = sum(results.values())
    failed = total - passed

    print(f"Total Tests: {total}")
    print_success(f"Passed: {passed}")
    if failed > 0:
        print_error(f"Failed: {failed}")

    print(f"\n{Colors.BOLD}Individual Results:{Colors.ENDC}")
    for test_name, result in results.items():
        status = "[PASS]" if result else "[FAIL]"
        color = Colors.OKGREEN if result else Colors.FAIL
        print(f"{color}{status}{Colors.ENDC} - {test_name}")

    print(f"\n{Colors.BOLD}Overall: {Colors.ENDC}", end="")
    if failed == 0:
        print(f"{Colors.OKGREEN}ALL TESTS PASSED!{Colors.ENDC}")
    else:
        print(f"{Colors.WARNING}SOME TESTS FAILED{Colors.ENDC}")

def main():
    """Run all tests"""
    print_header("BrainSpark AI Model Integration Tests")
    print_info("Testing Claude, Grok, and Failover functionality\n")

    results = {}

    # Health check
    if not test_health_check():
        print_error("Backend is not running. Please start the backend first.")
        return

    # Setup tests
    if not test_register():
        print_error("Cannot proceed without user registration")
        return

    if not test_create_child():
        print_error("Cannot proceed without child profile")
        return

    # AI model tests
    results["Grok Direct"] = test_grok_model()
    results["Claude (Placeholder)"] = test_claude_model()
    results["Failover Claude->Grok"] = test_failover_claude_to_grok()
    results["Default Model"] = test_default_model()
    results["Conversation Continuity"] = test_conversation_continuity()

    # Summary
    print_summary(results)

if __name__ == "__main__":
    main()
