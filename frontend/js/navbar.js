// Navbar Component
class Navbar {
    constructor() {
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('login.html')) return 'login';
        if (path.includes('upload.html')) return 'upload';
        return 'home';
    }

    createNavbar() {
        const currentPage = this.getCurrentPage();
        const userInfo = window.userService ? window.userService.getCurrentUser() : null;
        const isLoggedIn = window.userService ? window.userService.isAuthenticated() : false;
        
        return `
            <nav class="sidebar">
                <div class="logo">
                    <span>⚡</span>
                    <h2>Rock 'em All</h2>
                </div>
                
                ${userInfo ? `
                    <div class="user-info" style="margin-bottom: 1rem; padding: 0.5rem; background: #f8f9fa; border-radius: 6px; font-size: 0.9rem; color: #666;">
                        Welcome, ${userInfo.username}!
                    </div>
                ` : ''}
                
                <ul class="nav-links">
                    <li class="${currentPage === 'home' ? 'active' : ''}">
                        <a href="index.html">Home</a>
                    </li>
                    ${!isLoggedIn ? `
                        <li class="${currentPage === 'login' ? 'active' : ''}">
                            <a href="login.html">Login</a>
                        </li>
                    ` : ''}
                    <li>
                        <a href="#" onclick="loadMySongs()">My Songs</a>
                    </li>
                    <li>
                        <a href="#" onclick="loadFavorites()">Favorite Songs</a>
                    </li>
                    <li class="${currentPage === 'upload' ? 'active' : ''}">
                        <a href="upload.html">Upload New Song</a>
                    </li>
                    ${isLoggedIn ? `
                        <li>
                            <a href="#" onclick="logout()" style="color: #e74c3c;">Logout</a>
                        </li>
                    ` : ''}
                </ul>
            </nav>
        `;
    }

    init() {
        console.log('Initializing navbar...');
        // Insert navbar before the main-content element
        const mainContent = document.querySelector('.main-content');
        console.log('Main content element:', mainContent);
        if (mainContent) {
            const navbarHTML = this.createNavbar();
            console.log('Navbar HTML created, inserting...');
            mainContent.insertAdjacentHTML('beforebegin', navbarHTML);
            console.log('Navbar inserted successfully');
            
            // Dispatch custom event to signal navbar is ready
            document.dispatchEvent(new CustomEvent('navbarReady'));
        } else {
            console.error('Main content element not found!');
        }
    }
}

// Global functions for navbar actions
function logout() {
    if (window.userService) {
        window.userService.logout();
    }
    // Refresh the page to update navbar
    window.location.href = 'index.html';
}

function refreshNavbar() {
    // Remove existing navbar
    const existingNavbar = document.querySelector('.sidebar');
    if (existingNavbar) {
        existingNavbar.remove();
    }
    
    // Create new navbar
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const navbar = new Navbar();
    }
}

function loadMySongs() {
    const userId = localStorage.getItem('user_id');
    if (userId) {
        // Redirect to index.html with a parameter to load user songs
        window.location.href = `index.html?view=my-songs&user_id=${userId}`;
    } else {
        alert('Please log in to view your songs.');
        window.location.href = 'login.html';
    }
}

function loadFavorites() {
    const userId = localStorage.getItem('user_id');
    if (userId) {
        // Redirect to index.html with a parameter to load user favorites
        window.location.href = `index.html?view=favorites&user_id=${userId}`;
    } else {
        alert('Please log in to view your favorite songs.');
        window.location.href = 'login.html';
    }
}

// Initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new Navbar();
}); 