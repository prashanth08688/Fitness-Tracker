# tests/test_auth.py
import time
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    # headless for CI
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    yield driver
    driver.quit()

def wait_for_alert(driver, timeout=5):
    try:
        WebDriverWait(driver, timeout).until(EC.alert_is_present())
        return driver.switch_to.alert
    except TimeoutException:
        return None

def test_signup_validation_and_success(driver):
    driver.get("http://localhost:3000/signup.html")

    # click submit without filling -> should show client-side validation
    driver.find_element(By.CSS_SELECTOR, "input[type='submit']").click()
    username_err = driver.find_element(By.ID, "usernameError").text
    assert username_err != "" and ("username" in username_err.lower() or "between" in username_err.lower())

    # Fill valid details (use a unique username/email each run if backend expects unique)
    driver.find_element(By.ID, "username").clear()
    driver.find_element(By.ID, "username").send_keys(f"ci_test_{int(time.time())}")
    driver.find_element(By.ID, "email").clear()
    driver.find_element(By.ID, "email").send_keys(f"ci_test_{int(time.time())}@example.com")
    driver.find_element(By.ID, "password").send_keys("password123")
    driver.find_element(By.ID, "confirmPassword").send_keys("password123")
    driver.find_element(By.CSS_SELECTOR, "input[type='submit']").click()

    alert = wait_for_alert(driver, timeout=5)
    if alert:
        text = alert.text.lower()
        assert "signup" in text or "success" in text or "welcome" in text or "redirect" in text
        alert.accept()
    else:
        # fallback: check for redirect to index.html
        WebDriverWait(driver, 5).until(lambda d: "index.html" in d.current_url or "/" == d.current_url)
        assert "index.html" in driver.current_url or driver.current_url.endswith("/")

def test_login_validation_and_success(driver):
    driver.get("http://localhost:3000/login.html")

    # submit empty -> validation
    driver.find_element(By.CSS_SELECTOR, "input[type='submit']").click()
    username_err = driver.find_element(By.ID, "usernameOrEmailError").text
    assert username_err != "" and ("enter" in username_err.lower() or "please" in username_err.lower())

    # Fill credentials (must exist in backend); for CI, create test user beforehand or expect an alert
    driver.find_element(By.ID, "usernameOrEmail").send_keys("test@example.com")
    driver.find_element(By.ID, "password").send_keys("password123")
    driver.find_element(By.CSS_SELECTOR, "input[type='submit']").click()

    alert = wait_for_alert(driver, timeout=5)
    if alert:
        text = alert.text.lower()
        assert "login" in text or "success" in text or "redirect" in text
        alert.accept()
    else:
        # fallback: check redirect
        WebDriverWait(driver, 5).until(lambda d: "index.html" in d.current_url or "/" == d.current_url)
        assert "index.html" in driver.current_url or driver.current_url.endswith("/")
