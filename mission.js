/**
 * GameLayer Mission Card Component
 * 
 * A complete, self-contained mission card component for gamification platforms.
 * This file contains everything needed to implement mission cards in any project.
 * 
 * Features:
 * - Responsive mission card design
 * - GameLayer API integration
 * - Event-driven architecture
 * - Mobile-first responsive design
 * - Accessibility support
 * 
 * Usage:
 * 1. Include this file in your project
 * 2. Update the API configuration below with your credentials
 * 3. Initialize with: new MissionCardManager()
 * 
 * @version 1.0.0
 * @author GameLayer Assets
 * @license MIT
 */

// Configuration - Update these values for your project
const GAMELAYER_CONFIG = {
    baseURL: 'https://api.gamelayer.co/api/v0', // Update with your GameLayer API endpoint
    apiKey: 'your-api-key-here', // Replace with your API key
    defaultPlayer: 'your-player-id', // Replace with your player ID
    accountId: 'your-account-id', // Replace with your account ID
    debugMode: false // Set to true for development debugging
};

// Utility Functions
const Utils = {
    log: (message, data = null) => {
        if (GAMELAYER_CONFIG.debugMode) {
            if (data) {
                console.log(`[GameLayer Mission] ${message}`, data);
            } else {
                console.log(`[GameLayer Mission] ${message}`);
            }
        }
    },
    
    error: (message, error = null) => {
        if (GAMELAYER_CONFIG.debugMode) {
            if (error) {
                console.error(`[GameLayer Mission] ERROR: ${message}`, error);
            } else {
                console.error(`[GameLayer Mission] ERROR: ${message}`);
            }
        }
    },
    
    // Format time remaining in human-readable format
    formatTimeRemaining: (expiryDate) => {
        if (!expiryDate) return 'No time limit';
        
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - now;
        
        if (diffTime <= 0) return 'Expired';
        
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffDays > 0) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} remaining`;
        } else {
            return 'Less than 1 minute remaining';
        }
    },
    
    // Get mission icon based on category
    getMissionIcon: (category) => {
        const icons = {
            'daily': '🚀',
            'weekly': '📅',
            'monthly': '🗓️',
            'elite': '🔥',
            'special': '⭐',
            'default': '🎯'
        };
        return icons[category?.toLowerCase()] || icons.default;
    }
};

// GameLayer API Client
class GameLayerAPI {
    constructor() {
        this.config = GAMELAYER_CONFIG;
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'api-key': this.config.apiKey
        };
        
        Utils.log('GameLayer API initialized');
    }

    async getPlayerMission(playerId, missionId) {
        Utils.log(`Fetching mission: ${missionId} for player: ${playerId}`);
        
        try {
            const url = `${this.config.baseURL}/missions/${missionId}?account=${this.config.accountId}`;
            Utils.log(`API Request URL: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });

            Utils.log(`API Response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                Utils.error(`API Error Response: ${errorText}`);
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            Utils.log('Mission data received successfully');
            return data;
            
        } catch (error) {
            Utils.error('Failed to fetch mission data', error);
            return null;
        }
    }

    async getPlayerMissions(playerId) {
        try {
            const url = `${this.config.baseURL}/missions?account=${this.config.accountId}`;
            Utils.log(`Fetching missions list: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            Utils.error('Failed to fetch missions list', error);
            return null;
        }
    }
}

