/**
 * GameLayer API Client
 * 
 * This class provides a comprehensive interface to the GameLayer API, handling:
 * - Authentication and request management
 * - Player data retrieval and management
 * - Mission and leaderboard data
 * - Rewards and achievements
 * - Error handling and response processing
 * 
 * @version 1.0.0
 * @author GameLayer Assets
 * @license MIT
 */

class GameLayerAPI {
    constructor(config = {}) {
        this.config = {
            baseURL: 'https://api.gamelayer.co/api/v0',
            apiKey: 'f0089f32c290c458f0db55514239af44',
            defaultPlayer: null, // No hardcoded default
            accountId: 'gl-assets',
            ...config
        };

        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'api-key': this.config.apiKey
        };
    }

    

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.config.baseURL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                headers: this.headers,
                ...options
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('[GameLayer API] Request failed:', error);
            throw error;
        }
    }

    // === MISSION API METHODS ===
    
    async getMission(missionId) {
        return this.request(`/missions/${missionId}?account=${this.config.accountId}`);
    }

    async getAllMissions() {
        return this.request(`/missions?account=${this.config.accountId}`);
    }

    async getPlayerMission(playerId, missionId) {
        return this.request(`/missions/${missionId}?account=${this.config.accountId}&player=${playerId}`);
    }

    async getPlayerMissions(playerId) {
        if (!playerId) {
            throw new Error('Player ID is required');
        }
        return this.request(`/missions?account=${this.config.accountId}&player=${playerId}`);
    }

    // === PROFILE API METHODS ===
    
    async getPlayerProfile(playerId = null) {
        if (!playerId && !this.config.defaultPlayer) {
            throw new Error('Player ID is required');
        }
        const player = playerId || this.config.defaultPlayer;
        return this.request(`/players/${player}?account=${this.config.accountId}`);
    }

    async getPlayerStats(playerId = null) {
        if (!playerId && !this.config.defaultPlayer) {
            throw new Error('Player ID is required');
        }
        const player = playerId || this.config.defaultPlayer;
        return this.request(`/players/${player}/stats?account=${this.config.accountId}`);
    }

    async getPlayerAchievements(playerId = null) {
        if (!playerId && !this.config.defaultPlayer) {
            throw new Error('Player ID is required');
        }
        const player = playerId || this.config.defaultPlayer;
        const result = await this.request(`/players/${player}/achievements?account=${this.config.accountId}`);
        return result;
    }

    // === LEVELING API METHODS ===
    
    async getLevels() {
        return this.request(`/levels?account=${this.config.accountId}`);
    }

    async getPlayerLevels(playerId = null) {
        const player = playerId || this.config.defaultPlayer;
        return this.request(`/players/${player}/levels?account=${this.config.accountId}`);
    }

    // === LEADERBOARD API METHODS ===
    
    async getLeaderboard(period = 'all', limit = 50) {
        // Use the players endpoint to get leaderboard data
        return this.request(`/players?account=${this.config.accountId}&limit=${limit}`);
    }

    async getLeaderboards() {
        return this.request(`/leaderboards?account=${this.config.accountId}`);
    }

    async getLeaderboardWithRankings(leaderboardId = 'main-leaderboard') {
        return this.request(`/leaderboards/${leaderboardId}?account=${this.config.accountId}`);
    }

    async getPlayers(limit = 50) {
        return this.request(`/players?account=${this.config.accountId}&limit=${limit}`);
    }

    async getAllPlayers() {
        return this.request(`/players?account=${this.config.accountId}&limit=100`);
    }

    async getPlayerRanking(playerId = null) {
        const player = playerId || this.config.defaultPlayer;
        return this.request(`/players/${player}?account=${this.config.accountId}`);
    }

    async getPlayer(playerId) {
        return this.request(`/players/${playerId}?account=${this.config.accountId}`);
    }

    // === REWARDS API METHODS ===
    
    async getAvailableRewards() {
        return this.request(`/rewards?account=${this.config.accountId}`);
    }

    async getPrizes() {
        return this.request(`/prizes?account=${this.config.accountId}`);
    }

    async getPlayerRewards(playerId = null) {
        const player = playerId || this.config.defaultPlayer;
        return this.request(`/rewards/player/${player}?account=${this.config.accountId}`);
    }

    async redeemReward(rewardId, playerId = null) {
        const player = playerId || this.config.defaultPlayer;
        return this.request(`/rewards/${rewardId}/redeem`, {
            method: 'POST',
            body: JSON.stringify({
                player: player,
                account: this.config.accountId
            })
        });
    }

    // === EVENT API METHODS ===
    
    async completeEvent(eventId, playerId = null) {
        const player = playerId || this.config.defaultPlayer;
        return this.request(`/events/${eventId}/complete`, {
            method: 'POST',
            body: JSON.stringify({
                player: player,
                account: this.config.accountId
            })
        });
    }

    // === UTILITY METHODS ===
    
    getConfig() {
        return { ...this.config };
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.headers['api-key'] = this.config.apiKey;
    }

    updateDefaultPlayer(playerId) {
        this.config.defaultPlayer = playerId;

    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameLayerAPI;
}

// Make GameLayerAPI globally available for browser usage
if (typeof window !== 'undefined') {
    window.GameLayerAPI = GameLayerAPI;
}
