/**
 * AI System for performance analysis and adaptive assistance
 */
import { Config } from '../utils/Config.js';
import { eventBus, GameEvents } from '../core/EventBus.js';

export class AISystem {
    constructor(entityManager) {
        this.entityManager = entityManager;
        
        // Performance metrics
        this.metrics = {
            ballsLost: 0,
            bricksHit: 0,
            totalBallBounces: 0,
            paddleHits: 0,
            paddleMisses: 0,
            timeSpentOnLevel: 0,
            consecutiveDeaths: 0,
            gameStartTime: Date.now(),
            levelStartTime: Date.now(),
            lastPerformanceCheck: Date.now()
        };
        
        // AI state
        this.assistanceLevel = Config.AI.ASSISTANCE_LEVELS.NONE;
        this.analysisInterval = Config.AI.ANALYSIS_INTERVAL;
        this.isActive = true;
        
        // Performance history for trend analysis
        this.performanceHistory = [];
        this.maxHistoryLength = 10;
        
        this.setupEventListeners();
    }

    /**
     * Set up event listeners for tracking player performance
     */
    setupEventListeners() {
        // Ball events
        eventBus.on(GameEvents.BALL_LOST, this.onBallLost.bind(this));
        eventBus.on(GameEvents.BALL_PADDLE_HIT, this.onBallPaddleHit.bind(this));
        eventBus.on(GameEvents.BALL_WALL_HIT, this.onBallWallHit.bind(this));
        
        // Brick events
        eventBus.on(GameEvents.BRICK_HIT, this.onBrickHit.bind(this));
        
        // Game events
        eventBus.on(GameEvents.LIFE_LOST, this.onLifeLost.bind(this));
        eventBus.on(GameEvents.LEVEL_START, this.onLevelStart.bind(this));
        eventBus.on(GameEvents.GAME_START, this.onGameStart.bind(this));
        eventBus.on(GameEvents.GAME_RESTART, this.onGameRestart.bind(this));
    }

    /**
     * Update AI system
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.updateTimeMetrics(deltaTime);
        this.checkPerformanceAnalysis();
        this.applyAIAssistance();
    }

    /**
     * Update time-based metrics
     * @param {number} deltaTime - Time since last update
     */
    updateTimeMetrics(deltaTime) {
        this.metrics.timeSpentOnLevel += deltaTime;
    }

    /**
     * Check if it's time to analyze performance
     */
    checkPerformanceAnalysis() {
        const currentTime = Date.now();
        const timeSinceLastCheck = currentTime - this.metrics.lastPerformanceCheck;
        
        if (timeSinceLastCheck >= this.analysisInterval) {
            this.analyzePerformance();
            this.metrics.lastPerformanceCheck = currentTime;
        }
    }

    /**
     * Analyze player performance and adjust assistance level
     */
    analyzePerformance() {
        const analysis = this.calculatePerformanceMetrics();
        
        // Store performance snapshot
        this.performanceHistory.push({
            timestamp: Date.now(),
            ...analysis
        });
        
        // Limit history length
        if (this.performanceHistory.length > this.maxHistoryLength) {
            this.performanceHistory.shift();
        }
        
        // Determine new assistance level
        const newAssistanceLevel = this.determineAssistanceLevel(analysis);
        
        if (newAssistanceLevel !== this.assistanceLevel) {
            this.setAssistanceLevel(newAssistanceLevel);
        }
        
        // Emit analysis event
        eventBus.emit(GameEvents.AI_PERFORMANCE_ANALYZED, {
            metrics: analysis,
            assistanceLevel: this.assistanceLevel,
            trend: this.getPerformanceTrend()
        });
    }

    /**
     * Calculate current performance metrics
     * @returns {Object} Performance analysis
     */
    calculatePerformanceMetrics() {
        const totalAttempts = this.metrics.paddleHits + this.metrics.paddleMisses;
        const accuracy = totalAttempts > 0 ? this.metrics.paddleHits / totalAttempts : 0;
        const brickHitRate = this.metrics.totalBallBounces > 0 ? 
            this.metrics.bricksHit / this.metrics.totalBallBounces : 0;
        
        const timeInSeconds = this.metrics.timeSpentOnLevel / 1000;
        const ballLossRate = timeInSeconds > 0 ? this.metrics.ballsLost / timeInSeconds : 0;
        
        return {
            accuracy: accuracy,
            brickHitRate: brickHitRate,
            ballLossRate: ballLossRate,
            consecutiveDeaths: this.metrics.consecutiveDeaths,
            totalBounces: this.metrics.totalBallBounces,
            bricksHit: this.metrics.bricksHit,
            ballsLost: this.metrics.ballsLost,
            timeSpent: timeInSeconds
        };
    }

