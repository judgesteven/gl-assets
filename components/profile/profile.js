/**
 * GameLayer Profile Component
 * 
 * Displays player profile information including stats, achievements, and progress.
 * 
 * @version 1.0.0
 * @author GameLayer Assets
 * @license MIT
 */

class ProfileComponent {
    constructor(api) {
        this.api = api;
        this.container = null;
        this.data = null;
        this.init();
    }

    init() {
        this.container = document.getElementById('section-profile');
        if (!this.container) {
            console.error('[Profile Component] Container not found');
        }
    }

    async load() {
        try {
            // Fetch profile data from API
            const profileData = await this.api.getPlayerProfile();
            const levelsData = await this.api.getLevels();
            const playerLevelsData = await this.api.getPlayerLevels();
            const achievementsData = await this.api.getPlayerAchievements();
            
            // Calculate leveling information
            const levelInfo = this.calculateLevelInfo(levelsData, playerLevelsData, profileData);
            
            // Update the component data with real API data
            this.data = {
                name: profileData.name || profileData.playerName || profileData.displayName || 'Unknown Player',
                imgUrl: profileData.imgUrl || profileData.avatar || profileData.image || null,
                points: profileData.points || profileData.totalPoints || profileData.score || 0,
                credits: profileData.credits || profileData.totalCredits || profileData.currency || 0,
                level: {
                    ordinal: levelInfo.currentLevel - 1, // Convert back to 0-based for consistency
                    name: levelInfo.name,
                    description: levelInfo.description
                },
                levelInfo: levelInfo,
                experience: levelInfo.currentExperience,
                experienceToNext: levelInfo.experienceToNext,
                experiencePercentage: levelInfo.experiencePercentage,
                pointsForNextLevel: levelInfo.pointsForNextLevel,
                pointsDelta: levelInfo.pointsDelta,
                stats: {
                    totalPoints: profileData.points || profileData.totalPoints || profileData.score || 0,
                    totalCredits: profileData.credits || profileData.totalCredits || profileData.currency || 0,
                    missionsCompleted: 0, // Will be populated from API when available
                    achievements: achievementsData && achievementsData.achievements && achievementsData.achievements.completed ? achievementsData.achievements.completed.length : 0
                },
                recentAchievements: this.processAchievementsData(achievementsData)
            };
            

            
            this.render();
            
        } catch (error) {
            console.error('[Profile Component] Failed to load profile:', error);
            console.error('[Profile Component] Load error details:', error);
            console.error('[Profile Component] Error stack:', error.stack);
            this.renderError('Failed to load profile data');
        }
    }

    getLevelExperienceRequirement(level) {
        // Try different possible field names for experience requirements
        const possibleFields = [
            'objectives.points',  // Primary location based on API response
            'experienceRequired',
            'experience',
            'points',
            'requiredPoints',
            'requiredExperience',
            'threshold',
            'minPoints'
        ];
        
        // Check nested objectives.points first (primary location)
        if (level.objectives && level.objectives.points !== undefined && level.objectives.points !== null) {
            return level.objectives.points;
        }
        
        // Check other possible fields
        for (const field of possibleFields) {
            if (field === 'objectives.points') continue; // Already checked above
            
            if (level[field] !== undefined && level[field] !== null) {
                return level[field];
            }
        }
        
        return 0;
    }

