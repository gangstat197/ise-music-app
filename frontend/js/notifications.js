// Notification System
class NotificationManager {
    constructor() {
        this.container = document.getElementById('notification-container');
        this.notifications = new Map();
        this.defaultDuration = 5000;
    }

    /**
     * Show a notification
     * @param {string} message - The notification message
     * @param {string} type - The notification type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds (0 = permanent)
     */
    show(message, type = 'info', duration = this.defaultDuration) {
        const id = this.generateId();
        const notification = this.createNotification(id, message, type);
        
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });

        // Auto remove if duration is set
        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }

        return id;
    }

    /**
     * Create notification element
     */
    createNotification(id, message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.setAttribute('data-id', id);
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getIcon(type)}</div>
                <div class="notification-message">${message}</div>
                <button class="notification-close" aria-label="Close notification">&times;</button>
            </div>
        `;

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.remove(id));

        // Add click to close
        notification.addEventListener('click', (e) => {
            if (e.target === notification || e.target.classList.contains('notification-content')) {
                this.remove(id);
            }
        });

        return notification;
    }

    /**
     * Get icon for notification type
     */
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Remove notification
     */
    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        // Animate out
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        }, 300);
    }

    /**
     * Clear all notifications
     */
    clear() {
        this.notifications.forEach((notification, id) => {
            this.remove(id);
        });
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Show success notification
     */
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    /**
     * Show error notification
     */
    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    /**
     * Show warning notification
     */
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    /**
     * Show info notification
     */
    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Create global instance
window.notificationManager = new NotificationManager();

// Convenience functions
window.showNotification = (message, type, duration) => window.notificationManager.show(message, type, duration);
window.showSuccess = (message, duration) => window.notificationManager.success(message, duration);
window.showError = (message, duration) => window.notificationManager.error(message, duration);
window.showWarning = (message, duration) => window.notificationManager.warning(message, duration);
window.showInfo = (message, duration) => window.notificationManager.info(message, duration);

// Add CSS for notifications
const notificationStyles = `
.notification {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    margin-bottom: var(--spacing-sm);
    max-width: 400px;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    cursor: pointer;
}

.notification::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--primary-color);
}

.notification.success::before {
    background: var(--success-color);
}

.notification.error::before {
    background: var(--error-color);
}

.notification.warning::before {
    background: var(--warning-color);
}

.notification-content {
    display: flex;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    gap: var(--spacing-md);
}

.notification-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
}

.notification-message {
    flex: 1;
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    line-height: 1.4;
}

.notification-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: var(--text-muted);
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--radius-full);
    transition: all var(--transition-fast);
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.notification-close:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

@media (max-width: 600px) {
    .notification {
        max-width: calc(100vw - 2rem);
        margin: 0 var(--spacing-sm) var(--spacing-sm) 0;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

console.log('Notification system loaded');
