/**
 * GameLayer Rewards Component
 * 
 * Displays available rewards and player's reward collection.
 * 
 * @version 1.0.0
 * @author GameLayer Assets
 * @license MIT
 */

// Constants
const DEFAULT_STOCK_VALUE = 999;

class RewardsComponent {
    constructor(api) {
        this.api = api;
        this.container = null;
        this.data = null;
        this.init();
    }

    init() {
        this.container = document.getElementById('section-rewards');
    }

    async load() {
        try {
            // Fetch real prizes data from API
            const prizesData = await this.api.getPrizes();
            
            this.data = this.processPrizesData(prizesData);
            this.render();
        } catch (error) {
            console.error('[Rewards Component] Failed to load prizes:', error);
            this.renderError('Failed to load rewards data');
        }
    }

    processPrizesData(apiData) {
        // Process the real API data structure with better error handling
        let prizes = [];
        
        // Handle different possible data structures
        if (Array.isArray(apiData)) {
            prizes = apiData;
        } else if (apiData && apiData.prizes && Array.isArray(apiData.prizes)) {
            prizes = apiData.prizes;
        } else if (apiData && apiData.data && Array.isArray(apiData.data)) {
            prizes = apiData.data;
        } else if (apiData && apiData.results && Array.isArray(apiData.results)) {
            prizes = apiData.results;
        } else {
            prizes = [];
        }
        
        // Ensure prizes is always an array
        if (!Array.isArray(prizes)) {
            prizes = [];
        }
        
        // Process prizes into rewards format - limit to 4 for the grid
        const featuredRewards = prizes.slice(0, 4).map(prize => {
            // Extract expiry date from active.to field
            let expiryDate = null;
            let daysRemaining = 0;
            
            if (prize.active && prize.active.to) {
                expiryDate = new Date(prize.active.to);
                const now = new Date();
                const diffTime = expiryDate.getTime() - now.getTime();
                daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
            }
            
            // Extract stock from stock.available field
            const stock = prize.stock?.available || prize.available || DEFAULT_STOCK_VALUE;
            
            return {
                id: prize.id || `prize-${Math.random().toString(36).substr(2, 9)}`,
                icon: prize.icon || '🏆',
                imgUrl: prize.imgURL || prize.imgUrl || prize.image || null,
                name: prize.name || 'Unknown Prize',
                description: prize.description || 'Complete requirements to unlock this prize',
                requirement: this.formatRequirement(prize.requirement),
                points: prize.points || 100,
                credits: prize.credits || 10,
                isUnlocked: prize.status === 'unlocked' || prize.isUnlocked || false,
                category: prize.category || 'General',
                stock: stock,
                expiryDate: expiryDate,
                daysRemaining: daysRemaining
            };
        });
        
        return {
            totalRewards: prizes.length,
            unlockedRewards: prizes.filter(p => p.status === 'unlocked' || p.isUnlocked).length,
            featuredRewards: featuredRewards
        };
    }

    formatRequirement(requirement) {
        if (!requirement) return 'Complete requirements';
        
        // Handle different requirement types
        if (requirement.missions && requirement.missions.length > 0) {
            return `Complete ${requirement.missions.length} mission(s)`;
        }
        if (requirement.achievements && requirement.achievements.length > 0) {
            return `Unlock ${requirement.achievements.length} achievement(s)`;
        }
        if (requirement.level && requirement.level.min) {
            return `Reach level ${requirement.level.min}`;
        }
        if (requirement.category) {
            return `Complete ${requirement.category} tasks`;
        }
        
        return 'Complete requirements';
    }

