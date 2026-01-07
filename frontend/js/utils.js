// Storage utility for managing local storage
export const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Time utilities
export const Time = {
    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    },

    formatHours(hours) {
        return parseFloat(hours).toFixed(2);
    },

    getTimeSince(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        return now - date;
    }
};

// DOM utilities
export const DOM = {
    createElement(tag, className, attributes = {}) {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'textContent' || key === 'innerHTML') {
                element[key] = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        return element;
    },

    show(element) {
        if (element) {
            element.style.display = 'block';
        }
    },

    hide(element) {
        if (element) {
            element.style.display = 'none';
        }
    },

    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    },

    addClass(element, className) {
        if (element) {
            element.classList.add(className);
        }
    },

    removeClass(element, className) {
        if (element) {
            element.classList.remove(className);
        }
    }
};

// Modal utilities
export const Modal = {
    show(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    },

    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    },

    hideAll() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }
};

// Notification utility
export const Notify = {
    show(message, type = 'info') {
        // Create notification element
        const notification = DOM.createElement('div', `notification notification-${type}`, {
            textContent: message
        });

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    error(message) {
        this.show(message, 'error');
    },

    success(message) {
        this.show(message, 'success');
    },

    info(message) {
        this.show(message, 'info');
    }
};

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Escape HTML to prevent XSS
export function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
