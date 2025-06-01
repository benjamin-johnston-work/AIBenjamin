import { eventBus } from '../core/EventBus.js';
import { Config } from '../utils/Config.js';

/**
 * AchievementSystem - Tracks player accomplishments and triggers celebrations
 */
export class AchievementSystem {
    constructor() {
        this.unlockedAchievements = new Set();
        this.progressTracking = new Map();
        this.notificationQueue = [];
        this.sessionStats = this.initializeSessionStats();
        this.levelStats = this.initializeLevelStats();
        
        this.setupEventListeners();
        this.initializeProgressTracking();
    }
    
    initializeSessionStats() {
        return {
            levelsCompleted: 0,
            totalScore: 0,
            maxCombo: 0,
            bossesDefeated: 0,
            powerUpsUsed: new Set(),
            chainExplosions: 0,
            perfectLevels: 0,
            fastestLevel: Infinity
        };
    }
    
    initializeLevelStats() {
        return {
            startTime: Date.now(),
            ballsLost: 0,
            powerUpsUsed: new Set(),
            chainExplosions: 0,
            maxCombo: 0,
            bricksDestroyed: 0
        };
    }
    
    initializeProgressTracking() {
        // Initialize progress for incremental achievements
        this.progressTracking.set('combo_master', { current: 0, target: 15 });
        this.progressTracking.set('chain_master', { current: 0, target: 5 });
        this.progressTracking.set('power_collector', { current: 0, target: 4 });
        this.progressTracking.set('boss_slayer', { current: 0, target: 1 });
    }
    
    setupEventListeners() {
        eventBus.on('level:started', () => this.onLevelStarted());
        eventBus.on('level:completed', (data) => this.onLevelCompleted(data));
        eventBus.on('ball:lost', () => this.onBallLost());
        eventBus.on('combo:hit', (data) => this.onComboHit(data));
        eventBus.on('chain:reaction', (data) => this.onChainReaction(data));
        eventBus.on('powerup:activated', (data) => this.onPowerUpActivated(data));
        eventBus.on('boss:defeated', (data) => this.onBossDefeated(data));
        eventBus.on('brick:destroyed', (data) => this.onBrickDestroyed(data));
        eventBus.on('score:updated', (data) => this.onScoreUpdated(data));
        eventBus.on('game:reset', () => this.reset());
    }
    
    update(deltaTime) {
        this.processNotificationQueue(deltaTime);
    }
    
    onLevelStarted() {
        this.levelStats = this.initializeLevelStats();
    }
    
    onLevelCompleted(data) {
        const levelTime = Date.now() - this.levelStats.startTime;
        this.sessionStats.levelsCompleted++;
        
        // Check for perfectionist achievement
        if (this.levelStats.ballsLost === 0) {
            this.sessionStats.perfectLevels++;
            this.unlockAchievement('perfectionist');
        }
        
        // Check for speedrun achievement
        if (levelTime < 60000) { // Under 60 seconds
            this.sessionStats.fastestLevel = Math.min(this.sessionStats.fastestLevel, levelTime);
            this.unlockAchievement('speedrun');
        }
        
        // Check for power collector achievement
        if (this.levelStats.powerUpsUsed.size >= 4) {
            this.unlockAchievement('power_collector');
        }
    }
    
    onBallLost() {
        this.levelStats.ballsLost++;
    }
    
    onComboHit(data) {
        this.levelStats.maxCombo = Math.max(this.levelStats.maxCombo, data.combo);
        this.sessionStats.maxCombo = Math.max(this.sessionStats.maxCombo, data.combo);
        
        // Update combo master progress
        const progress = this.progressTracking.get('combo_master');
        progress.current = Math.max(progress.current, data.combo);
        
        if (data.combo >= 15) {
            this.unlockAchievement('combo_master');
        }
    }
    
    onChainReaction(data) {
        this.levelStats.chainExplosions++;
        this.sessionStats.chainExplosions++;
        
        // Update chain master progress
        const progress = this.progressTracking.get('chain_master');
        progress.current = this.sessionStats.chainExplosions;
        
        if (this.sessionStats.chainExplosions >= 5) {
            this.unlockAchievement('chain_master');
        }
    }
    
