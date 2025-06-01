/**
 * Paddle Entity
 */
import { Entity } from '../core/Entity.js';
import { Config } from '../utils/Config.js';
import { MathUtils } from '../utils/MathUtils.js';
import { eventBus, GameEvents } from '../core/EventBus.js';

export class Paddle extends Entity {
    constructor(x, y) {
        super(x, y);
        
        this.width = Config.PADDLE.WIDTH;
        this.height = Config.PADDLE.HEIGHT;
        this.speed = Config.PADDLE.SPEED;
        this.color = Config.PADDLE.COLOR;
        this.originalWidth = Config.PADDLE.WIDTH;
        
        // Input state
        this.inputState = {
            left: false,
            right: false,
            mouseX: 0,
            useMouseControl: false
        };

        // Power-up effects
        this.powerUps = {
            wide: {
                active: false,
                endTime: 0
            }
        };

        // Visual effects
        this.glowIntensity = 0;
        this.glowDirection = 1;

        this.addTag('player');
        this.addTag('collidable');
    }

    /**
     * Update paddle logic
     * @param {number} deltaTime - Time since last update
     */
    onUpdate(deltaTime) {
        this.updateMovement(deltaTime);
        this.updatePowerUps();
        this.updateVisualEffects(deltaTime);
        this.constrainToBounds();
    }

    /**
     * Update paddle movement based on input
     * @param {number} deltaTime - Time since last update
     */
    updateMovement(deltaTime) {
        const moveSpeed = this.speed * (deltaTime / 16.67); // Normalize to 60fps

        if (this.inputState.useMouseControl) {
            // Mouse control - more precise
            const targetX = this.inputState.mouseX - this.width / 2;
            const diff = targetX - this.position.x;
            
            // Smooth movement towards mouse position
            if (Math.abs(diff) > 1) {
                this.position.x += diff * 0.15; // Smooth interpolation
            }
        } else {
            // Keyboard control
            if (this.inputState.left) {
                this.position.x -= moveSpeed;
            }
            if (this.inputState.right) {
                this.position.x += moveSpeed;
            }
        }
    }

    /**
     * Update power-up effects
     */
    updatePowerUps() {
        const currentTime = Date.now();

        // Wide paddle power-up
        if (this.powerUps.wide.active && currentTime >= this.powerUps.wide.endTime) {
            this.deactivateWidePaddle();
        }
    }

    /**
     * Update visual effects
     * @param {number} deltaTime - Time since last update
     */
    updateVisualEffects(deltaTime) {
        // Glow effect animation
        this.glowIntensity += this.glowDirection * (deltaTime / 1000) * 2;
        if (this.glowIntensity >= 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0) {
            this.glowIntensity = 0;
            this.glowDirection = 1;
        }
    }

    /**
     * Keep paddle within screen bounds
     */
    constrainToBounds() {
        this.position.x = MathUtils.clamp(
            this.position.x, 
            0, 
            Config.CANVAS.WIDTH - this.width
        );
    }

    /**
     * Render the paddle
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    onRender(ctx) {
        ctx.save();

        // Main paddle body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // Highlight effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.position.x, this.position.y, this.width, 3);

        // Glow effect when powered up
        if (this.powerUps.wide.active) {
            const glowAlpha = 0.3 + (this.glowIntensity * 0.4);
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 10;
            ctx.fillStyle = `rgba(0, 255, 255, ${glowAlpha})`;
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

        ctx.restore();
    }

    /**
     * Handle input for paddle movement
     * @param {string} key - Key pressed
     * @param {boolean} pressed - Whether key is pressed or released
     */
    handleKeyInput(key, pressed) {
        switch (key) {
            case 'ArrowLeft':
                this.inputState.left = pressed;
                this.inputState.useMouseControl = false;
                break;
            case 'ArrowRight':
                this.inputState.right = pressed;
                this.inputState.useMouseControl = false;
                break;
        }
    }

    /**
     * Handle mouse input for paddle movement
     * @param {number} mouseX - Mouse X position
     */
    handleMouseInput(mouseX) {
        this.inputState.mouseX = mouseX;
        this.inputState.useMouseControl = true;
    }