    calculateLevelInfo(levelsData, playerLevelsData, profileData) {
        try {
            // Default values if API data is not available
            let currentLevel = 1;
            let currentExperience = 0;
            let experienceToNext = 100;
            let experiencePercentage = 0;
            let levelName = 'Unknown';
            let levelDescription = 'Unknown';
            let pointsForNextLevel = 100;
            let pointsDelta = 100;
            let nextLevelName = 'Unknown';
            
            // Validate profile data
            if (!profileData || typeof profileData !== 'object') {
                return this.getDefaultLevelInfo();
            }
            
            // Get current experience from profile data
            currentExperience = profileData.points || profileData.totalPoints || profileData.score || 0;
            
            // If we have levels data, use it to calculate the player's actual current level based on points
            if (levelsData && Array.isArray(levelsData) && levelsData.length > 0) {
                // Sort levels by ordinal (ascending)
                const sortedLevels = [...levelsData].sort((a, b) => {
                    const aOrdinal = a.ordinal || 0;
                    const bOrdinal = b.ordinal || 0;
                    return aOrdinal - bOrdinal;
                });
                
                // Calculate the player's actual current level based on their points
                let actualCurrentLevel = sortedLevels[0]; // Start with the lowest level
                let actualCurrentLevelOrdinal = 0;
                
                for (let i = sortedLevels.length - 1; i >= 0; i--) {
                    const level = sortedLevels[i];
                    const levelExpRequired = this.getLevelExperienceRequirement(level);
                    
                    if (currentExperience >= levelExpRequired) {
                        actualCurrentLevel = level;
                        actualCurrentLevelOrdinal = level.ordinal;
                        break;
                    }
                }
                
                // Update current level based on actual points, not API level object
                currentLevel = actualCurrentLevelOrdinal + 1;
                levelName = actualCurrentLevel.name;
                levelDescription = actualCurrentLevel.description;
                
                // Find the next level (the level after the current one)
                const nextLevel = sortedLevels.find(level => {
                    const levelNumber = (level.ordinal || 0) + 1;
                    return levelNumber === currentLevel + 1;
                });
                
                if (nextLevel) {
                    // Store the next level name
                    nextLevelName = nextLevel.name || `Level ${nextLevel.ordinal + 1}`;
                    
                    const nextLevelExp = this.getLevelExperienceRequirement(nextLevel);
                    
                    if (nextLevelExp > 0) {
                        // If next level has experience requirement, calculate progress
                        experienceToNext = nextLevelExp - currentExperience;
                        pointsForNextLevel = nextLevelExp;
                        pointsDelta = experienceToNext;
                        
                        // Calculate progress percentage from 0 to next level requirement
                        experiencePercentage = Math.round((currentExperience / nextLevelExp) * 100);
                        experiencePercentage = Math.max(0, Math.min(100, experiencePercentage));
                        
                        // Also calculate progress within the current level if we have current level data
                        const currentLevelData = sortedLevels.find(level => (level.ordinal || 0) + 1 === currentLevel);
                        if (currentLevelData) {
                            const currentLevelExp = this.getLevelExperienceRequirement(currentLevelData);
                            
                            if (currentLevelExp > 0) {
                                // If current level has a requirement, calculate progress within the level
                                const levelRange = nextLevelExp - currentLevelExp;
                                const playerProgress = currentExperience - currentLevelExp;
                                
                                if (levelRange > 0) {
                                    const levelProgress = Math.round((playerProgress / levelRange) * 100);
                                }
                            }
                        }
                    } else {
                        // Next level has no experience requirement, assume linear progression
                        experienceToNext = 100; // Default increment
                        pointsForNextLevel = currentExperience + experienceToNext;
                        pointsDelta = experienceToNext;
                        experiencePercentage = 0; // Reset to 0 for new level
                    }
                } else {
                    // Player is at max level
                    experienceToNext = 0;
                    experiencePercentage = 100;
                    pointsForNextLevel = currentExperience;
                    pointsDelta = 0;
                }
            } else {
                // Use default progression if no levels data
                experienceToNext = 100;
                pointsForNextLevel = currentExperience + experienceToNext;
                pointsDelta = experienceToNext;
                experiencePercentage = 0;
            }
            
            // If we have player levels data, use it to override calculations
            if (playerLevelsData && typeof playerLevelsData === 'object') {
                
                if (playerLevelsData.currentLevel !== undefined) {
                    currentLevel = playerLevelsData.currentLevel;
                }
                if (playerLevelsData.experience !== undefined) {
                    currentExperience = playerLevelsData.experience;
                }
                if (playerLevelsData.experienceToNext !== undefined) {
                    experienceToNext = playerLevelsData.experienceToNext;
                    pointsDelta = experienceToNext;
                }
                if (playerLevelsData.progress !== undefined) {
                    experiencePercentage = playerLevelsData.progress;
                }
                if (playerLevelsData.levelName) {
                    levelName = playerLevelsData.levelName;
                }
                if (playerLevelsData.levelDescription) {
                    levelDescription = playerLevelsData.levelDescription;
                }
                if (playerLevelsData.pointsForNextLevel !== undefined) {
                    pointsForNextLevel = playerLevelsData.pointsForNextLevel;
                }
            }
            
            const result = {
                currentLevel,
                currentExperience,
                experienceToNext,
                experiencePercentage,
                name: levelName,
                description: levelDescription,
                pointsForNextLevel,
                pointsDelta,
                nextLevelName: nextLevelName // Store the next level name
            };
            
            return result
            
        } catch (error) {
            console.error('[Profile Component] Error calculating level info:', error);
            // Return default values on error
            return this.getDefaultLevelInfo();
        }
    }