    /**
     * Determine appropriate assistance level based on performance
     * @param {Object} analysis - Performance analysis
     * @returns {number} Assistance level (0-2)
     */
    determineAssistanceLevel(analysis) {
        const thresholds = Config.AI.THRESHOLDS;
        
        // Check for active assistance conditions (struggling player)
        if (analysis.accuracy < thresholds.POOR_ACCURACY || 
            analysis.consecutiveDeaths > thresholds.MAX_CONSECUTIVE_DEATHS) {
            return Config.AI.ASSISTANCE_LEVELS.ACTIVE;
        }
        
        // Check for subtle assistance conditions (needs some help)
        if (analysis.accuracy < thresholds.FAIR_ACCURACY || 
            analysis.brickHitRate < thresholds.POOR_BRICK_HIT_RATE ||
            analysis.ballLossRate > 0.5) {
            return Config.AI.ASSISTANCE_LEVELS.SUBTLE;
        }
        
        // No assistance needed (skilled player)
        return Config.AI.ASSISTANCE_LEVELS.NONE;
    }

    /**
     * Set assistance level and notify systems
     * @param {number} level - New assistance level
     */
    setAssistanceLevel(level) {
        const oldLevel = this.assistanceLevel;
        this.assistanceLevel = level;
        
        // Notify collision system
        const collisionSystem = this.getCollisionSystem();
        if (collisionSystem) {
            collisionSystem.setAIAssistanceLevel(level);
        }
        
        eventBus.emit(GameEvents.AI_ASSISTANCE_CHANGED, {
            oldLevel: oldLevel,
            newLevel: level,
            levelName: this.getAssistanceLevelName(level)
        });
    }

    /**
     * Apply AI assistance to game entities
     */
    applyAIAssistance() {
        if (this.assistanceLevel === Config.AI.ASSISTANCE_LEVELS.NONE) return;
        
        const balls = this.entityManager.getEntitiesByType('Ball');
        const bricks = this.entityManager.getEntitiesByType('Brick');
        
        balls.forEach(ball => {
            if (ball.onPaddle) return;
            
            if (this.assistanceLevel === Config.AI.ASSISTANCE_LEVELS.ACTIVE) {
                this.applyActiveBallAssistance(ball, bricks);
            }
        });
    }

    /**
     * Apply active assistance to ball movement
     * @param {Ball} ball - Ball to assist
     * @param {Array} bricks - Available bricks
     */
    applyActiveBallAssistance(ball, bricks) {
        // Find target brick
        const visibleBricks = bricks.filter(brick => brick.visible);
        if (visibleBricks.length === 0) return;
        
        // Target the closest brick
        const targetBrick = this.findClosestBrick(ball, visibleBricks);
        if (!targetBrick) return;
        
        const targetCenter = targetBrick.getCenter();
        
        // Apply nudging force toward target
        ball.applyAINudge(targetCenter.x);
        
        // Apply speed reduction for better control
        ball.applySpeedReduction();
    }

    /**
     * Find the closest brick to the ball
     * @param {Ball} ball - Ball entity
     * @param {Array} bricks - Array of visible bricks
     * @returns {Brick|null} Closest brick or null
     */
    findClosestBrick(ball, bricks) {
        let closest = null;
        let closestDistance = Infinity;
        
        bricks.forEach(brick => {
            const distance = ball.distanceTo(brick);
            if (distance < closestDistance) {
                closestDistance = distance;
                closest = brick;
            }
        });
        
        return closest;
    }

    /**
     * Get performance trend from history
     * @returns {string} Trend description
     */
    getPerformanceTrend() {
        if (this.performanceHistory.length < 3) return 'insufficient_data';
        
        const recent = this.performanceHistory.slice(-3);
        const accuracyTrend = this.calculateTrend(recent.map(h => h.accuracy));
        const brickHitTrend = this.calculateTrend(recent.map(h => h.brickHitRate));
        
        if (accuracyTrend > 0.1 && brickHitTrend > 0.1) return 'improving';
        if (accuracyTrend < -0.1 && brickHitTrend < -0.1) return 'declining';
        return 'stable';
    }

    /**
     * Calculate trend from array of values
     * @param {Array<number>} values - Array of values
     * @returns {number} Trend value (positive = improving, negative = declining)
     */
    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        const first = values[0];
        const last = values[values.length - 1];
        
