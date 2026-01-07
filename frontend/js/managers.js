import { Storage } from './utils.js';

// Authentication Manager
export class AuthManager {
    constructor() {
        this.password = Storage.get('managementPassword');
        this.hasAccess = !!this.password;
    }

    async login(password) {
        try {
            const { AuthAPI } = await import('./api.js');
            const response = await AuthAPI.login(password);
            
            if (response.success) {
                this.password = password;
                this.hasAccess = true;
                Storage.set('managementPassword', password);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }

    logout() {
        this.password = null;
        this.hasAccess = false;
        Storage.remove('managementPassword');
    }

    getPassword() {
        return this.password;
    }

    hasManagementAccess() {
        return this.hasAccess;
    }
}

// Theme Manager
export class ThemeManager {
    constructor() {
        this.theme = Storage.get('theme', 'light');
        this.applyTheme();
    }

    toggle() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        Storage.set('theme', this.theme);
    }

    applyTheme() {
        if (this.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    getTheme() {
        return this.theme;
    }
}

// View Manager
export class ViewManager {
    constructor() {
        this.currentView = 'users';
    }

    switchView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        const view = document.getElementById(`${viewName}-view`);
        if (view) {
            view.classList.add('active');
            this.currentView = viewName;
        }

        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    getCurrentView() {
        return this.currentView;
    }
}
