// API Configuration - works for production, Docker and local development
const API_BASE_URL = (window.location.hostname === 'localhost' && window.location.port === '3000') || 
                    window.location.hostname === 'ise.rockemall.live'
    ? '/api/v1'  // Production or Docker setup - proxy through nginx
    : 'http://localhost:8000/api/v1';  // Local development

// Make API_BASE_URL globally available
window.API_BASE_URL = API_BASE_URL;

class UserService {
    constructor() {
        this.userId = this.getUserId();
        this.username = this.getUsername();
        this.email = this.getEmail();
        this.isLoggedIn = this.getIsLoggedIn();
    }

    // Get user ID from localStorage
    getUserId() {
        return localStorage.getItem('user_id');
    }

    // Get username from localStorage
    getUsername() {
        return localStorage.getItem('username');
    }

    // Get email from localStorage
    getEmail() {
        return localStorage.getItem('email');
    }

    // Check if user is logged in
    getIsLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    // Set user data
    setUserData(userData) {
        localStorage.setItem('user_id', userData.user_id);
        localStorage.setItem('username', userData.username);
        localStorage.setItem('email', userData.email);
        localStorage.setItem('isLoggedIn', 'true');
        
        // Update instance variables
        this.userId = userData.user_id;
        this.username = userData.username;
        this.email = userData.email;
        this.isLoggedIn = true;
    }

    // Clear user data (logout)
    logout() {
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('isLoggedIn');
        
        // Update instance variables
        this.userId = null;
        this.username = null;
        this.email = null;
        this.isLoggedIn = false;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.isLoggedIn && this.userId;
    }

    // Get current user info
    getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }
        
        return {
            id: this.userId,
            username: this.username,
            email: this.email
        };
    }

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Update navbar to show user info
    updateNavbar() {
        const userInfo = document.querySelector('.user-info');
        if (userInfo && this.isAuthenticated()) {
            userInfo.textContent = `Welcome, ${this.username}!`;
        }
    }
}

// Create global user service instance
const userService = new UserService();

// Export for use in other scripts
window.userService = userService; 