    getDefaultLevelInfo() {
        return {
            currentLevel: 1,
            currentExperience: 0,
            experienceToNext: 0,
            experiencePercentage: 0,
            name: 'Unknown',
            description: 'Unknown',
            pointsForNextLevel: 0,
            pointsDelta: 0
        };
    }

    getNextLevelName() {
        // If we have the next level data, return its name
        if (this.data && this.data.levelInfo && this.data.levelInfo.nextLevelName) {
            return this.data.levelInfo.nextLevelName;
        }
        
        // Fallback to showing the next level number
        if (this.data && this.data.level && this.data.level.ordinal !== undefined) {
            return `Level ${this.data.level.ordinal + 2}`; // +2 because ordinal is 0-based and we want next level
        }
        
        // Final fallback
        return 'Next Level';
    }

    processAchievementsData(achievementsData) {
        // Check if we have achievements data with the expected structure
        if (!achievementsData || !achievementsData.achievements) {
            return [];
        }

        let allAchievements = [];
        
        // Add completed achievements
        if (achievementsData.achievements.completed && Array.isArray(achievementsData.achievements.completed)) {
            const completedAchievements = achievementsData.achievements.completed.map(achievement => ({
                ...achievement,
                status: 'Completed'
            }));
            allAchievements = allAchievements.concat(completedAchievements);
        }
        
        // Add started/in-progress achievements
        if (achievementsData.achievements.started && Array.isArray(achievementsData.achievements.started)) {
            const startedAchievements = achievementsData.achievements.started.map(achievement => ({
                ...achievement,
                status: 'Started'
            }));
            allAchievements = allAchievements.concat(startedAchievements);
        }
        
        // Add in-progress achievements (alternative field name)
        if (achievementsData.achievements.inProgress && Array.isArray(achievementsData.achievements.inProgress)) {
            const inProgressAchievements = achievementsData.achievements.inProgress.map(achievement => ({
                ...achievement,
                status: 'In Progress'
            }));
            allAchievements = allAchievements.concat(inProgressAchievements);
        }
        
        // Take the first 5 achievements and format them for display
        const processed = allAchievements.slice(0, 5).map(achievement => {
            
            // Extract progress information for all achievements (both in-progress and completed)
            let progress = null;
            if (achievement.steps && achievement.steps > 0) {
                // Use GameLayer API field names: 'steps' for required, 'count' for current progress
                progress = {
                    current: achievement.count || 0,
                    total: achievement.steps || 1,
                    percentage: 0,
                    isCompleted: achievement.status && achievement.status.toLowerCase() === 'completed'
                };
                
                // Calculate percentage
                if (progress.total > 0) {
                    progress.percentage = Math.min(Math.round((progress.current / progress.total) * 100), 100);
                }
                
            }
            
            return {
                id: achievement.id || achievement.achievementId || 'unknown',
                imgUrl: achievement.imgUrl || achievement.image || achievement.icon || achievement.thumbnail || null,
                name: achievement.name || achievement.title || achievement.description || 'Unknown Achievement',
                description: achievement.description || achievement.desc || 'No description available',
                points: achievement.points || achievement.pointsReward || 0,
                credits: achievement.credits || achievement.creditsReward || 0,
                category: achievement.category || achievement.type || achievement.categoryName || null,
                status: achievement.status || achievement.state || achievement.completionStatus || 'Completed',
                progress: progress
            };
        });
        
        return processed;
    }

    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    ${this.data.imgUrl ? 
                        `<img src="${this.data.imgUrl}" alt="${this.data.name}" class="profile-avatar__image">` :
                        `<div class="profile-avatar__placeholder">${this.data.name.charAt(0).toUpperCase()}</div>`
                    }
                </div>
                <div class="profile-info">
                    <h3 class="profile-name">${this.data.name}</h3>
                    <div class="profile-level">
                        <span class="profile-level__badge">${this.data.levelInfo.name}</span>
                    </div>
                    <div class="profile-stats-header">
                        <div class="profile-stat-header">
                            <span class="profile-stat-header__icon">⭐</span>
                            <span class="profile-stat-header__value">${this.data.points}</span>
                        </div>
                        <div class="profile-stat-header">
                            <span class="profile-stat-header__icon">💎</span>
                            <span class="profile-stat-header__value">${this.data.credits}</span>
                        </div>
                    </div>
                    <div class="profile-progress">
                        <div class="profile-progress__bar">
                            <div class="profile-progress__fill" style="width: ${this.data.experiencePercentage}%"></div>
                        </div>
                        <div class="profile-progress__info">
                            <span class="profile-progress__label">Next Level: ${this.getNextLevelName()}</span>
                            <span class="profile-progress__value">${this.data.experience} / ${this.data.pointsForNextLevel}</span>
                        </div>
                    </div>
                </div>
            </div>
            

            
            <div class="profile-achievements">
                <h4 class="profile-achievements__title">Recent Achievements</h4>
                <div class="profile-achievements__grid">
                    ${this.data.recentAchievements.map(achievement => {
                        const isCompleted = achievement.status && achievement.status.toLowerCase() === 'completed';
                        const imageOpacity = isCompleted ? '1' : '0.3';
                        return `
                        <div class="profile-achievement" data-achievement-id="${achievement.id}">
                            <div class="profile-achievement__image" style="opacity: ${imageOpacity};">
                                ${achievement.imgUrl ? 
                                    `<img src="${achievement.imgUrl}?t=${Date.now()}" alt="${achievement.name}" class="profile-achievement__img">` :
                                    ''
                                }
                                ${achievement.category && achievement.category !== 'Achievement' ? 
                                    `<div class="profile-achievement__category-badge">${achievement.category}</div>` :
                                    ''
                                }
                                ${achievement.status ? 
                                    `<div class="profile-achievement__status-badge">${achievement.status}</div>` :
                                    ''
                                }
                            </div>
                            <div class="profile-achievement__content">
                                <div class="profile-achievement__name">${achievement.name}</div>
                                <div class="profile-achievement__description">${achievement.description}</div>
                                ${achievement.progress ? `
                                    <div class="profile-achievement__progress">
                                        <div class="profile-achievement__progress-bar">
                                            <div class="profile-achievement__progress-fill ${achievement.progress.isCompleted ? 'profile-achievement__progress-fill--completed' : ''}" style="width: ${achievement.progress.percentage}%"></div>
                                        </div>
                                        <div class="profile-achievement__progress-text">
                                            ${achievement.progress.current} / ${achievement.progress.total} steps
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                    }).join('')}
                </div>
            </div>
        `;
        
        this.addEventListeners();
    }



    addEventListeners() {
        const achievements = this.container.querySelectorAll('.profile-achievement');
        achievements.forEach(achievement => {
            achievement.addEventListener('click', () => {
                const achievementId = achievement.dataset.achievementId;
                this.onAchievementClick(achievementId);
            });
        });
    }

    onAchievementClick(achievementId) {
        this.emit('achievement:clicked', { achievementId });
    }

    renderError(message) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="profile-error">
                <div class="profile-error__icon">⚠️</div>
                <h3 class="profile-error__title">Error Loading Profile</h3>
                <p class="profile-error__message">${message}</p>
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