    onPowerUpActivated(data) {
        this.levelStats.powerUpsUsed.add(data.type);
        this.sessionStats.powerUpsUsed.add(data.type);
        
        // Update power collector progress
        const progress = this.progressTracking.get('power_collector');
        progress.current = this.levelStats.powerUpsUsed.size;
    }
    
    onBossDefeated(data) {
        this.sessionStats.bossesDefeated++;
        this.unlockAchievement('boss_slayer');
    }
    
    onBrickDestroyed(data) {
        this.levelStats.bricksDestroyed++;
    }
    
    onScoreUpdated(data) {
        this.sessionStats.totalScore = data.score;
    }
    
    unlockAchievement(achievementId) {
        if (this.unlockedAchievements.has(achievementId)) {
            return; // Already unlocked
        }
        
        const achievement = Config.ACHIEVEMENTS[achievementId.toUpperCase()];
        if (!achievement) {
            console.warn(`Achievement not found: ${achievementId}`);
            return;
        }
        
        this.unlockedAchievements.add(achievementId);
        this.queueNotification(achievement);
        this.triggerCelebration(achievement);
        
        eventBus.emit('achievement:unlocked', {
            achievement: achievement,
            totalUnlocked: this.unlockedAchievements.size
        });
    }
    
    queueNotification(achievement) {
        this.notificationQueue.push({
            achievement: achievement,
            timeRemaining: 4000, // 4 seconds
            phase: 'entering'
        });
    }
    
    processNotificationQueue(deltaTime) {
        for (let i = this.notificationQueue.length - 1; i >= 0; i--) {
            const notification = this.notificationQueue[i];
            notification.timeRemaining -= deltaTime;
            
            if (notification.timeRemaining <= 0) {
                this.notificationQueue.splice(i, 1);
            }
        }
    }
    
    triggerCelebration(achievement) {
        // Create confetti explosion
        this.createConfettiExplosion(achievement);
        
        // Show achievement banner
        this.showAchievementBanner(achievement);
        
        // Screen effects
        eventBus.emit('effects:screenShake', { intensity: 6 });
        eventBus.emit('effects:colorFlash', {
            color: achievement.color,
            intensity: 0.3
        });
        
        // Achievement fanfare particles
        this.createFanfareParticles(achievement);
    }
    