// Individual Mission Card Class
class MissionCard {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            missionId: options.missionId || null,
            playerId: options.playerId || GAMELAYER_CONFIG.defaultPlayer,
            autoLoad: options.autoLoad !== false,
            ...options
        };
        
        this.api = new GameLayerAPI();
        this.data = null;
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        if (this.options.autoLoad && this.options.missionId) {
            await this.loadMissionData();
        }
        this.bindEvents();
    }

    async loadMissionData() {
        if (this.isLoading) return;
        
        this.setLoading(true);
        Utils.log(`Loading mission data for: ${this.options.missionId}`);
        
        try {
            this.data = await this.api.getPlayerMission(
                this.options.playerId, 
                this.options.missionId
            );
            
            if (this.data) {
                this.render();
                Utils.log('Mission data loaded and rendered successfully');
            } else {
                Utils.error('No mission data received');
            }
        } catch (error) {
            Utils.error('Failed to load mission data', error);
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading = true) {
        this.isLoading = loading;
        this.element.classList.toggle('mission-card--loading', loading);
        
        if (loading) {
            this.element.setAttribute('aria-busy', 'true');
        } else {
            this.element.removeAttribute('aria-busy');
        }
    }

    render() {
        if (!this.data) return;

        // Update mission image with real URL from API
        const imageContainer = this.element.querySelector('.mission-card__image');
        if (imageContainer && this.data.imgUrl) {
            // Create or update the real image
            let missionImage = imageContainer.querySelector('.mission-card__real-image');
            if (!missionImage) {
                missionImage = document.createElement('img');
                missionImage.className = 'mission-card__real-image';
                missionImage.alt = this.data.name || 'Mission';
                imageContainer.appendChild(missionImage);
            }
            
            missionImage.src = this.data.imgUrl;
            missionImage.style.display = 'block';
            
            // Hide the placeholder
            const imagePlaceholder = imageContainer.querySelector('.mission-card__image-placeholder');
            if (imagePlaceholder) {
                imagePlaceholder.style.display = 'none';
            }
        } else {
            // Fallback to placeholder icon if no image URL
            const imagePlaceholder = imageContainer.querySelector('.mission-card__image-placeholder');
            if (imagePlaceholder) {
                imagePlaceholder.textContent = Utils.getMissionIcon(this.data.category);
                imagePlaceholder.style.display = 'block';
            }
            
            // Hide any existing real image
            const missionImage = imageContainer.querySelector('.mission-card__real-image');
            if (missionImage) {
                missionImage.style.display = 'none';
            }
        }

        // Update mission title
        const title = this.element.querySelector('.mission-card__title');
        if (title) {
            title.textContent = this.data.name || 'Mission';
        }

        // Update mission description
        const description = this.element.querySelector('.mission-card__description');
        if (description) {
            description.textContent = this.data.description || 'Mission description';
        }

        // Update category badge
        const category = this.element.querySelector('.mission-card__category-overlay');
        if (category) {
            category.textContent = this.data.category || 'Daily';
        }

        // Update rewards from nested 'reward' section
        const pointsReward = this.element.querySelector('.mission-card__reward:first-child .mission-card__reward-value');
        if (pointsReward && this.data.reward && this.data.reward.points !== undefined) {
            pointsReward.textContent = this.data.reward.points;
        }

        const creditsReward = this.element.querySelector('.mission-card__reward:last-child .mission-card__reward-value');
        if (creditsReward && this.data.reward && this.data.reward.credits !== undefined) {
            creditsReward.textContent = this.data.reward.credits;
        }

        // Update progress from nested 'objectives' field under 'events'
        const progressValue = this.element.querySelector('.mission-card__progress-value');
        if (progressValue && this.data.objectives && this.data.objectives.events) {
            const events = this.data.objectives.events;
            if (Array.isArray(events) && events.length > 0) {
                const event = events[0];
                const currentCount = event.currentcount || 0;
                const totalCount = event.count || 1;
                progressValue.textContent = `${currentCount}/${totalCount}`;
                
                // Update progress bar
                const progressFill = this.element.querySelector('.mission-card__progress-fill');
                if (progressFill) {
                    const percentage = totalCount > 0 ? (currentCount / totalCount) * 100 : 0;
                    progressFill.style.width = `${percentage}%`;
                }
            }
        }

        // Update timer/status from nested 'active' field 'to' time
        const timer = this.element.querySelector('.mission-card__timer');
        if (timer) {
            timer.textContent = this.getTimerText();
        }

        // Update action buttons
        this.updateActionButtons();
        
        // Emit render event
        this.element.dispatchEvent(new CustomEvent('mission:rendered', {
            detail: { missionId: this.options.missionId, data: this.data }
        }));
    }

    getTimerText() {
        if (!this.data) return 'Loading...';
        
        // Check if mission is active and has a 'to' time
        if (this.data.active && this.data.active.to) {
            const endTime = new Date(this.data.active.to);
            const now = new Date();
            const diffTime = endTime - now;
            
            if (diffTime <= 0) {
                return '⏰ Expired';
            }
            
            return `⏰ ${Utils.formatTimeRemaining(this.data.active.to)}`;
        }
        
        return '⏰ No time limit';
    }

    updateActionButtons() {
        const primaryBtn = this.element.querySelector('.mission-card__btn--primary');
        const secondaryBtn = this.element.querySelector('.mission-card__btn--secondary');

        if (!this.data || !primaryBtn) return;

        // Reset button states
        primaryBtn.disabled = false;
        primaryBtn.classList.remove('mission-card__btn--success');

        if (this.data.status === 'completed') {
            primaryBtn.textContent = 'Claim';
            primaryBtn.classList.add('mission-card__btn--success');
        } else if (this.data.status === 'locked') {
            primaryBtn.textContent = 'Locked';
            primaryBtn.disabled = true;
        } else if (this.data.status === 'upcoming') {
            primaryBtn.textContent = 'Coming Soon';
            primaryBtn.disabled = true;
        } else {
            primaryBtn.textContent = this.data.progress?.current > 0 ? 'Continue' : 'Start';
        }
    }

    bindEvents() {
        // Primary button click
        const primaryBtn = this.element.querySelector('.mission-card__btn--primary');
        if (primaryBtn) {
            primaryBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handlePrimaryAction();
            });
        }

        // Secondary button click
        const secondaryBtn = this.element.querySelector('.mission-card__btn--secondary');
        if (secondaryBtn) {
            secondaryBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleSecondaryAction();
            });
        }

        // Card click for details
        this.element.addEventListener('click', (e) => {
            if (!e.target.closest('.mission-card__btn')) {
                this.showDetails();
            }
        });
    }

    handlePrimaryAction() {
        if (!this.data) return;
        
        const btn = this.element.querySelector('.mission-card__btn--primary');
        if (!btn) return;

        Utils.log(`Primary action triggered for mission: ${this.options.missionId}`);
        
        // Emit action event for parent components to handle
        this.element.dispatchEvent(new CustomEvent('mission:primary-action', {
            detail: { 
                missionId: this.options.missionId, 
                action: btn.textContent.toLowerCase(),
                data: this.data 
            }
        }));
    }

    handleSecondaryAction() {
        if (!this.data) return;
        
        const btn = this.element.querySelector('.mission-card__btn--secondary');
        if (!btn) return;

        Utils.log(`Secondary action triggered for mission: ${this.options.missionId}`);
        
        // Emit action event for parent components to handle
        this.element.dispatchEvent(new CustomEvent('mission:secondary-action', {
            detail: { 
                missionId: this.options.missionId, 
                action: btn.textContent.toLowerCase(),
                data: this.data 
            }
        }));
    }

    showDetails() {
        Utils.log(`Showing details for mission: ${this.options.missionId}`);
        
        // Add click effect
        this.element.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
        
        // Emit details event
        this.element.dispatchEvent(new CustomEvent('mission:details', {
            detail: { 
                missionId: this.options.missionId, 
                data: this.data 
            }
        }));
    }

    // Public methods for external control
    refresh() {
        return this.loadMissionData();
    }

    updateData(newData) {
        this.data = { ...this.data, ...newData };
        this.render();
    }

    destroy() {
        // Clean up event listeners
        this.element.removeEventListener('click', this.boundClickHandler);
        // Remove loading state
        this.element.classList.remove('mission-card--loading');
        this.element.removeAttribute('aria-busy');
    }
}