    /**
     * Get the effective collision bounds (may be larger due to AI assistance)
     * @param {number} assistanceLevel - AI assistance level (0-2)
     * @returns {Object} Collision bounds
     */
    getCollisionBounds(assistanceLevel = 0) {
        let effectiveWidth = this.width;
        let xOffset = 0;

        // AI assistance increases effective paddle size
        if (assistanceLevel === 1) {
            effectiveWidth += Config.AI.ASSISTANCE.SUBTLE_PADDLE_BONUS;
            xOffset = Config.AI.ASSISTANCE.SUBTLE_PADDLE_BONUS / 2;
        } else if (assistanceLevel === 2) {
            effectiveWidth += Config.AI.ASSISTANCE.ACTIVE_PADDLE_BONUS;
            xOffset = Config.AI.ASSISTANCE.ACTIVE_PADDLE_BONUS / 2;
        }

        return {
            x: this.position.x - xOffset,
            y: this.position.y,
            width: effectiveWidth,
            height: this.height
        };
    }

    /**
     * Calculate ball bounce angle based on hit position
     * @param {number} ballX - Ball X position
     * @returns {number} Bounce angle in radians
     */
    calculateBounceAngle(ballX) {
        // Calculate hit position on paddle (0 to 1)
        const hitPos = (ballX - this.position.x) / this.width;
        const clampedHitPos = MathUtils.clamp(hitPos, 0, 1);
        
        // Angle based on hit position (-60 to 60 degrees)
        const maxAngle = Math.PI / 3; // 60 degrees
        return (clampedHitPos - 0.5) * maxAngle;
    }

    /**
     * Activate wide paddle power-up
     * @param {number} duration - Duration in milliseconds
     */
    activateWidePaddle(duration = Config.PADDLE.WIDE_DURATION) {
        if (!this.powerUps.wide.active) {
            this.width = Config.PADDLE.WIDE_WIDTH;
            this.powerUps.wide.active = true;
            this.powerUps.wide.endTime = Date.now() + duration;
            
            eventBus.emit(GameEvents.POWERUP_ACTIVATED, {
                type: 'widePaddle',
                entity: this,
                duration: duration
            });
        } else {
            // Extend duration if already active
            this.powerUps.wide.endTime = Date.now() + duration;
        }
    }

    /**
     * Deactivate wide paddle power-up
     */
    deactivateWidePaddle() {
        this.width = this.originalWidth;
        this.powerUps.wide.active = false;
        this.powerUps.wide.endTime = 0;
        
        eventBus.emit(GameEvents.POWERUP_EXPIRED, {
            type: 'widePaddle',
            entity: this
        });
    }

    /**
     * Get the center X position of the paddle
     * @returns {number} Center X position
     */
    getCenterX() {
        return this.position.x + this.width / 2;
    }

    /**
     * Get the top Y position of the paddle
     * @returns {number} Top Y position
     */
    getTopY() {
        return this.position.y;
    }

    /**
     * Check if a point is within the paddle bounds
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if point is within paddle
     */
    containsPoint(x, y) {
        return x >= this.position.x &&
               x <= this.position.x + this.width &&
               y >= this.position.y &&
               y <= this.position.y + this.height;
    }

    /**
     * Get current power-up status
     * @returns {Object} Power-up status
     */
    getPowerUpStatus() {
        const status = {};
        
        if (this.powerUps.wide.active) {
            const timeLeft = Math.max(0, this.powerUps.wide.endTime - Date.now());
            status.widePaddle = {
                active: true,
                timeLeft: timeLeft,
                timeLeftSeconds: Math.ceil(timeLeft / 1000)
            };
        }

        return status;
    }

    /**
     * Reset paddle to default state
     */
    reset() {
        this.position.x = (Config.CANVAS.WIDTH - this.originalWidth) / 2;
        this.position.y = Config.PADDLE.Y_POSITION;
        this.width = this.originalWidth;
        this.velocity.x = 0;
        this.velocity.y = 0;
        
        // Reset power-ups
        this.powerUps.wide.active = false;
        this.powerUps.wide.endTime = 0;
        
        // Reset input state
        this.inputState.left = false;
        this.inputState.right = false;
        this.inputState.useMouseControl = false;
    }
}
