// DOM elements
let loginForm = null;

function init() {
    console.log('Login page initialization...');
    
    // Check if user is already logged in
    if (window.userService && window.userService.isAuthenticated()) {
        console.log('User already logged in, redirecting to home...');
        window.location.href = 'index.html';
        return;
    }
    
    loginForm = document.querySelector('.login-form');
    console.log('Login form found:', !!loginForm);
    setupEventListeners();
}

function setupEventListeners() {
    if (loginForm) {
        console.log('Setting up login form event listener...');
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form event listener set up');
    } else {
        console.error('Login form not found!');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    console.log('Login attempt started...');
    
    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    
    const email = emailInput.value;
    const password = passwordInput.value;

    console.log('Email:', email);
    console.log('Password length:', password.length);

    if (!email || !password) {
        displayError('Please fill in all fields');
        return;
    }

    console.log('API_BASE_URL available:', !!window.API_BASE_URL);
    console.log('API_BASE_URL:', window.API_BASE_URL);

    try {
        const requestBody = {
            email,
            password,
        };
        console.log('Request body:', requestBody);
        
        const response = await fetch(`${window.API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        await handleLoginResponse(response);
    } catch (error) {
        console.error('Login error:', error);
        displayError('An error occurred. Please try again.');
    }
}

function displayError(message) {
    clearError();
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#e74c3c';
    errorElement.style.marginTop = '10px';
    errorElement.style.textAlign = 'center';
    loginForm.appendChild(errorElement);
}

function clearError() {
    const errorElement = document.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

async function handleLoginResponse(response) {
    console.log('Handling login response...');
    console.log('Response status:', response.status);
    
    if (response.ok) {
        const data = await response.json();
        console.log('Login successful, data:', data);
        
        // Store user data in localStorage for universal access
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('username', data.username);
        localStorage.setItem('email', data.email);
        localStorage.setItem('isLoggedIn', 'true');
        
        console.log('User data stored in localStorage');
        console.log('Redirecting to index.html...');
        
        // Redirect to main page
        window.location.href = 'index.html';
    } else {
        console.log('Login failed, status:', response.status);
        const errorData = await response.json();
        console.log('Error data:', errorData);
        displayError(errorData.detail || 'Login failed. Please try again.');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
