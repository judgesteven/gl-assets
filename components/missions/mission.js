/**
 * GameLayer Mission Component
 * 
 * A complete mission management component that fetches and displays
 * all missions for a player from the GameLayer API.
 * 
 * Features:
 * - Fetches all missions from API
 * - Dynamic mission rendering
 * - Real-time data integration
 * - Responsive design
 * - Event-driven architecture
 * 
 * @version 1.0.0
 * @author GameLayer Assets
 * @license MIT
 */



// Mission Manager Class - Handles all missions
class MissionManager {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            playerId: options.playerId, // No fallback - only use what's passed
            autoLoad: false, // Never auto-load, always wait for explicit call
            ...options
        };
        this.api = window.gameLayerApp ? window.gameLayerApp.getAPI() : new GameLayerAPI();
        this.missions = [];
        this.isLoading = false;
    }

    // Get the current player ID from the API config
    getCurrentPlayerId() {
        return this.api.config.defaultPlayer;
    }

    async init() {
        if (this.options.autoLoad) {
            await this.loadMissions();
        }
    }

    async loadMissions() {
        if (this.isLoading) return;
        
        this.setLoading(true);
        try {
            // Always get the current API instance to ensure we have the latest player ID
            const currentAPI = window.gameLayerApp ? window.gameLayerApp.getAPI() : this.api;
            const currentPlayerId = this.options.playerId;
            
            // Use the current API instance to make the call
            this.missions = await currentAPI.getPlayerMissions(currentPlayerId);
            
            if (this.missions && this.missions.length > 0) {
                // Filter out hidden missions
                this.missions = this.missions.filter(mission => {
                    const category = mission.category || '';
                    const isHidden = category.toLowerCase() === 'hidden';
                    return !isHidden;
                });
                
                if (this.missions.length > 0) {
                    this.renderMissions();
                } else {
                    this.renderNoMissions();
                }
            } else {
                this.renderNoMissions();
            }
        } catch (error) {
            this.renderError('Failed to load missions');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading = true) {
        this.isLoading = loading;
        this.container.classList.toggle('missions--loading', loading);
    }

    renderMissions() {
        if (!this.container || !this.missions) return;
        
        this.container.innerHTML = `
            <div class="mission-examples" id="missionExamples">
                ${this.missions.map(mission => this.renderMissionCard(mission)).join('')}
            </div>
        `;
        
        // Bind events to the new mission cards
        this.bindMissionEvents();
    }

    renderMissionCard(mission) {
        const progressPercentage = this.calculateProgress(mission);
        const timerText = this.getTimerText(mission);
        const buttonText = this.getButtonText(mission);
        const buttonState = this.getButtonState(mission);
        
        return `
            <div class="mission-card" data-mission-id="${mission.id}">
                <div class="mission-card__image" style="background: linear-gradient(135deg, #007AFF, #5AC8FA);">
                    ${mission.imgUrl ? 
                        `<img src="${mission.imgUrl}" alt="${mission.name}" class="mission-card__real-image">` : 
                        `<div class="mission-card__image-placeholder">${this.getMissionIcon(mission.category)}</div>`
                    }
                    <div class="mission-card__rewards-overlay">
                        <div class="mission-card__reward">
                            <span class="mission-card__reward-label">⭐</span>
                            <span class="mission-card__reward-value">${mission.reward?.points || 0}</span>
                        </div>
                        <div class="mission-card__reward">
                            <span class="mission-card__reward-label">💎</span>
                            <span class="mission-card__reward-value">${mission.reward?.credits || 0}</span>
                        </div>
                    </div>
                    <div class="mission-card__category-overlay">${mission.category || 'Daily'}</div>
                </div>
                <div class="mission-card__content">
                    <div class="mission-card__header">
                        <div class="mission-card__timer ${this.getTimerClass(mission)}">
                            ${timerText}
                        </div>
                        <h3 class="mission-card__title">${mission.name || 'Mission'}</h3>
                        <p class="mission-card__description">
                            ${mission.description || 'Mission description'}
                        </p>
                    </div>
                    <div class="mission-card__progress">
                        <div class="mission-card__progress-info">
                            <span class="mission-card__progress-text">Progress</span>
                            <span class="mission-card__progress-value">${this.getProgressText(mission)}</span>
                        </div>
                        <div class="mission-card__progress-bar">
                            <div class="mission-card__progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                    </div>
                    <div class="mission-card__actions">
                        <button class="mission-card__btn mission-card__btn--primary ${buttonState.class}" ${buttonState.disabled ? 'disabled' : ''}>
                            ${buttonText}
                        </button>
                        ${buttonState.showSecondary ? `
                            <button class="mission-card__btn mission-card__btn--secondary">
                                View Details
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    calculateProgress(mission) {
        if (!mission.objectives?.events?.[0]) return 0;
        
        const event = mission.objectives.events[0];
        const currentCount = event.currentCount || event.currentcount || 0;
        const totalCount = event.count || 1;
        
        return totalCount > 0 ? (currentCount / totalCount) * 100 : 0;
    }

    getProgressText(mission) {
        if (!mission.objectives?.events?.[0]) return '0/1';
        
        const event = mission.objectives.events[0];
        const currentCount = event.currentCount || event.currentcount || 0;
        const totalCount = event.count || 1;
        
        return `${currentCount}/${totalCount}`;
    }

    getTimerText(mission) {
        if (!mission.active?.to) return '⏰ No time limit';
        
        const endTime = new Date(mission.active.to);
        const now = new Date();
        const diffTime = endTime - now;
        
        if (diffTime <= 0) return '⏰ Expired';
        
        return `⏰ ${this.formatTimeRemaining(mission.active.to)}`;
    }

    getTimerClass(mission) {
        if (!mission.active?.to) return '';
        
        const endTime = new Date(mission.active.to);
        const now = new Date();
        const diffTime = endTime - now;
        
        if (diffTime <= 0) return 'mission-card__timer--expired';
        if (diffTime < 24 * 60 * 60 * 1000) return 'mission-card__timer--urgent'; // 24 hours
        
        return '';
    }

    getButtonText(mission) {
        if (mission.status === 'completed') return 'Claim';
        if (mission.status === 'locked') return 'Locked';
        if (mission.status === 'upcoming') return 'Coming Soon';
        
        const hasProgress = (mission.objectives?.events?.[0]?.currentCount > 0) || 
                          (mission.objectives?.events?.[0]?.currentcount > 0);
        return hasProgress ? 'Continue' : 'Start';
    }

    getButtonState(mission) {
        if (mission.status === 'completed') {
            return { class: 'mission-card__btn--success', disabled: false, showSecondary: false };
        }
        if (mission.status === 'locked' || mission.status === 'upcoming') {
            return { class: '', disabled: true, showSecondary: false };
        }
        
        return { class: '', disabled: false, showSecondary: true };
    }

    // Helper methods for mission data
    getMissionIcon(category) {
        const icons = {
            'daily': '🚀',
            'weekly': '📅',
            'monthly': '🗓️',
            'elite': '🔥',
            'special': '⭐',
            'getting started': '🎯',
            'default': '🎯'
        };
        return icons[category?.toLowerCase()] || icons.default;
    }

    formatTimeRemaining(expiryDate) {
        if (!expiryDate) return 'No time limit';
        
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - now;
        
        if (diffTime <= 0) return 'Expired';
        
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // 24 hours
            const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); // 1 hour
            const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60)); // 1 minute
        
        if (diffDays > 0) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} remaining`;
        } else {
            return 'Less than 1 minute remaining';
        }
    }

    renderNoMissions() {
        this.container.innerHTML = `
            <div class="missions-empty">
                <div class="missions-empty__icon">📭</div>
                <h3 class="missions-empty__title">No Missions Available</h3>
                <p class="missions-empty__message">There are no missions available for you at this time.</p>
            </div>
        `;
    }

    renderError(message) {
        this.container.innerHTML = `
            <div class="missions-error">
                <div class="missions-error__icon">⚠️</div>
                <h3 class="missions-error__title">Error Loading Missions</h3>
                <p class="missions-error__message">${message}</p>
                <button class="missions-error__retry" onclick="this.closest('.missions-error').parentElement.dispatchEvent(new CustomEvent('retry:clicked'))">
                    Try Again
                </button>
            </div>
        `;
        
        // Add retry event listener
        this.container.addEventListener('retry:clicked', () => {
            this.loadMissions();
        });
    }

    bindMissionEvents() {
        const missionCards = this.container.querySelectorAll('.mission-card');
        missionCards.forEach(card => {
        // Primary button click
            const primaryBtn = card.querySelector('.mission-card__btn--primary');
        if (primaryBtn) {
            primaryBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                    this.handlePrimaryAction(card);
            });
        }

        // Secondary button click
            const secondaryBtn = card.querySelector('.mission-card__btn--secondary');
        if (secondaryBtn) {
            secondaryBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                    this.handleSecondaryAction(card);
            });
        }

        // Card click for details
            card.addEventListener('click', (e) => {
            if (!e.target.closest('.mission-card__btn')) {
                    this.showDetails(card);
                }
            });
        });
    }

    // Update a specific mission's progress
    updateMissionProgress(missionId, progressData) {
        const missionCard = this.container.querySelector(`[data-mission-id="${missionId}"]`);
        if (!missionCard) {
            console.warn(`[MissionManager] Mission card not found for ID: ${missionId}`);
            return;
        }

        // Extract progress from various possible response structures
        let eventData = null;
        
        // Try progress.events (API response structure: {player: {...}, progress: {events: [...]}})
        if (progressData.progress?.events && progressData.progress.events.length > 0) {
            eventData = progressData.progress.events[0];
        }
        // Try events array directly in response
        else if (progressData.events && progressData.events.length > 0) {
            eventData = progressData.events[0];
        }
        // Try objectives.events (old format)
        else if (progressData.objectives?.events?.[0]) {
            eventData = progressData.objectives.events[0];
        }
        // Try progress object directly if it contains count/currentCount
        else if (progressData.progress && (progressData.progress.currentCount !== undefined || progressData.progress.count !== undefined)) {
            eventData = progressData.progress;
        }

        if (!eventData) {
            console.warn(`[MissionManager] No event data found for mission: ${missionId}`);
            return;
        }

        const currentCount = eventData.currentCount || eventData.currentcount || 0;
        const totalCount = eventData.count || 1;
        const progressPercentage = totalCount > 0 ? (currentCount / totalCount) * 100 : 0;
        const progressText = `${currentCount}/${totalCount}`;

        // Update progress bar
        const progressFill = missionCard.querySelector('.mission-card__progress-fill');
        const progressValue = missionCard.querySelector('.mission-card__progress-value');
        
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        if (progressValue) {
            progressValue.textContent = progressText;
        }

        // Also update the mission data in our local array
        const missionIndex = this.missions.findIndex(m => m.id === missionId);
        if (missionIndex !== -1) {
            // Update the mission data structure to match what we expect
            if (!this.missions[missionIndex].objectives) {
                this.missions[missionIndex].objectives = {};
            }
            if (!this.missions[missionIndex].objectives.events) {
                this.missions[missionIndex].objectives.events = [];
            }
            this.missions[missionIndex].objectives.events[0] = eventData;
        }
    }

    handlePrimaryAction(card) {
        const missionId = card.dataset.missionId;
        
        // Emit action event for parent components to handle
        this.container.dispatchEvent(new CustomEvent('mission:primary-action', {
            detail: { missionId, action: 'primary' }
        }));
    }

    handleSecondaryAction(card) {
        const missionId = card.dataset.missionId;
        
        // Emit action event for parent components to handle
        this.container.dispatchEvent(new CustomEvent('mission:secondary-action', {
            detail: { missionId, action: 'secondary' }
        }));
    }

    showDetails(card) {
        const missionId = card.dataset.missionId;
        
        // Emit details event for parent components to handle
        this.container.dispatchEvent(new CustomEvent('mission:details', {
            detail: { missionId }
        }));
    }

    refresh() {
        return this.loadMissions();
    }

    getMissions() {
        return this.missions;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MissionManager;
}

// MissionComponent class - Wrapper for MissionManager to match app initialization
class MissionComponent {
    constructor(api) {
        this.api = api;
        this.container = document.getElementById('section-missions');
        this.missionManager = null;
        
        if (this.container) {
            this.init();
        } else {
            console.warn('[MissionComponent] Container not found: section-missions');
        }
    }
    
    async init() {
        try {
            // Check if a player is already loaded
            const currentAPI = window.gameLayerApp ? window.gameLayerApp.getAPI() : this.api;
            const currentPlayerId = currentAPI.config.defaultPlayer;
            
            if (currentPlayerId && currentPlayerId !== 'player-280972') {
                // Load missions for the current player
                await this.loadForPlayer(currentPlayerId);
            } else {
                this.container.innerHTML = `
                    <div class="missions-waiting">
                        <div class="missions-waiting__content">
                            <p>Select a player to view missions</p>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('[MissionComponent] Initialization failed:', error);
        }
    }
    
    // Public methods for the app to call
    async load() {
        try {
            // Get the current player ID from the API config
            const currentPlayerId = this.api.config.defaultPlayer;
            
            // Check if we have a valid player ID
            if (!currentPlayerId || currentPlayerId === 'player-280972') {
                this.container.innerHTML = `
                    <div class="missions-waiting">
                        <div class="missions-waiting__content">
                            <p>Select a player to view missions</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            // Load missions for the current player
            await this.loadForPlayer(currentPlayerId);
        } catch (error) {
            console.error('[MissionComponent] Failed to load missions:', error);
            this.renderError('Failed to load missions');
        }
    }
    
    // Load missions for a specific player ID (called by PlayerLoader)
    async loadForPlayer(playerId) {
        try {
            if (!playerId || playerId === 'player-280972') {
                this.container.innerHTML = `
                    <div class="missions-waiting">
                        <div class="missions-waiting__content">
                            <p>Select a player to view missions</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            // Always get the current API instance to ensure we have the latest player ID
            const currentAPI = window.gameLayerApp ? window.gameLayerApp.getAPI() : this.api;
            
            // Initialize the mission manager if not already done
            if (!this.missionManager) {
                this.missionManager = new MissionManager(this.container, {
                    playerId: playerId,
                    autoLoad: false
                });
            } else {
                // Update the player ID
                this.missionManager.options.playerId = playerId;
            }
            
            // Now explicitly load missions for this player
            const result = await this.missionManager.loadMissions();
            return result;
        } catch (error) {
            console.error('[MissionComponent] Failed to load missions for player:', error);
            this.renderError('Failed to load missions');
        }
    }
    
    refresh(playerId) {
        if (playerId) {
            return this.loadForPlayer(playerId);
        } else {
            return this.load();
        }
    }
    
    getMissions() {
        if (this.missionManager) {
            return this.missionManager.missions;
        }
        return [];
    }

    // Update mission progress from API
    async updateMissionProgress(missionId, playerId = null) {
        try {
            const currentPlayerId = playerId || this.api.config.defaultPlayer;
            if (!currentPlayerId) {
                console.warn('[MissionComponent] No player ID available to update mission progress');
                return;
            }

            if (!this.missionManager) {
                console.warn('[MissionComponent] Mission manager not initialized');
                return;
            }

            // Fetch updated mission progress from API
            const progressData = await this.api.getPlayerMissionProgress(currentPlayerId, missionId);
            
            // Update the mission card with new progress
            this.missionManager.updateMissionProgress(missionId, progressData);
        } catch (error) {
            console.error(`[MissionComponent] Failed to update mission progress for ${missionId}:`, error);
        }
    }

    // Update all mission progresses
    async updateAllMissionProgress(playerId = null) {
        const currentPlayerId = playerId || this.api.config.defaultPlayer;
        
        if (!currentPlayerId) {
            console.warn('[MissionComponent] No player ID available to update mission progress');
            return;
        }

        if (!this.missionManager) {
            console.warn('[MissionComponent] Mission manager not initialized');
            return;
        }

        // Get actual mission IDs from loaded missions instead of hardcoded values
        const loadedMissions = this.missionManager.missions || [];
        const missionIds = loadedMissions.map(m => m.id);

        if (missionIds.length === 0) {
            console.warn('[MissionComponent] No missions loaded to update');
            // Try to reload missions first
            await this.loadForPlayer(currentPlayerId);
            return;
        }

        // Update all missions in parallel
        await Promise.all(
            missionIds.map(missionId => this.updateMissionProgress(missionId, currentPlayerId))
        );
    }
}

// Make MissionComponent globally available for browser usage
if (typeof window !== 'undefined') {
    window.MissionComponent = MissionComponent;
}