// Mission Manager for handling multiple cards
class MissionCardManager {
    constructor(options = {}) {
        this.options = {
            selector: '.mission-card',
            autoInitialize: options.autoInitialize !== false,
            ...options
        };
        
        this.api = new GameLayerAPI();
        this.missions = new Map();
        
        if (this.options.autoInitialize) {
            this.init();
        }
    }

    async init() {
        Utils.log('Initializing Mission Card Manager');
        await this.initializeMissions();
        this.bindGlobalEvents();
        Utils.log('Mission Card Manager initialized successfully');
    }

    async initializeMissions() {
        const missionElements = document.querySelectorAll(this.options.selector);
        Utils.log(`Found ${missionElements.length} mission card elements`);
        
        missionElements.forEach((element, index) => {
            // Try to get mission ID from data attribute or generate one
            const missionId = element.dataset.missionId || `mission-${index + 1}`;
            
            // Create mission card instance
            const mission = new MissionCard(element, {
                missionId: missionId,
                playerId: GAMELAYER_CONFIG.defaultPlayer,
                autoLoad: index === 0 // Only auto-load the first mission
            });
            
            this.missions.set(missionId, mission);
            
            // Add mission ID to element if not present
            if (!element.dataset.missionId) {
                element.dataset.missionId = missionId;
            }
        });
    }

    bindGlobalEvents() {
        // Listen for mission events
        document.addEventListener('mission:primary-action', (e) => {
            Utils.log('Global primary action event', e.detail);
        });
        
        document.addEventListener('mission:secondary-action', (e) => {
            Utils.log('Global secondary action event', e.detail);
        });
        
        document.addEventListener('mission:details', (e) => {
            Utils.log('Global details event', e.detail);
        });
        
        document.addEventListener('mission:rendered', (e) => {
            Utils.log('Global render event', e.detail);
        });
    }

    // Public methods
    getMission(missionId) {
        return this.missions.get(missionId);
    }

    getAllMissions() {
        return Array.from(this.missions.values());
    }

    async refreshAllMissions() {
        Utils.log('Refreshing all missions');
        const promises = Array.from(this.missions.values()).map(mission => mission.refresh());
        await Promise.all(promises);
    }

    async refreshMission(missionId) {
        const mission = this.missions.get(missionId);
        if (mission) {
            await mission.refresh();
        }
    }

    destroy() {
        this.missions.forEach(mission => mission.destroy());
        this.missions.clear();
    }
}

// Auto-initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Utils.log('DOM loaded, initializing Mission Card Manager');
        window.missionCardManager = new MissionCardManager();
    });
} else {
    Utils.log('DOM already loaded, initializing Mission Card Manager');
    window.missionCardManager = new MissionCardManager();
}

// Export for module systems (if available)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        MissionCard, 
        MissionCardManager, 
        GameLayerAPI, 
        Utils,
        GAMELAYER_CONFIG 
    };
}

// Global access for browser usage
window.GameLayerMissionCard = {
    MissionCard,
    MissionCardManager,
    GameLayerAPI,
    Utils,
    CONFIG: GAMELAYER_CONFIG
};

Utils.log('GameLayer Mission Card Component loaded successfully');