        return last - first;
    }

    /**
     * Get assistance level name
     * @param {number} level - Assistance level
     * @returns {string} Level name
     */
    getAssistanceLevelName(level) {
        switch (level) {
            case Config.AI.ASSISTANCE_LEVELS.NONE: return 'None';
            case Config.AI.ASSISTANCE_LEVELS.SUBTLE: return 'Subtle';
            case Config.AI.ASSISTANCE_LEVELS.ACTIVE: return 'Active';
            default: return 'Unknown';
        }
    }

    /**
     * Get collision system reference
     * @returns {CollisionSystem|null} Collision system or null
     */
    getCollisionSystem() {
        // This would be injected or accessed through a game manager
        // For now, return null - the collision system will be set up separately
        return null;
    }

    // Event handlers
    onBallLost(data) {
        this.metrics.ballsLost++;
        this.metrics.paddleMisses++;
    }

    onBallPaddleHit(data) {
        this.metrics.paddleHits++;
        this.metrics.totalBallBounces++;
        
        // Reset consecutive deaths on successful paddle hit
        this.metrics.consecutiveDeaths = 0;
    }

    onBallWallHit(data) {
        this.metrics.totalBallBounces++;
    }

    onBrickHit(data) {
        this.metrics.bricksHit++;
    }

    onLifeLost(data) {
        this.metrics.consecutiveDeaths++;
    }

    onLevelStart(data) {
        this.metrics.levelStartTime = Date.now();
        this.metrics.timeSpentOnLevel = 0;
        this.metrics.consecutiveDeaths = 0;
    }

    onGameStart(data) {
        this.metrics.gameStartTime = Date.now();
        this.resetMetrics();
    }

    onGameRestart(data) {
        this.resetMetrics();
        this.performanceHistory = [];
        this.setAssistanceLevel(Config.AI.ASSISTANCE_LEVELS.NONE);
    }

    /**
     * Reset performance metrics
     */
    resetMetrics() {
        this.metrics = {
            ballsLost: 0,
            bricksHit: 0,
            totalBallBounces: 0,
            paddleHits: 0,
            paddleMisses: 0,
            timeSpentOnLevel: 0,
            consecutiveDeaths: 0,
            gameStartTime: Date.now(),
            levelStartTime: Date.now(),
            lastPerformanceCheck: Date.now()
        };
    }

    /**
     * Get current metrics
     * @returns {Object} Current performance metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }

    /**
     * Get current assistance level
     * @returns {number} Current assistance level
     */
    getAssistanceLevel() {
        return this.assistanceLevel;
    }

    /**
     * Get performance history
     * @returns {Array} Performance history
     */
    getPerformanceHistory() {
        return [...this.performanceHistory];
    }

    /**
     * Enable or disable AI system
     * @param {boolean} active - Whether AI should be active
     */
    setActive(active) {
        this.isActive = active;
        if (!active) {
            this.setAssistanceLevel(Config.AI.ASSISTANCE_LEVELS.NONE);
        }
    }

    /**
     * Force a performance analysis
     */
    forceAnalysis() {
        this.analyzePerformance();
    }

    /**
     * Get debug information
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        return {
            isActive: this.isActive,
            assistanceLevel: this.assistanceLevel,
            assistanceLevelName: this.getAssistanceLevelName(this.assistanceLevel),
            metrics: this.getMetrics(),
            performanceHistory: this.performanceHistory.length,
            trend: this.getPerformanceTrend(),
            lastAnalysis: this.metrics.lastPerformanceCheck,
            nextAnalysis: this.metrics.lastPerformanceCheck + this.analysisInterval
        };
    }

    /**
     * Cleanup event listeners
     */
    destroy() {
        eventBus.off(GameEvents.BALL_LOST, this.onBallLost.bind(this));
        eventBus.off(GameEvents.BALL_PADDLE_HIT, this.onBallPaddleHit.bind(this));
        eventBus.off(GameEvents.BALL_WALL_HIT, this.onBallWallHit.bind(this));
        eventBus.off(GameEvents.BRICK_HIT, this.onBrickHit.bind(this));
        eventBus.off(GameEvents.LIFE_LOST, this.onLifeLost.bind(this));
        eventBus.off(GameEvents.LEVEL_START, this.onLevelStart.bind(this));
        eventBus.off(GameEvents.GAME_START, this.onGameStart.bind(this));
        eventBus.off(GameEvents.GAME_RESTART, this.onGameRestart.bind(this));
    }
}
