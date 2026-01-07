import { UsersAPI, SeasonsAPI } from './api.js';
import { Time, DOM } from './utils.js';

export class DataView {
    constructor() {
        this.seasonSelect = document.getElementById('season-select');
        this.tableBody = document.getElementById('data-table-body');
        this.currentSeason = 'current';
    }

    async initialize() {
        await this.loadSeasons();
        this.setupEventListeners();
        await this.render();
    }

    async loadSeasons() {
        try {
            const response = await SeasonsAPI.getAll();
            const seasons = response.data || [];

            // Clear existing options except current
            this.seasonSelect.innerHTML = '<option value="current">Current Season</option>';

            // Add historical seasons
            seasons.forEach(date => {
                const option = DOM.createElement('option', '', {
                    value: date,
                    textContent: `Season: ${date}`
                });
                this.seasonSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading seasons:', error);
        }
    }

    setupEventListeners() {
        this.seasonSelect.addEventListener('change', (e) => {
            this.currentSeason = e.target.value;
            this.render();
        });
    }

    async render() {
        try {
            let users;
            
            if (this.currentSeason === 'current') {
                const response = await UsersAPI.getAll();
                users = response.data || [];
            } else {
                const response = await SeasonsAPI.getBySeason(this.currentSeason);
                users = response.data || [];
            }

            this.renderTable(users);
        } catch (error) {
            console.error('Error loading data:', error);
            this.tableBody.innerHTML = '<tr><td colspan="3">Error loading data</td></tr>';
        }
    }

    renderTable(users) {
        if (users.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No data available</td></tr>';
            return;
        }

        // Sort by hours (descending)
        users.sort((a, b) => parseFloat(b.hours) - parseFloat(a.hours));

        this.tableBody.innerHTML = users.map(user => {
            const isActive = this.currentSeason === 'current' && user.loggedIn == 1;
            const statusBadge = isActive 
                ? '<span class="status-badge active">Active</span>'
                : '<span class="status-badge inactive">Inactive</span>';

            return `
                <tr>
                    <td>${user.name}</td>
                    <td>${Time.formatHours(user.hours)}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join('');
    }
}
