import { UsersAPI, AttendanceAPI } from './api.js';
import { Time, DOM, Modal } from './utils.js';

export class UsersView {
    constructor(authManager) {
        this.authManager = authManager;
        this.userGrid = document.getElementById('user-grid');
        this.noUsersMessage = document.getElementById('no-users');
        this.activeUsers = [];
        this.updateInterval = null;
    }

    async render() {
        try {
            const response = await UsersAPI.getLoggedIn();
            this.activeUsers = response.data || [];

            if (this.activeUsers.length === 0) {
                this.showEmptyState();
                return;
            }

            this.hideEmptyState();
            this.renderUserCards();
        } catch (error) {
            console.error('Error loading users:', error);
            this.showEmptyState();
        }
    }

    renderUserCards() {
        this.userGrid.innerHTML = '';

        this.activeUsers.forEach(user => {
            const card = this.createUserCard(user);
            this.userGrid.appendChild(card);
        });
    }

    createUserCard(user) {
        const card = DOM.createElement('div', 'user-card');
        card.dataset.userId = user.userId;

        // Header
        const header = DOM.createElement('div', 'user-card-header');
        const name = DOM.createElement('div', 'user-name', { textContent: user.name });
        header.appendChild(name);

        if (this.authManager.hasManagementAccess()) {
            const userId = DOM.createElement('div', 'user-id', { textContent: `ID: ${user.userId}` });
            header.appendChild(userId);
        }

        // Time display
        const timeSince = Time.getTimeSince(user.lastLogin);
        const timeDisplay = DOM.createElement('div', 'user-time', {
            textContent: Time.formatDuration(timeSince)
        });

        // Login date
        const loginDate = DOM.createElement('div', 'user-login-date', {
            textContent: `Since ${Time.formatDate(user.lastLogin)}`
        });

        card.appendChild(header);
        card.appendChild(timeDisplay);
        card.appendChild(loginDate);

        // Click handler for management users
        if (this.authManager.hasManagementAccess()) {
            card.addEventListener('click', () => this.showUserDetails(user));
        }

        return card;
    }

    showUserDetails(user) {
        const modal = document.getElementById('user-modal');
        const table = document.getElementById('user-details-table');
        const logoutBtn = document.getElementById('logout-user-btn');

        // Populate table
        table.innerHTML = `
            <tr>
                <td>User ID</td>
                <td>${user.userId}</td>
            </tr>
            <tr>
                <td>Name</td>
                <td>${user.name}</td>
            </tr>
            <tr>
                <td>Total Hours</td>
                <td>${Time.formatHours(user.hours)}</td>
            </tr>
            <tr>
                <td>RFID Key</td>
                <td>${user.rfidKey}</td>
            </tr>
            <tr>
                <td>Status</td>
                <td><span class="status-badge active">Active</span></td>
            </tr>
            <tr>
                <td>Last Login</td>
                <td>${Time.formatDate(user.lastLogin)}</td>
            </tr>
        `;

        // Set logout button handler
        logoutBtn.onclick = () => this.signOutUser(user.userId);

        Modal.show('user-modal');
    }

    async signOutUser(userId) {
        try {
            const password = this.authManager.getPassword();
            await AttendanceAPI.signOut(userId, password);
            Modal.hide('user-modal');
            await this.render();
        } catch (error) {
            console.error('Error signing out user:', error);
            alert('Failed to sign out user');
        }
    }

    showEmptyState() {
        DOM.hide(this.userGrid);
        DOM.show(this.noUsersMessage);
    }

    hideEmptyState() {
        DOM.show(this.userGrid);
        DOM.hide(this.noUsersMessage);
    }

    startAutoUpdate() {
        // Update time displays every second
        this.updateInterval = setInterval(() => {
            this.updateTimers();
        }, 1000);

        // Refresh user list every 15 seconds
        setInterval(() => {
            this.render();
        }, 15000);
    }

    updateTimers() {
        document.querySelectorAll('.user-card').forEach(card => {
            const userId = parseInt(card.dataset.userId);
            const user = this.activeUsers.find(u => u.userId === userId);
            
            if (user) {
                const timeDisplay = card.querySelector('.user-time');
                if (timeDisplay) {
                    const timeSince = Time.getTimeSince(user.lastLogin);
                    timeDisplay.textContent = Time.formatDuration(timeSince);
                }
            }
        });
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}
