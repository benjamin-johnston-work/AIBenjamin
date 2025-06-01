import { eventBus } from '../core/EventBus.js';
import { Config } from '../utils/Config.js';

/**
 * ComboSystem - Manages progressive score multipliers and combo tracking
 * Creates addictive gameplay loops through escalating rewards
 */
export class ComboSystem {
    constructor() {
        this.currentCombo = 0;
        this.maxCombo = 0;
        this.multiplier = 1;
        this.lastHitTime = Date.now();
        this.comboBreakTimer = 0;
        this.isActive = false;
        
        // Visual effect tracking
        this.shakeIntensity = 0;
        this.flashColor = null;
        this.flashIntensity = 0;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        eventBus.on('brick:destroyed', (data) => this.onBrickDestroyed(data));
        eventBus.on('ball:lost', () => this.breakCombo());
        eventBus.on('paddle:missed', () => this.breakCombo());
        eventBus.on('game:reset', () => this.reset());
    }
    
    update(deltaTime) {
        this.updateComboTimer(deltaTime);
        this.updateVisualEffects(deltaTime);
    }
    
    updateComboTimer(deltaTime) {
        if (this.isActive && this.currentCombo > 0) {
            this.comboBreakTimer += deltaTime;
            
            if (this.comboBreakTimer >= Config.COMBO.BREAK_TIMEOUT) {
                this.breakCombo();
            }
        }
    }
    
    updateVisualEffects(deltaTime) {
        // Decay screen shake
        if (this.shakeIntensity > 0) {
            this.shakeIntensity = Math.max(0, this.shakeIntensity - deltaTime * 0.01);
        }
        
        // Decay flash effect
        if (this.flashIntensity > 0) {
            this.flashIntensity = Math.max(0, this.flashIntensity - deltaTime * 0.005);
        }
    }
    
    onBrickDestroyed(data) {
        this.currentCombo++;
        this.maxCombo = Math.max(this.maxCombo, this.currentCombo);
        this.lastHitTime = Date.now();
        this.comboBreakTimer = 0;
        this.isActive = true;
        
        // Calculate new multiplier
        const oldMultiplier = this.multiplier;
        this.multiplier = this.calculateMultiplier();
        
        // Trigger visual effects
        this.triggerComboEffects(oldMultiplier !== this.multiplier);
        
        // Emit combo events
        eventBus.emit('combo:hit', {
            combo: this.currentCombo,
            multiplier: this.multiplier,
            isNewTier: oldMultiplier !== this.multiplier
        });
        
        // Apply multiplier to score
        const bonusPoints = data.points * (this.multiplier - 1);
        if (bonusPoints > 0) {
            eventBus.emit('score:bonus', {
                points: bonusPoints,
                source: 'combo',
                multiplier: this.multiplier
            });
        }
    }
    
    calculateMultiplier() {
        const thresholds = Config.COMBO.MULTIPLIER_THRESHOLDS;
        const values = Config.COMBO.MULTIPLIER_VALUES;
        
        for (let i = thresholds.length - 1; i >= 0; i--) {
            if (this.currentCombo >= thresholds[i]) {
                return values[i + 1] || values[values.length - 1];
            }
        }
        
        return values[0];
    }
    
    triggerComboEffects(isNewTier) {
        // Screen shake intensity based on combo level
        const shakeIndex = Math.min(
            Math.floor(this.currentCombo / 5), 
            Config.COMBO.SCREEN_SHAKE_INTENSITY.length - 1
        );
        this.shakeIntensity = Config.COMBO.SCREEN_SHAKE_INTENSITY[shakeIndex];
        
        // Color flash for new tiers
        if (isNewTier) {
            this.flashColor = this.getComboColor();
            this.flashIntensity = 0.3;
        }
        
        // Emit visual effect events
        eventBus.emit('effects:screenShake', { intensity: this.shakeIntensity });
        
        if (this.flashColor) {
            eventBus.emit('effects:colorFlash', {
                color: this.flashColor,
                intensity: this.flashIntensity
            });
        }
        
        // Particle multiplier
        const particleIndex = Math.min(
            Math.floor(this.currentCombo / 3),
            Config.COMBO.PARTICLE_MULTIPLIER.length - 1
        );
        const particleMultiplier = Config.COMBO.PARTICLE_MULTIPLIER[particleIndex];
        
        eventBus.emit('effects:comboParticles', {
            combo: this.currentCombo,
            multiplier: particleMultiplier,
            position: { x: 400, y: 300 } // Center screen
        });
    }
    
    getComboColor() {
        if (this.multiplier >= 20) return '#FF0080'; // Hot pink for max
        if (this.multiplier >= 10) return '#FF4400'; // Red-orange for high
        if (this.multiplier >= 5) return '#FF8800';  // Orange for medium
        if (this.multiplier >= 3) return '#FFAA00';  // Yellow for low
        return '#00AA00'; // Green for starting
    }
    
    breakCombo() {
        if (this.currentCombo > 0) {
            eventBus.emit('combo:broken', {
                finalCombo: this.currentCombo,
                finalMultiplier: this.multiplier
            });
        }
        
        this.currentCombo = 0;
        this.multiplier = 1;
        this.comboBreakTimer = 0;
        this.isActive = false;
        this.shakeIntensity = 0;
        this.flashIntensity = 0;
    }
    
    reset() {
        this.currentCombo = 0;
        this.maxCombo = 0;
        this.multiplier = 1;
        this.lastHitTime = Date.now();
        this.comboBreakTimer = 0;
        this.isActive = false;
        this.shakeIntensity = 0;
        this.flashIntensity = 0;
    }
    
    // Getters for UI and other systems
    getCurrentCombo() {
        return this.currentCombo;
    }
    
    getMultiplier() {
        return this.multiplier;
    }
    
    getMaxCombo() {
        return this.maxCombo;
    }
    
    getShakeIntensity() {
        return this.shakeIntensity;
    }
    
    getFlashEffect() {
        return {
            color: this.flashColor,
            intensity: this.flashIntensity
        };
    }
    
    getDebugInfo() {
        return {
            currentCombo: this.currentCombo,
            maxCombo: this.maxCombo,
            multiplier: this.multiplier,
            isActive: this.isActive,
            timeUntilBreak: Math.max(0, Config.COMBO.BREAK_TIMEOUT - this.comboBreakTimer),
            shakeIntensity: this.shakeIntensity,
            flashIntensity: this.flashIntensity
        };
    }
}
