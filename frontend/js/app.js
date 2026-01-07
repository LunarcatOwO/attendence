import { AuthManager, ThemeManager, ViewManager } from './managers.js';
import { UsersView } from './views/users.js';
import { DataView } from './views/data.js';
import { UsersAPI, AttendanceAPI } from './api.js';
import { Modal, DOM } from './utils.js';

// Initialize managers
const authManager = new AuthManager();
const themeManager = new ThemeManager();
const viewManager = new ViewManager();

// Initialize views
const usersView = new UsersView(authManager);
const dataView = new DataView();

// DOM Elements
const elements = {
    manageBtn: document.getElementById('manage-btn'),
    logoutAllBtn: document.getElementById('logout-all-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    addUserFab: document.getElementById('add-user-fab'),
    
    // Login modal
    loginForm: document.getElementById('login-form'),
    passwordInput: document.getElementById('password-input'),
    loginError: document.getElementById('login-error'),
    closeLoginModal: document.getElementById('close-login-modal'),
    
    // User modal
    closeUserModal: document.getElementById('close-user-modal'),
    
    // Add user modal
    addUserForm: document.getElementById('add-user-form'),
    userNameInput: document.getElementById('user-name-input'),
    rfidInput: document.getElementById('rfid-input'),
    addUserError: document.getElementById('add-user-error'),
    closeAddUserModal: document.getElementById('close-add-user-modal')
};

// Initialize application
async function init() {
    setupEventListeners();
    updateUIForAuth();
    
    // Initialize views
    await usersView.render();
    usersView.startAutoUpdate();
    
    await dataView.initialize();
    
    console.log('✓ Application initialized');
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            viewManager.switchView(view);
            
            // Refresh view when switching
            if (view === 'users') {
                usersView.render();
            } else if (view === 'data') {
                dataView.render();
            }
        });
    });

    // Theme toggle
    elements.themeToggle.addEventListener('click', () => {
        themeManager.toggle();
    });

    // Management button
    elements.manageBtn.addEventListener('click', () => {
        Modal.show('login-modal');
        elements.passwordInput.focus();
    });

    // Logout all button
    elements.logoutAllBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to sign out all users?')) {
            await signOutAllUsers();
        }
    });

    // Add user FAB
    elements.addUserFab.addEventListener('click', () => {
        Modal.show('add-user-modal');
        elements.userNameInput.focus();
    });

    // Login form
    elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });

    // Add user form
    elements.addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleAddUser();
    });

    // Close modal buttons
    elements.closeLoginModal.addEventListener('click', () => {
        Modal.hide('login-modal');
        elements.loginError.style.display = 'none';
        elements.passwordInput.value = '';
    });

    elements.closeUserModal.addEventListener('click', () => {
        Modal.hide('user-modal');
    });

    elements.closeAddUserModal.addEventListener('click', () => {
        Modal.hide('add-user-modal');
        elements.addUserError.style.display = 'none';
        elements.userNameInput.value = '';
        elements.rfidInput.value = '';
    });

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Modal.hideAll();
        }
    });
}

// Authentication handlers
async function handleLogin() {
    const password = elements.passwordInput.value;
    
    try {
        const success = await authManager.login(password);
        
        if (success) {
            Modal.hide('login-modal');
            elements.passwordInput.value = '';
            elements.loginError.style.display = 'none';
            updateUIForAuth();
            await usersView.render();
        } else {
            showLoginError('Invalid password');
        }
    } catch (error) {
        showLoginError('Login failed. Please try again.');
    }
}

function showLoginError(message) {
    elements.loginError.textContent = message;
    elements.loginError.style.display = 'block';
}

// User management handlers
async function handleAddUser() {
    const name = elements.userNameInput.value.trim();
    const rfidKey = elements.rfidInput.value.trim();
    
    if (!name || !rfidKey) {
        showAddUserError('Please fill in all fields');
        return;
    }

    try {
        const password = authManager.getPassword();
        await UsersAPI.create(name, rfidKey, password);
        
        Modal.hide('add-user-modal');
        elements.userNameInput.value = '';
        elements.rfidInput.value = '';
        elements.addUserError.style.display = 'none';
        
        await usersView.render();
        alert('User added successfully!');
    } catch (error) {
        showAddUserError(error.message || 'Failed to add user');
    }
}

function showAddUserError(message) {
    elements.addUserError.textContent = message;
    elements.addUserError.style.display = 'block';
}

async function signOutAllUsers() {
    try {
        const password = authManager.getPassword();
        await AttendanceAPI.signOutAll(password);
        await usersView.render();
        alert('All users have been signed out');
    } catch (error) {
        console.error('Error signing out all users:', error);
        alert('Failed to sign out all users');
    }
}

// UI updates
function updateUIForAuth() {
    const hasAccess = authManager.hasManagementAccess();
    
    if (hasAccess) {
        DOM.hide(elements.manageBtn);
        DOM.show(elements.logoutAllBtn);
        DOM.show(elements.addUserFab);
    } else {
        DOM.show(elements.manageBtn);
        DOM.hide(elements.logoutAllBtn);
        DOM.hide(elements.addUserFab);
    }
}

// Start application
document.addEventListener('DOMContentLoaded', init);

// Handle visibility change (refresh when tab becomes visible)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && viewManager.getCurrentView() === 'users') {
        usersView.render();
    }
});
