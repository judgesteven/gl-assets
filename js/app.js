/**
 * GameLayer Demo App - Main Application Controller
 * 
 * This is the core application class that manages:
 * - Component initialization and lifecycle
 * - Navigation between different sections
 * - State management and coordination
 * - Event handling and communication
 * 
 * @version 1.0.0
 * @author GameLayer Assets
 * @license MIT
 */

class GameLayerApp {
    constructor() {
        this.currentSection = 'profile';
        this.sections = ['profile', 'missions', 'leaderboard', 'rewards'];
        this.api = null;
        this.components = {};
        this.isInitialized = false;
        this.isUserInitiatedRefresh = false; // Track if refresh is user-initiated
        
        this.init();
    }

    async init() {
        try {
            // Initialize API client
            this.api = new GameLayerAPI();
            
            // Initialize components
            await this.initializeComponents();
            
            // Setup navigation
            this.setupNavigation();
            
            // Load initial section
            await this.loadSection(this.currentSection);
            
            this.isInitialized = true;
            
            // Emit ready event
            this.emit('app:ready', { app: this });
            
        } catch (error) {
            console.error('[GameLayer App] Initialization failed:', error);
            this.showError('Failed to initialize application');
        }
    }

    async initializeComponents() {
        // Initialize Profile component
        this.components.profile = new ProfileComponent(this.api);
        
        // Initialize Missions component
        this.components.missions = new MissionComponent(this.api);
        
        // Initialize Leaderboard component
        this.components.leaderboard = new LeaderboardComponent(this.api);
        
        // Initialize Rewards component
        this.components.rewards = new RewardsComponent(this.api);
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('[data-section]');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.loadSection(e.state.section, false);
            }
        });
    }

    async navigateToSection(section) {
        if (!this.sections.includes(section)) {
            console.warn(`[GameLayer App] Invalid section: ${section}`);
            return;
        }

        // Update navigation state
        this.updateNavigationState(section);
        
        // Load section content
        await this.loadSection(section);
        
        // Update browser history
        this.updateBrowserHistory(section);
    }

    updateNavigationState(section) {
        // Remove active class from all nav items
        document.querySelectorAll('[data-section]').forEach(item => {
            item.classList.remove('nav-item--active');
        });
        
        // Add active class to current section
        const activeNavItem = document.querySelector(`[data-section="${section}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('nav-item--active');
        }
        
        // Update current section
        this.currentSection = section;
    }

    async loadSection(section, updateHistory = true) {
        if (!this.sections.includes(section)) {
            console.warn(`[GameLayer App] Invalid section: ${section}`);
            return;
        }

        // Update navigation state
        this.updateNavigationState(section);
        
        // Load section content
        const component = this.components[section];
        if (component && typeof component.load === 'function') {
            await component.load();
        }
        
        // Update current section
        this.currentSection = section;
        
        // Update browser history if requested
        if (updateHistory) {
            const url = new URL(window.location);
            url.searchParams.set('section', section);
            window.history.pushState({ section }, '', url);
        }
    }

    showSection(section) {
        // Hide all sections
        this.sections.forEach(s => {
            const sectionElement = document.getElementById(`section-${s}`);
            if (sectionElement) {
                sectionElement.style.display = 'none';
            }
        });
        
        // Show current section
        const currentSectionElement = document.getElementById(`section-${section}`);
        if (currentSectionElement) {
            currentSectionElement.style.display = 'block';
            Utils.fadeIn(currentSectionElement);
        }
    }

    showSectionLoading(section) {
        const sectionElement = document.getElementById(`section-${section}`);
        if (sectionElement) {
            Utils.showLoading(sectionElement, 'Loading...');
        }
    }

    hideSectionLoading(section) {
        const sectionElement = document.getElementById(`section-${section}`);
        if (sectionElement) {
            Utils.hideLoading(sectionElement);
        }
    }

    showSectionError(section, message) {
        const sectionElement = document.getElementById(`section-${section}`);
        if (sectionElement) {
            Utils.showError(sectionElement, message);
        }
    }

    updateBrowserHistory(section) {
        const url = new URL(window.location);
        url.searchParams.set('section', section);
        
        window.history.pushState(
            { section },
            '',
            url.toString()
        );
    }

    // === UTILITY METHODS ===
    
    getCurrentSection() {
        return this.currentSection;
    }

    getComponent(section) {
        return this.components[section];
    }

    getAPI() {
        return this.api;
    }

    // Enable refresh for user-initiated actions
    enableRefresh() {
        this.isUserInitiatedRefresh = true;
    }

    // Disable refresh after user action
    disableRefresh() {
        this.isUserInitiatedRefresh = false;
    }

    refreshCurrentSection() {
        this.isUserInitiatedRefresh = true;
        const result = this.loadSection(this.currentSection);
        this.isUserInitiatedRefresh = false;
        return result;
    }

    refreshAllSections() {
        this.isUserInitiatedRefresh = true;
        const result = Promise.all(
            this.sections.map(section => this.components[section].load())
        );
        this.isUserInitiatedRefresh = false;
        return result;
    }

    // === EVENT SYSTEM ===
    
    emit(eventName, data = {}) {
        const event = new CustomEvent(eventName, {
            detail: { app: this, ...data }
        });
        document.dispatchEvent(event);
    }

    on(eventName, callback) {
        document.addEventListener(eventName, callback);
    }

    off(eventName, callback) {
        document.removeEventListener(eventName, callback);
    }

    // === ERROR HANDLING ===
    
    showError(message) {
        const errorContainer = document.getElementById('app-error');
        if (errorContainer) {
            Utils.showError(errorContainer, message);
        } else {
            console.error('[GameLayer App] Error:', message);
        }
    }

    hideError() {
        const errorContainer = document.getElementById('app-error');
        if (errorContainer) {
            errorContainer.innerHTML = '';
        }
    }

    // === CONFIGURATION ===
    
    updateConfig(newConfig) {
        if (this.api) {
            this.api.updateConfig(newConfig);
        }
    }

    getConfig() {
        return this.api ? this.api.getConfig() : null;
    }

    // Get the current player ID from the API configuration
    getCurrentPlayerId() {
        return this.api ? this.api.config.defaultPlayer : null;
    }

    // === DESTRUCTION ===
    
    destroy() {
        // Clean up components
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        // Clean up event listeners
        this.sections.forEach(section => {
            const navItem = document.querySelector(`[data-section="${section}"]`);
            if (navItem) {
                navItem.replaceWith(navItem.cloneNode(true));
            }
        });
        
        // Reset state
        this.components = {};
        this.isInitialized = false;
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.gameLayerApp = new GameLayerApp();
    });
} else {
    window.gameLayerApp = new GameLayerApp();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameLayerApp;
}






