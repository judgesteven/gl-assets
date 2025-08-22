/**
 * GameLayer Demo App - Shared Utilities
 * 
 * This utility class provides common functions and helpers used across all components:
 * - Time and date formatting utilities
 * - Number formatting and progress calculations
 * - UI state management helpers
 * - Loading and error display utilities
 * 
 * @version 1.0.0
 * @author GameLayer Assets
 * @license MIT
 */

// Time constants for better readability
const TIME_CONSTANTS = {
    MILLISECONDS_PER_SECOND: 1000,
    SECONDS_PER_MINUTE: 60,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    MILLISECONDS_PER_DAY: 1000 * 60 * 60 * 24,
    MILLISECONDS_PER_HOUR: 1000 * 60 * 60,
    MILLISECONDS_PER_MINUTE: 1000 * 60
};

class Utils {
    // === TIME FORMATTING ===
    
    static formatTimeRemaining(endTime) {
        if (!endTime) return 'No time limit';
        
        const end = new Date(endTime);
        const now = new Date();
        const diff = end - now;
        
        if (diff <= 0) return 'Expired';
        
        const days = Math.floor(diff / TIME_CONSTANTS.MILLISECONDS_PER_DAY);
        const hours = Math.floor((diff % TIME_CONSTANTS.MILLISECONDS_PER_DAY) / TIME_CONSTANTS.MILLISECONDS_PER_HOUR);
        const minutes = Math.floor((diff % TIME_CONSTANTS.MILLISECONDS_PER_HOUR) / TIME_CONSTANTS.MILLISECONDS_PER_MINUTE);
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m`;
        return 'Less than 1m';
    }

    static formatDate(dateString) {
        if (!dateString) return 'Unknown';
        
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / TIME_CONSTANTS.MILLISECONDS_PER_DAY);
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // === NUMBER FORMATTING ===
    
    static formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    static formatPoints(points) {
        return `${points} ${points === 1 ? 'point' : 'points'}`;
    }

    static formatCredits(credits) {
        return `${credits} ${credits === 1 ? 'credit' : 'credits'}`;
    }

    // === PROGRESS CALCULATION ===
    
    static calculateProgress(current, total) {
        if (!total || total === 0) return 0;
        return Math.min(Math.max((current / total) * 100, 0), 100);
    }

    static getProgressColor(percentage) {
        if (percentage >= 80) return 'var(--gl-success)';
        if (percentage >= 60) return 'var(--gl-info)';
        if (percentage >= 40) return 'var(--gl-warning)';
        return 'var(--gl-danger)';
    }

    // === LEVEL CALCULATION ===
    
    static calculateLevel(experience, baseExp = 100, multiplier = 1.5) {
        if (experience < baseExp) return 1;
        
        let level = 1;
        let expNeeded = baseExp;
        let totalExp = experience;
        
        while (totalExp >= expNeeded) {
            totalExp -= expNeeded;
            level++;
            expNeeded = Math.floor(baseExp * Math.pow(multiplier, level - 1));
        }
        
        return level;
    }

    static getExperienceForLevel(level, baseExp = 100, multiplier = 1.5) {
        if (level <= 1) return 0;
        
        let totalExp = 0;
        for (let i = 1; i < level; i++) {
            totalExp += Math.floor(baseExp * Math.pow(multiplier, i - 1));
        }
        return totalExp;
    }

    // === LOGGING METHODS ===
    
    static log(message, ...args) {
        console.log(`[GameLayer] ${message}`, ...args);
    }

    static error(message, ...args) {
        console.error(`[GameLayer] ERROR: ${message}`, ...args);
    }

    static warn(message, ...args) {
        console.warn(`[GameLayer] WARNING: ${message}`, ...args);
    }

    static info(message, ...args) {
        console.info(`[GameLayer] INFO: ${message}`, ...args);
    }

    // === VALIDATION ===
    
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // === UI HELPERS ===
    
    static showLoading(element, text = 'Loading...') {
        if (!element) return;
        
        element.innerHTML = `
            <div class="gl-loading">
                <div class="gl-loading__spinner"></div>
                <div class="gl-loading__text">${text}</div>
            </div>
        `;
        element.classList.add('gl-loading--active');
    }

    static hideLoading(element) {
        if (!element) return;
        
        element.classList.remove('gl-loading--active');
        const loadingElement = element.querySelector('.gl-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    static showError(element, message) {
        if (!element) return;
        
        element.innerHTML = `
            <div class="gl-error">
                <div class="gl-error__icon">⚠️</div>
                <div class="gl-error__message">${message}</div>
            </div>
        `;
    }

    static showEmpty(element, message = 'No data available') {
        if (!element) return;
        
        element.innerHTML = `
            <div class="gl-empty">
                <div class="gl-empty__icon">📭</div>
                <div class="gl-empty__message">${message}</div>
            </div>
        `;
    }

    // === ANIMATION HELPERS ===
    
    static fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    static fadeOut(element, duration = 300) {
        if (!element) return;
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(1 - (progress / duration), 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }

    // === STORAGE HELPERS ===
    
    static setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    static getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Failed to read from localStorage:', error);
            return defaultValue;
        }
    }

    static removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
        }
    }

    // === DEBOUNCE ===
    
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // === THROTTLE ===
    
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

// Make Utils globally available for browser usage
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