    createConfettiExplosion(achievement) {
        const centerX = 400; // Canvas center
        const centerY = 300;
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.1 + Math.random() * 0.3;
            const size = 2 + Math.random() * 4;
            
            eventBus.emit('particle:create', {
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.1, // Slight upward bias
                life: 2000 + Math.random() * 1000,
                size: size,
                color: this.getConfettiColor(achievement),
                gravity: 0.0002,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.01
            });
        }
    }
    
    createFanfareParticles(achievement) {
        const centerX = 400;
        const centerY = 300;
        const fanfareCount = 30;
        
        // Create radiating particles
        for (let i = 0; i < fanfareCount; i++) {
            const angle = (i / fanfareCount) * Math.PI * 2;
            const speed = 0.15 + Math.random() * 0.1;
            
            eventBus.emit('particle:create', {
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1500,
                size: 3 + Math.random() * 2,
                color: achievement.color,
                gravity: 0,
                alpha: 1,
                decay: 0.998
            });
        }
        
        // Create star burst effect
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            
            eventBus.emit('particle:create', {
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                vx: Math.cos(angle) * 0.05,
                vy: Math.sin(angle) * 0.05,
                life: 2000,
                size: 4,
                color: '#FFFFFF',
                gravity: 0
            });
        }
    }
    
    showAchievementBanner(achievement) {
        eventBus.emit('ui:showAchievementBanner', {
            achievement: achievement,
            duration: 4000
        });
    }
    
    getConfettiColor(achievement) {
        const colors = [
            achievement.color,
            '#FFD700', // Gold
            '#FF6B6B', // Red
            '#4ECDC4', // Teal
            '#45B7D1', // Blue
            '#96CEB4', // Green
            '#FFEAA7', // Yellow
            '#DDA0DD'  // Plum
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Public API methods
    getUnlockedAchievements() {
        return Array.from(this.unlockedAchievements);
    }
    
    getAchievementProgress(achievementId) {
        return this.progressTracking.get(achievementId) || { current: 0, target: 1 };
    }
    
    getAllAchievements() {
        const achievements = [];
        
        for (const [key, achievement] of Object.entries(Config.ACHIEVEMENTS)) {
            const id = achievement.id;
            const isUnlocked = this.unlockedAchievements.has(id);
            const progress = this.getAchievementProgress(id);
            
            achievements.push({
                ...achievement,
                unlocked: isUnlocked,
                progress: progress
            });
        }
        
        return achievements;
    }
    
    getSessionStats() {
        return { ...this.sessionStats };
    }
    
    getLevelStats() {
        return { ...this.levelStats };
    }
    
    getNotifications() {
        return [...this.notificationQueue];
    }
    
    // Render achievement notifications
    renderNotifications(ctx) {
        if (this.notificationQueue.length === 0) return;
        
        ctx.save();
        
        for (let i = 0; i < this.notificationQueue.length; i++) {
            const notification = this.notificationQueue[i];
            this.renderAchievementNotification(ctx, notification, i);
        }
        
        ctx.restore();
    }
    
    renderAchievementNotification(ctx, notification, index) {
        const achievement = notification.achievement;
        const y = 50 + index * 80;
        const x = 400; // Center of screen
        const width = 300;
        const height = 60;
        
        // Calculate animation progress
        const totalTime = 4000;
        const progress = 1 - (notification.timeRemaining / totalTime);
        let alpha = 1;
        let scale = 1;
        
        if (progress < 0.2) {
            // Entering animation
            scale = 0.5 + (progress / 0.2) * 0.5;
            alpha = progress / 0.2;
        } else if (progress > 0.8) {
            // Exiting animation
            const exitProgress = (progress - 0.8) / 0.2;
            alpha = 1 - exitProgress;
            scale = 1 - exitProgress * 0.3;
        }
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(-width/2, -height/2, width, height);
        
        // Border with achievement color
        ctx.strokeStyle = achievement.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(-width/2, -height/2, width, height);
        
        // Achievement icon
        ctx.fillStyle = achievement.color;
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(achievement.icon, -width/2 + 30, 0);
        
        // Achievement text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('ACHIEVEMENT UNLOCKED!', 0, -15);
        
        ctx.font = '14px Arial';
        ctx.fillText(achievement.name, 0, 5);
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#CCCCCC';
        ctx.fillText(achievement.description, 0, 20);
        
        // Rarity indicator
        ctx.fillStyle = this.getRarityColor(achievement.rarity);
        ctx.font = 'bold 10px Arial';
        ctx.fillText(achievement.rarity.toUpperCase(), width/2 - 40, -height/2 + 15);
        
        ctx.restore();
    }
    
    getRarityColor(rarity) {
        const colors = {
            'common': '#FFFFFF',
            'uncommon': '#00FF00',
            'rare': '#0080FF',
            'epic': '#8000FF',
            'legendary': '#FF8000'
        };
        return colors[rarity] || '#FFFFFF';
    }
    
    reset() {
        // Don't reset unlocked achievements - they persist across games
        this.sessionStats = this.initializeSessionStats();
        this.levelStats = this.initializeLevelStats();
        this.notificationQueue = [];
        this.initializeProgressTracking();
    }
    
    getDebugInfo() {
        return {
            unlockedCount: this.unlockedAchievements.size,
            totalAchievements: Object.keys(Config.ACHIEVEMENTS).length,
            notifications: this.notificationQueue.length,
            sessionStats: this.sessionStats,
            levelStats: this.levelStats,
            progress: Object.fromEntries(this.progressTracking)
        };
    }
}
