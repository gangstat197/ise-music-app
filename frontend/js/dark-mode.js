// Dark Mode Manager
class DarkModeManager {
    constructor() {
        this.toggle = document.getElementById('dark-mode-toggle');
        this.storageKey = 'darkMode';
        this.init();
    }

    init() {
        // Load saved theme or detect system preference
        const savedTheme = localStorage.getItem(this.storageKey);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === null) {
            // No saved preference, use system preference
            this.setTheme(systemPrefersDark ? 'dark' : 'light');
        } else {
            this.setTheme(savedTheme);
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem(this.storageKey) === null) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });

        // Add toggle event listener
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggleTheme());
        }

        // Add keyboard shortcut (Ctrl/Cmd + D)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    setTheme(theme) {
        const isDark = theme === 'dark';
        
        // Update data attribute
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update toggle button state
        if (this.toggle) {
            this.toggle.setAttribute('aria-pressed', isDark);
            this.toggle.title = `Switch to ${isDark ? 'light' : 'dark'} mode`;
        }

        // Save to localStorage
        localStorage.setItem(this.storageKey, theme);

        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(isDark);

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme, isDark } 
        }));

        // Show notification
        if (window.showNotification) {
            window.showNotification(
                `Switched to ${theme} mode`, 
                'info', 
                2000
            );
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    isDarkMode() {
        return this.getCurrentTheme() === 'dark';
    }

    updateMetaThemeColor(isDark) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = isDark ? '#1a1a1a' : '#ffffff';
    }

    // Method to programmatically set theme
    setDarkMode(isDark) {
        this.setTheme(isDark ? 'dark' : 'light');
    }
}

// Create global instance
window.darkModeManager = new DarkModeManager();

// Convenience functions
window.toggleDarkMode = () => window.darkModeManager.toggleTheme();
window.setDarkMode = (isDark) => window.darkModeManager.setDarkMode(isDark);
window.isDarkMode = () => window.darkModeManager.isDarkMode();

// Enhanced CSS for dark mode toggle
const darkModeToggleStyles = `
.dark-mode-toggle {
    position: fixed;
    top: var(--spacing-lg);
    right: var(--spacing-lg);
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-full);
    width: 50px;
    height: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-fixed);
    transition: all var(--transition-fast);
    box-shadow: var(--shadow-md);
    overflow: hidden;
}

.dark-mode-toggle:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-lg);
}

.dark-mode-toggle:active {
    transform: scale(0.95);
}

.dark-mode-toggle .sun-icon,
.dark-mode-toggle .moon-icon {
    position: absolute;
    font-size: 1.2rem;
    transition: all var(--transition-normal);
    transform: rotate(0deg);
}

.dark-mode-toggle .sun-icon {
    opacity: 1;
    transform: rotate(0deg) scale(1);
}

.dark-mode-toggle .moon-icon {
    opacity: 0;
    transform: rotate(180deg) scale(0.8);
}

[data-theme="dark"] .dark-mode-toggle .sun-icon {
    opacity: 0;
    transform: rotate(180deg) scale(0.8);
}

[data-theme="dark"] .dark-mode-toggle .moon-icon {
    opacity: 1;
    transform: rotate(0deg) scale(1);
}

/* Smooth theme transition */
* {
    transition: background-color var(--transition-normal), 
                border-color var(--transition-normal), 
                color var(--transition-normal);
}

/* Dark mode specific enhancements */
[data-theme="dark"] .song-card {
    background: var(--bg-card);
    border-color: var(--border-light);
}

[data-theme="dark"] .song-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .music-player {
    background: rgba(45, 45, 45, 0.95);
    backdrop-filter: blur(20px);
    border-top-color: var(--border-light);
}

[data-theme="dark"] .sidebar {
    background: var(--bg-card);
    border-right-color: var(--border-light);
}

[data-theme="dark"] .modal-content {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
}

[data-theme="dark"] .notification {
    background: var(--bg-card);
    border-color: var(--border-light);
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
    .dark-mode-toggle .sun-icon,
    .dark-mode-toggle .moon-icon {
        transition: none;
    }
    
    * {
        transition: none !important;
    }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    .dark-mode-toggle {
        border-width: 2px;
    }
    
    [data-theme="dark"] .dark-mode-toggle {
        border-color: var(--text-primary);
    }
}
`;

// Inject dark mode toggle styles
const darkModeStyleSheet = document.createElement('style');
darkModeStyleSheet.textContent = darkModeToggleStyles;
document.head.appendChild(darkModeStyleSheet);

console.log('Dark mode manager loaded');