    render() {
        if (!this.container || !this.data) return;

        this.container.innerHTML = `
            <div class="rewards-section">

                <!-- Featured Rewards -->
                <div class="rewards-featured">
                    <div class="rewards-featured__grid">
                        ${this.data.featuredRewards.map(reward => `
                            <div class="reward-card reward-card--featured" data-reward-id="${reward.id}">
                                <div class="reward-card__image">
                                    ${reward.imgUrl ? 
                                        `<img src="${reward.imgUrl}" alt="${reward.name}" class="reward-card__real-image">` : 
                                        `<div class="reward-card__image-placeholder">${reward.icon}</div>`
                                    }
                                    <div class="reward-card__category-overlay">${reward.category}</div>
                                    <div class="reward-card__credits-overlay">💎 -${reward.credits}</div>
                                    ${reward.isUnlocked ? '<div class="reward-card__unlocked">✅</div>' : ''}
                                </div>
                                
                                ${reward.expiryDate ? `
                                    <div class="reward-card__expiry-badge">
                                        <span class="reward-card__expiry-icon">⏰</span>
                                        <span class="reward-card__expiry-days">${reward.daysRemaining} days left</span>
                                    </div>
                                ` : ''}
                                
                                <div class="reward-card__content">
                                    <div class="reward-card__header">
                                        <h5 class="reward-card__name">${reward.name}</h5>
                                    </div>
                                    <p class="reward-card__description">${reward.description}</p>
                                    
                                    <span class="reward-card__stock-badge">Available: ${reward.stock}</span>
                                </div>
                                <div class="reward-card__actions">
                                    ${reward.isUnlocked ? 
                                        '<button class="reward-card__btn reward-card__btn--claimed" disabled>Claimed</button>' :
                                        '<button class="reward-card__btn reward-card__btn--claim">Get Prize</button>'
                                    }
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>



            </div>
        `;

        this.addEventListeners();
    }



    addEventListeners() {
        // Featured reward claim buttons
        const claimButtons = this.container.querySelectorAll('.reward-card__btn--claim');
        claimButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const rewardCard = button.closest('.reward-card');
                const rewardId = rewardCard.dataset.rewardId;
                this.onRewardClaim(rewardId);
            });
        });

        // Category tabs
        const categoryTabs = this.container.querySelectorAll('.rewards-tab');
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const categoryId = tab.dataset.category;
                this.switchCategory(categoryId);
            });
        });

        // Reward item clicks
        const rewardItems = this.container.querySelectorAll('.reward-item');
        rewardItems.forEach(item => {
            item.addEventListener('click', () => {
                const rewardId = item.dataset.rewardId;
                this.onRewardClick(rewardId);
            });
        });
    }

    async onRewardClaim(rewardId) {
        try {
            // Get the button element to show loading state
            const rewardCard = this.container.querySelector(`[data-reward-id="${rewardId}"]`);
            const claimButton = rewardCard?.querySelector('.reward-card__btn--claim');
            
            if (!claimButton) {
                console.error('[Rewards Component] Claim button not found for reward:', rewardId);
                return;
            }

            // Disable button and show loading state
            claimButton.disabled = true;
            claimButton.textContent = 'Claiming...';
            claimButton.classList.add('reward-card__btn--loading');

            // Get current player ID
            const currentPlayerId = this.api.config.defaultPlayer;
            if (!currentPlayerId) {
                alert('Please select a player first');
                claimButton.disabled = false;
                claimButton.textContent = 'Get Prize';
                claimButton.classList.remove('reward-card__btn--loading');
                return;
            }

            console.log('[Rewards Component] Claiming prize:', rewardId, 'for player:', currentPlayerId);

            // Call the API to claim the prize
            const result = await this.api.claimPrize(rewardId, currentPlayerId);
            
            console.log('[Rewards Component] Prize claim result:', result);

            // Show success notification
            alert('Prize claimed successfully! Updating balance and stock...');

            // Refresh profile and rewards to show updated data
            try {
                if (window.gameLayerApp) {
                    await window.gameLayerApp.refreshAllSections();
                } else {
                    // Fallback to direct component loading
                    if (window.profileComponent) {
                        await window.profileComponent.load();
                    }
                    await this.load();
                }
            } catch (error) {
                console.error('[Rewards Component] Failed to refresh components:', error);
                // Still refresh rewards even if profile refresh fails
                await this.load();
            }

            console.log('[Rewards Component] Prize claim complete, components refreshed');

        } catch (error) {
            // Log detailed error information
            console.error('[Rewards Component] Failed to claim prize:', error);
            console.error('[Rewards Component] Error message:', error.message);
            console.error('[Rewards Component] Error stack:', error.stack);

            // Show detailed error message
            const errorMessage = error.message || 'Unknown error occurred';
            alert(`Failed to claim prize: ${errorMessage}. Please check the console for more details.`);

            // Re-enable button
            const rewardCard = this.container.querySelector(`[data-reward-id="${rewardId}"]`);
            const claimButton = rewardCard?.querySelector('.reward-card__btn--claim');
            if (claimButton) {
                claimButton.disabled = false;
                claimButton.textContent = 'Get Prize';
                claimButton.classList.remove('reward-card__btn--loading');
            }
        }
    }

    onRewardClick(rewardId) {
        this.emit('reward:clicked', { rewardId });
    }

    switchCategory(categoryId) {
        // Update active tab
        const tabs = this.container.querySelectorAll('.rewards-tab');
        tabs.forEach(tab => tab.classList.remove('rewards-tab--active'));
        this.container.querySelector(`[data-category="${categoryId}"]`).classList.add('rewards-tab--active');

        // Update active category content
        const categories = this.container.querySelectorAll('.rewards-category');
        categories.forEach(category => category.classList.remove('rewards-category--active'));
        this.container.querySelector(`.rewards-category[data-category="${categoryId}"]`).classList.add('rewards-category--active');
    }

    renderError(message) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="rewards-error">
                <div class="rewards-error__icon">⚠️</div>
                <h3 class="rewards-error__title">Error Loading Rewards</h3>
                <p class="rewards-error__message">${message}</p>
            </div>
        `;
    }

    refresh() {
        return this.load();
    }

    getData() {
        return this.data;
    }

    emit(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        this.container.dispatchEvent(event);
    }

    destroy() {
        // Clean up event listeners if needed
    }
}
