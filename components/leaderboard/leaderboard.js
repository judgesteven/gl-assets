/**
 * GameLayer Leaderboard Component
 * 
 * Displays player rankings and leaderboard information.
 * IMPORTANT: This component ONLY uses real data from GameLayer API.
 * 
 * @version 1.0.0
 * @author GameLayer Assets
 * @license MIT
 */

class LeaderboardComponent {
    constructor(api) {
        this.api = api;
        this.container = null;
        this.data = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.init();
    }

    init() {
        this.container = document.getElementById('section-leaderboard');
    }

    async load() {
        try {
            // Fetch real data from the API
            this.data = await this.fetchLeaderboardData();
            this.render();
        } catch (error) {
            console.error('[Leaderboard Component] Failed to load leaderboard:', error);
            this.renderError('Failed to load leaderboard data');
        }
    }

    render() {
        if (!this.container) return;
        
        if (!this.data) {
            this.renderLoading();
            return;
        }

        this.container.innerHTML = `
            <div class="leaderboard-section">
                <!-- Leaderboard Header -->
                <div class="leaderboard-header">
                    <div class="leaderboard-header__title">
                        <h3>${this.data.leaderboardName || 'Global Leaderboard'}</h3>
                        <p>${this.data.leaderboardDescription || 'Top players this month'}</p>
                    </div>
                    <div class="leaderboard-header__right">
                        <div class="leaderboard-header__stats">
                            <div class="leaderboard-header__stats-label">Total Players:</div>
                            <div class="leaderboard-stat">
                                <span class="leaderboard-stat__value">${this.data.totalPlayers}</span>
                            </div>
                        </div>
                        <div class="leaderboard-header__stats">
                            <div class="leaderboard-header__stats-label">Your Ranking:</div>
                            <div class="leaderboard-stat">
                                <span class="leaderboard-stat__value">${this.data.yourRanking.rank} / ${this.data.totalPlayers}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Single Leaderboard List -->
                <div class="leaderboard-list">
                    <h4 class="leaderboard-list__title">Player Rankings</h4>
                    ${this.data.allPlayers.length > 0 ? `
                        <div class="leaderboard-list__table">
                            ${this.getPaginatedPlayers().map((player, index) => {
                                const globalIndex = (this.currentPage - 1) * this.itemsPerPage + index;
                                return `
                                <div class="leaderboard-row ${player.isCurrentUser ? 'leaderboard-row--current' : ''}" data-player-id="${player.id}">
                                    <div class="leaderboard-row__rank">
                                        <span class="leaderboard-row__number">${globalIndex + 1}</span>
                                    </div>
                                    <div class="leaderboard-row__player">
                                        <div class="leaderboard-row__avatar">
                                            ${player.avatar && player.avatar !== '👤' ? 
                                                `<img src="${typeof resolveImageUrl === 'function' ? resolveImageUrl(player.avatar) : player.avatar}" alt="${player.name}" class="leaderboard-row__avatar-img" onerror="this.onerror=null;this.style.display='none';var n=this.nextElementSibling;if(n)n.style.display='inline'"><span class="leaderboard-row__placeholder" style="display:none">👤</span>` :
                                                `<span class="leaderboard-row__placeholder">${player.avatar || '👤'}</span>`
                                            }
                                        </div>
                                        <div class="leaderboard-row__info">
                                            <h5 class="leaderboard-row__name">${player.name}</h5>
                                            ${player.isCurrentUser ? '<span class="leaderboard-row__badge leaderboard-row__badge--current">YOU</span>' : ''}
                                        </div>
                                    </div>
                                    <div class="leaderboard-row__stats">
                                        <div class="leaderboard-row__stat">
                                            <span class="leaderboard-row__stat-value">${player.points.toLocaleString()}</span>
                                            <span class="leaderboard-row__stat-label">Points</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                            }).join('')}
                        </div>
                        
                        ${this.getTotalPages() > 1 ? `
                            <div class="leaderboard-pagination">
                                <div class="leaderboard-pagination__info">
                                    Showing ${(this.currentPage - 1) * this.itemsPerPage + 1} - ${Math.min(this.currentPage * this.itemsPerPage, this.data.allPlayers.length)} of ${this.data.allPlayers.length} players
                                </div>
                                <div class="leaderboard-pagination__controls">
                                    <button class="leaderboard-pagination__prev ${this.currentPage === 1 ? 'leaderboard-pagination__button--disabled' : ''}" ${this.currentPage === 1 ? 'disabled' : ''}>
                                        ← Previous
                                    </button>
                                    
                                    <div class="leaderboard-pagination__pages">
                                        ${this.generatePageNumbers()}
                                    </div>
                                    
                                    <button class="leaderboard-pagination__next ${this.currentPage === this.getTotalPages() ? 'leaderboard-pagination__button--disabled' : ''}" ${this.currentPage === this.getTotalPages() ? 'disabled' : ''}>
                                        Next →
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                    ` : `
                        <div class="leaderboard-empty">
                            <div class="leaderboard-empty__icon">📊</div>
                            <h4 class="leaderboard-empty__title">No Players Found</h4>
                            <p class="leaderboard-empty__message">This leaderboard currently has no players. Players will appear here once they start earning points.</p>
                        </div>
                    `}
                </div>


            </div>
        `;

        this.addEventListeners();
    }





    async fetchLeaderboardData() {
        try {
            // Get leaderboard with player rankings
            const leaderboardData = await this.api.getLeaderboardWithRankings('main-leaderboard');

            // Get ALL players to ensure new players appear on leaderboard
            const allPlayersData = await this.api.getAllPlayers();

            // Extract player IDs from ALL players (not just leaderboard)
            let playerIds = [];
            if (allPlayersData && allPlayersData.data) {
                playerIds = allPlayersData.data.map(player => player.player || player.id).filter(Boolean);
            }
            
            // Also include any players from leaderboard that might not be in allPlayers
            if (leaderboardData && leaderboardData.scores && leaderboardData.scores.data) {
                const leaderboardPlayerIds = leaderboardData.scores.data.map(player => player.player || player.id).filter(Boolean);
                playerIds = [...new Set([...playerIds, ...leaderboardPlayerIds])]; // Merge and remove duplicates
            }

            // Fetch detailed player data for each player
            const playerDetails = await this.fetchPlayerDetails(playerIds);

            // Transform API data to our component format with player details
            return this.transformLeaderboardData(leaderboardData, playerDetails, allPlayersData);
        } catch (error) {
            console.error('[Leaderboard Component] Failed to fetch leaderboard data:', error);
            throw error;
        }
    }

    async fetchPlayerDetails(playerIds) {
        try {
            // Fetch player details for each player ID
            const playerDetailsPromises = playerIds.map(async (playerId) => {
                try {
                    const playerData = await this.api.getPlayer(playerId);
                    return playerData;
                } catch (error) {
                    console.error(`[Leaderboard Component] Failed to fetch player data for ${playerId}:`, error);
                    return null;
                }
            });

            const playerDetails = await Promise.all(playerDetailsPromises);
            
            return playerDetails.filter(player => player !== null);
        } catch (error) {
            console.error('[Leaderboard Component] Failed to fetch player details:', error);
            return [];
        }
    }

    transformLeaderboardData(leaderboardData, playerDetails = [], allPlayersData = []) {
        // Extract leaderboard name and description
        let leaderboardName = 'Global Leaderboard';
        let leaderboardDescription = 'Top players this month';
        
        // Create a comprehensive list of all players
        let players = [];
        let totalPlayers = 0;
        
        if (leaderboardData && leaderboardData.leaderboard) {
            leaderboardName = leaderboardData.leaderboard.name || leaderboardName;
            leaderboardDescription = leaderboardData.leaderboard.description || leaderboardDescription;
        }
        
        // Add players from leaderboard with their scores
        if (leaderboardData && leaderboardData.scores && leaderboardData.scores.data) {
            leaderboardData.scores.data.forEach(player => {
                players.push({
                    ...player,
                    hasScore: true,
                    scores: player.scores || 0
                });
            });
        }
        
        // Add players from allPlayers that don't have scores yet
        if (allPlayersData && allPlayersData.data) {
            allPlayersData.data.forEach(player => {
                const existingPlayer = players.find(p => (p.player || p.id) === (player.player || player.id));
                if (!existingPlayer) {
                    players.push({
                        ...player,
                        hasScore: false,
                        scores: 0
                    });
                }
            });
        }
        
        totalPlayers = players.length;

        // Sort players by points (descending) if there are any players
        if (players.length > 0) {
            players.sort((a, b) => (b.scores || 0) - (a.scores || 0));
        }

        // Create single list of all players with merged data
        const allPlayers = players.map((player, index) => {
            const playerId = player.player || player.id || `player-${index + 1}`;
            const isCurrentUser = playerId === this.api.config.defaultPlayer;
            
            // Find matching player details
            const playerDetail = playerDetails.find(detail => detail.player === playerId);
            
            // Check if we found the player detail
            if (!playerDetail) {
                // Player detail not found, continue with available data
            }
            

            
            return {
                id: playerId,
                name: playerDetail?.name || player.name || 'Unknown Player',
                avatar: playerDetail?.imgUrl || '👤',
                points: player.scores || 0,
                trend: 'stable', // Default to stable since we don't have trend data
                isCurrentUser: isCurrentUser
            };
        });

        // Calculate current user ranking based on actual data
        const currentPlayer = allPlayers.find(p => p.isCurrentUser);
        const yourRanking = {
            rank: currentPlayer ? allPlayers.findIndex(p => p.id === currentPlayer.id) + 1 : 0,
            points: currentPlayer ? currentPlayer.points : 0
        };

        return {
            leaderboardName,
            leaderboardDescription,
            totalPlayers,
            allPlayers,
            yourRanking
        };
    }









    getPaginatedPlayers() {
        if (!this.data || !this.data.allPlayers) return [];
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.data.allPlayers.slice(startIndex, endIndex);
    }

    getTotalPages() {
        if (!this.data || !this.data.allPlayers) return 1;
        return Math.ceil(this.data.allPlayers.length / this.itemsPerPage);
    }

    generatePageNumbers() {
        const totalPages = this.getTotalPages();
        if (totalPages <= 1) return '';
        
        const currentPage = this.currentPage;
        const pages = [];
        
        // Always show first page
        pages.push(this.createPageButton(1, currentPage === 1));
        
        // Show pages around current page
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);
        
        if (startPage > 2) {
            pages.push('<span class="leaderboard-pagination__ellipsis">...</span>');
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(this.createPageButton(i, i === currentPage));
        }
        
        if (endPage < totalPages - 1) {
            pages.push('<span class="leaderboard-pagination__ellipsis">...</span>');
        }
        
        // Always show last page if there's more than one page
        if (totalPages > 1) {
            pages.push(this.createPageButton(totalPages, currentPage === totalPages));
        }
        
        return pages.join('');
    }

    createPageButton(pageNumber, isActive) {
        return `<button class="leaderboard-pagination__page ${isActive ? 'leaderboard-pagination__page--active' : ''}" data-page="${pageNumber}">${pageNumber}</button>`;
    }

    goToPage(page) {
        if (page < 1 || page > this.getTotalPages()) return;
        this.currentPage = page;
        this.render();
    }

    addEventListeners() {
        // Player row click events
        const playerRows = this.container.querySelectorAll('.leaderboard-row');
        playerRows.forEach(row => {
            row.addEventListener('click', () => {
                const playerId = row.dataset.playerId;
                this.onPlayerClick(playerId);
            });
        });

        // Pagination event listeners
        const prevButton = this.container.querySelector('.leaderboard-pagination__prev');
        const nextButton = this.container.querySelector('.leaderboard-pagination__next');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                this.goToPage(this.currentPage - 1);
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                this.goToPage(this.currentPage + 1);
            });
        }

        // Page number click events
        const pageButtons = this.container.querySelectorAll('.leaderboard-pagination__page');
        pageButtons.forEach(button => {
            button.addEventListener('click', () => {
                const page = parseInt(button.dataset.page);
                this.goToPage(page);
            });
        });
    }

    onPlayerClick(playerId) {
        this.emit('player:clicked', { playerId });
    }

    renderLoading() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="leaderboard-loading">
                <div class="leaderboard-loading__spinner">⏳</div>
                <h3 class="leaderboard-loading__title">Loading Leaderboard...</h3>
                <p class="leaderboard-loading__message">Fetching the latest player rankings</p>
            </div>
        `;
    }

    renderError(message) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="leaderboard-error">
                <div class="leaderboard-error__icon">⚠️</div>
                <h3 class="leaderboard-error__title">Error Loading Leaderboard</h3>
                <p class="leaderboard-error__message">${message}</p>
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
