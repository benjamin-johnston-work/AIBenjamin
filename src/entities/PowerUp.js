/**
 * PowerUp Entity
 */
import { Entity } from '../core/Entity.js';
import { Config } from '../utils/Config.js';
import { MathUtils } from '../utils/MathUtils.js';
import { eventBus, GameEvents } from '../core/EventBus.js';

export class PowerUp extends Entity {
    constructor(x, y, powerUpType) {
        super(x, y);
        
        this.width = Config.POWERUPS.WIDTH;
        this.height = Config.POWERUPS.HEIGHT;
        this.fallSpeed = Config.POWERUPS.FALL_SPEED;
        
        // Power-up properties
        this.powerUpType = powerUpType.type;
        this.color = powerUpType.color;
        this.name = powerUpType.name;
        
        // Set initial velocity
        this.velocity.y = this.fallSpeed;
        
        // Visual effects
        this.glowIntensity = 0;
        this.glowDirection = 1;
        this.rotation = 0;
        this.rotationSpeed = MathUtils.random(1, 3);
        this.pulseScale = 1;
        this.pulseDirection = 1;
        
        // Animation properties
        this.bobOffset = MathUtils.random(0, Math.PI * 2);
        this.bobAmplitude = 2;
        this.bobSpeed = 3;
        
        this.addTag('powerup');
        this.addTag('collectible');
    }

    /**
     * Update power-up logic
     * @param {number} deltaTime - Time since last update
     */
    onUpdate(deltaTime) {
        this.updateMovement(deltaTime);
        this.updateVisualEffects(deltaTime);
        this.checkBounds();
    }

    /**
     * Update power-up movement
     * @param {number} deltaTime - Time since last update
     */
    updateMovement(deltaTime) {
        // Normalize movement to 60fps
        const normalizedDelta = deltaTime / 16.67;
        
        // Apply gravity/fall speed
        this.position.y += this.velocity.y * normalizedDelta;
        
        // Add subtle bobbing motion
        const time = Date.now() / 1000;
        const bobOffset = Math.sin(time * this.bobSpeed + this.bobOffset) * this.bobAmplitude;
        this.position.x += bobOffset * normalizedDelta * 0.1;
    }

    /**
     * Update visual effects
     * @param {number} deltaTime - Time since last update
     */
    updateVisualEffects(deltaTime) {
        const normalizedDelta = deltaTime / 16.67;
        
        // Glow effect animation
        this.glowIntensity += this.glowDirection * normalizedDelta * 0.05;
        if (this.glowIntensity >= 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0) {
            this.glowIntensity = 0;
            this.glowDirection = 1;
        }
        
        // Rotation animation
        this.rotation += this.rotationSpeed * normalizedDelta * 0.1;
        if (this.rotation >= Math.PI * 2) {
            this.rotation -= Math.PI * 2;
        }
        
        // Pulse scale animation
        this.pulseScale += this.pulseDirection * normalizedDelta * 0.02;
        if (this.pulseScale >= 1.2) {
            this.pulseScale = 1.2;
            this.pulseDirection = -1;
        } else if (this.pulseScale <= 0.8) {
            this.pulseScale = 0.8;
            this.pulseDirection = 1;
        }
    }

    /**
     * Check if power-up has fallen off screen
     */
    checkBounds() {
        if (this.position.y > Config.CANVAS.HEIGHT + this.height) {
            this.destroy();
        }
    }

    /**
     * Render the power-up
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    onRender(ctx) {
        ctx.save();

        // Apply transformations
        const centerX = this.position.x + this.width / 2;
        const centerY = this.position.y + this.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.scale(this.pulseScale, this.pulseScale);
        ctx.rotate(this.rotation);

        // Glow effect
        const glowAlpha = 0.3 + (this.glowIntensity * 0.4);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Main power-up body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Inner glow
        ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha * 0.5})`;
        ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height - 4);

        // Border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Power-up icon/symbol
        this.drawPowerUpIcon(ctx);

        ctx.restore();
    }

    /**
     * Draw power-up specific icon
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawPowerUpIcon(ctx) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let symbol = '';
        switch (this.powerUpType) {
            case 'widePaddle':
                symbol = '⟷';
                break;
            case 'multiBall':
                symbol = '●●';
                break;
            default:
                symbol = '?';
        }
        
        ctx.fillText(symbol, 0, 0);
    }

    /**
     * Handle collision with paddle
     * @param {Paddle} paddle - Paddle that collected this power-up
     */
    collect(paddle) {
        // Emit collection event
        eventBus.emit(GameEvents.POWERUP_COLLECTED, {
            powerUp: this,
            paddle: paddle,
            type: this.powerUpType
        });

        // Apply power-up effect
        this.applyEffect(paddle);

        // Destroy the power-up
        this.destroy();
    }

    /**
     * Apply power-up effect
     * @param {Paddle} paddle - Paddle to apply effect to
     */
    applyEffect(paddle) {
        switch (this.powerUpType) {
            case 'widePaddle':
                paddle.activateWidePaddle();
                break;
                
            case 'multiBall':
                this.createMultiBalls();
                break;
        }

        // Emit activation event
        eventBus.emit(GameEvents.POWERUP_ACTIVATED, {
            type: this.powerUpType,
            paddle: paddle
        });
    }

    /**
     * Create additional balls for multi-ball power-up
     */
    createMultiBalls() {
        // This will be handled by the game system that listens to the event
        // We emit an event with the details needed to create the balls
        eventBus.emit('multiBall:create', {
            sourceX: this.position.x,
            sourceY: this.position.y
        });
    }

    /**
     * Check if power-up collides with paddle
     * @param {Paddle} paddle - Paddle to check collision with
     * @returns {boolean} True if colliding
     */
    isCollidingWithPaddle(paddle) {
        const paddleBounds = paddle.getBounds();
        const powerUpBounds = this.getBounds();
        
        return MathUtils.rectIntersect(powerUpBounds, paddleBounds);
    }

    /**
     * Get power-up information
     * @returns {Object} Power-up info
     */
    getInfo() {
        return {
            type: this.powerUpType,
            name: this.name,
            color: this.color,
            position: { ...this.position },
            bounds: this.getBounds()
        };
    }

    /**
     * Create a power-up at brick position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {PowerUp|null} New power-up or null if no drop
     */
    static createAtPosition(x, y) {
        // Check drop chance
        if (Math.random() > Config.POWERUPS.DROP_CHANCE) {
            return null;
        }

        // Select random power-up type
        const powerUpTypes = Config.POWERUPS.TYPES;
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        // Center the power-up on the brick position
        const powerUpX = x - Config.POWERUPS.WIDTH / 2;
        const powerUpY = y - Config.POWERUPS.HEIGHT / 2;
        
        const powerUp = new PowerUp(powerUpX, powerUpY, randomType);
        
        // Emit spawn event
        eventBus.emit(GameEvents.POWERUP_SPAWNED, {
            powerUp: powerUp,
            type: randomType.type,
            position: { x: powerUpX, y: powerUpY }
        });
        
        return powerUp;
    }

    /**
     * Create a specific type of power-up
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Power-up type
     * @returns {PowerUp|null} New power-up or null if type not found
     */
    static createOfType(x, y, type) {
        const powerUpType = Config.POWERUPS.TYPES.find(t => t.type === type);
        if (!powerUpType) {
            console.warn(`Power-up type '${type}' not found`);
            return null;
        }
        
        const powerUpX = x - Config.POWERUPS.WIDTH / 2;
        const powerUpY = y - Config.POWERUPS.HEIGHT / 2;
        
        return new PowerUp(powerUpX, powerUpY, powerUpType);
    }

    /**
     * Get all available power-up types
     * @returns {Array} Array of power-up type objects
     */
    static getAvailableTypes() {
        return [...Config.POWERUPS.TYPES];
    }

    /**
     * Get power-up type by name
     * @param {string} type - Power-up type name
     * @returns {Object|null} Power-up type object or null
     */
    static getTypeInfo(type) {
        return Config.POWERUPS.TYPES.find(t => t.type === type) || null;
    }

    /**
     * Check if a power-up type exists
     * @param {string} type - Power-up type name
     * @returns {boolean} True if type exists
     */
    static isValidType(type) {
        return Config.POWERUPS.TYPES.some(t => t.type === type);
    }

    /**
     * Get random power-up type
     * @returns {Object} Random power-up type object
     */
    static getRandomType() {
        const types = Config.POWERUPS.TYPES;
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Reset power-up to initial state
     */
    reset() {
        this.velocity.y = this.fallSpeed;
        this.rotation = 0;
        this.glowIntensity = 0;
        this.glowDirection = 1;
        this.pulseScale = 1;
        this.pulseDirection = 1;
        this.bobOffset = MathUtils.random(0, Math.PI * 2);
    }

    /**
     * Get description of power-up effect
     * @returns {string} Description of what this power-up does
     */
    getDescription() {
        switch (this.powerUpType) {
            case 'widePaddle':
                return 'Increases paddle width for 15 seconds';
            case 'multiBall':
                return 'Creates 2 additional balls';
            default:
                return 'Unknown power-up effect';
        }
    }
}
