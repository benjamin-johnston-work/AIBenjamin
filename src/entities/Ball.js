/**
 * Ball Entity
 */
import { Entity } from '../core/Entity.js';
import { Config } from '../utils/Config.js';
import { MathUtils } from '../utils/MathUtils.js';
import { eventBus, GameEvents } from '../core/EventBus.js';

export class Ball extends Entity {
    constructor(x, y) {
        super(x, y);
        
        this.radius = Config.BALL.RADIUS;
        this.color = Config.BALL.COLOR;
        this.speed = Config.BALL.SPEED;
        this.onPaddle = true;
        this.launched = false;
        
        // Trail effect
        this.trail = [];
        this.maxTrailLength = 10;
        
        // Visual effects
        this.glowIntensity = 0;
        this.glowDirection = 1;
        
        // Physics properties
        this.bounceCount = 0;
        this.lastCollisionTime = 0;
        this.minCollisionInterval = 50; // Prevent rapid collisions
        
        this.addTag('ball');
        this.addTag('collidable');
    }

    /**
     * Update ball logic
     * @param {number} deltaTime - Time since last update
     */
    onUpdate(deltaTime) {
        if (this.onPaddle) {
            this.updateOnPaddle();
        } else {
            this.updateMovement(deltaTime);
            this.updateTrail();
            this.checkBounds();
        }
        
        this.updateVisualEffects(deltaTime);
    }

    /**
     * Update ball when it's on the paddle
     */
    updateOnPaddle() {
        // Ball will be positioned by the paddle or game system
        // This is handled externally to maintain proper coupling
    }

    /**
     * Update ball movement when in play
     * @param {number} deltaTime - Time since last update
     */
    updateMovement(deltaTime) {
        // Normalize movement to 60fps
        const normalizedDelta = deltaTime / 16.67;
        
        // Update position
        this.position.x += this.velocity.x * normalizedDelta;
        this.position.y += this.velocity.y * normalizedDelta;
        
        // Maintain consistent speed
        this.maintainSpeed();
    }

    /**
     * Update trail effect
     */
    updateTrail() {
        // Add current position to trail
        this.trail.push({
            x: this.position.x,
            y: this.position.y,
            time: Date.now()
        });

        // Remove old trail points
        const currentTime = Date.now();
        this.trail = this.trail.filter(point => 
            currentTime - point.time < 200 // Keep trail for 200ms
        );

        // Limit trail length
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    /**
     * Check bounds and handle wall collisions
     */
    checkBounds() {
        const currentTime = Date.now();
        
        // Prevent rapid collisions
        if (currentTime - this.lastCollisionTime < this.minCollisionInterval) {
            return;
        }

        let collided = false;

        // Left wall
        if (this.position.x - this.radius <= 0) {
            this.position.x = this.radius;
            this.velocity.x = Math.abs(this.velocity.x);
            collided = true;
        }
        
        // Right wall
        if (this.position.x + this.radius >= Config.CANVAS.WIDTH) {
            this.position.x = Config.CANVAS.WIDTH - this.radius;
            this.velocity.x = -Math.abs(this.velocity.x);
            collided = true;
        }
        
        // Top wall
        if (this.position.y - this.radius <= 0) {
            this.position.y = this.radius;
            this.velocity.y = Math.abs(this.velocity.y);
            collided = true;
        }

        if (collided) {
            this.lastCollisionTime = currentTime;
            this.bounceCount++;
            eventBus.emit(GameEvents.BALL_WALL_HIT, { ball: this });
        }

        // Bottom - ball is lost
        if (this.position.y - this.radius > Config.CANVAS.HEIGHT) {
            this.handleBallLost();
        }
    }

    /**
     * Update visual effects
     * @param {number} deltaTime - Time since last update
     */
    updateVisualEffects(deltaTime) {
        // Glow effect animation
        this.glowIntensity += this.glowDirection * (deltaTime / 1000) * 3;
        if (this.glowIntensity >= 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0) {
            this.glowIntensity = 0;
            this.glowDirection = 1;
        }
    }

    /**
     * Maintain consistent ball speed
     */
    maintainSpeed() {
        const currentSpeed = MathUtils.magnitude(this.velocity);
        
        if (currentSpeed > 0) {
            const targetSpeed = MathUtils.clamp(
                this.speed, 
                Config.BALL.MIN_SPEED, 
                Config.BALL.MAX_SPEED
            );
            
            // Normalize velocity to target speed
            const normalizedVelocity = MathUtils.normalize(this.velocity);
            this.velocity.x = normalizedVelocity.x * targetSpeed;
            this.velocity.y = normalizedVelocity.y * targetSpeed;
        }
    }

    /**
     * Render the ball
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    onRender(ctx) {
        ctx.save();

        // Draw trail
        this.drawTrail(ctx);

        // Draw main ball
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        const glowAlpha = 0.3 + (this.glowIntensity * 0.4);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = `rgba(255, 215, 0, ${glowAlpha})`;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(
            this.position.x - this.radius * 0.3, 
            this.position.y - this.radius * 0.3, 
            this.radius * 0.3, 
            0, 
            Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw ball trail effect
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawTrail(ctx) {
        if (this.trail.length < 2) return;

        const currentTime = Date.now();
        
        for (let i = 0; i < this.trail.length - 1; i++) {
            const point = this.trail[i];
            const age = currentTime - point.time;
            const alpha = Math.max(0, 1 - (age / 200)); // Fade over 200ms
            const size = this.radius * alpha * 0.5;

            if (alpha > 0) {
                ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.3})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    /**
     * Launch the ball from the paddle
     * @param {number} angle - Launch angle in radians (optional)
     */
    launch(angle = null) {
        if (!this.onPaddle) return;

        this.onPaddle = false;
        this.launched = true;

        if (angle !== null) {
            // Launch at specific angle
            this.velocity.x = Math.sin(angle) * this.speed;
            this.velocity.y = -Math.cos(angle) * this.speed;
        } else {
            // Default launch (straight up with slight randomness)
            const randomAngle = MathUtils.random(-0.2, 0.2); // Small random angle
            this.velocity.x = Math.sin(randomAngle) * this.speed;
            this.velocity.y = -Math.cos(randomAngle) * this.speed;
        }

        // Ensure minimum upward velocity
        if (this.velocity.y > -2) {
            this.velocity.y = -2;
        }

        eventBus.emit(GameEvents.BALL_PADDLE_HIT, { ball: this });
    }

    /**
     * Handle collision with paddle
     * @param {Paddle} paddle - Paddle entity
     * @param {number} assistanceLevel - AI assistance level
     */
    handlePaddleCollision(paddle, assistanceLevel = 0) {
        const currentTime = Date.now();
        
        // Prevent rapid collisions
        if (currentTime - this.lastCollisionTime < this.minCollisionInterval) {
            return;
        }

        // Get collision bounds (may be larger due to AI assistance)
        const paddleBounds = paddle.getCollisionBounds(assistanceLevel);
        
        // Check if ball is actually colliding
        if (!this.isCollidingWithRect(paddleBounds) || this.velocity.y <= 0) {
            return;
        }

        // Calculate bounce angle based on hit position
        const angle = paddle.calculateBounceAngle(this.position.x);
        const speed = MathUtils.magnitude(this.velocity);

        // Apply new velocity
        this.velocity.x = Math.sin(angle) * speed;
        this.velocity.y = -Math.cos(angle) * speed;

        // Ensure minimum upward velocity
        if (this.velocity.y > -2) {
            this.velocity.y = -2;
        }

        // Position ball above paddle
        this.position.y = paddleBounds.y - this.radius;

        this.lastCollisionTime = currentTime;
        this.bounceCount++;
        
        eventBus.emit(GameEvents.BALL_PADDLE_HIT, { ball: this, paddle: paddle });
    }

    /**
     * Handle collision with brick
     * @param {Brick} brick - Brick entity
     */
    handleBrickCollision(brick) {
        const currentTime = Date.now();
        
        // Prevent rapid collisions
        if (currentTime - this.lastCollisionTime < this.minCollisionInterval) {
            return;
        }

        const brickBounds = brick.getBounds();
        const ballCenter = this.getCenter();
        const brickCenter = {
            x: brickBounds.x + brickBounds.width / 2,
            y: brickBounds.y + brickBounds.height / 2
        };

        // Calculate collision normal
        const dx = ballCenter.x - brickCenter.x;
        const dy = ballCenter.y - brickCenter.y;

        // Determine collision side
        const overlapX = (brickBounds.width / 2 + this.radius) - Math.abs(dx);
        const overlapY = (brickBounds.height / 2 + this.radius) - Math.abs(dy);

        if (overlapX < overlapY) {
            // Hit left or right side
            this.velocity.x = -this.velocity.x;
            this.position.x = dx > 0 ? 
                brickBounds.x + brickBounds.width + this.radius : 
                brickBounds.x - this.radius;
        } else {
            // Hit top or bottom
            this.velocity.y = -this.velocity.y;
            this.position.y = dy > 0 ? 
                brickBounds.y + brickBounds.height + this.radius : 
                brickBounds.y - this.radius;
        }

        this.lastCollisionTime = currentTime;
        this.bounceCount++;
        
        eventBus.emit(GameEvents.BRICK_HIT, { ball: this, brick: brick });
    }

    /**
     * Check if ball is colliding with a rectangle
     * @param {Object} rect - Rectangle bounds
     * @returns {boolean} True if colliding
     */
    isCollidingWithRect(rect) {
        return MathUtils.circleRectIntersect(
            { x: this.position.x, y: this.position.y, radius: this.radius },
            rect
        );
    }

    /**
     * Handle ball being lost (fell off bottom)
     */
    handleBallLost() {
        eventBus.emit(GameEvents.BALL_LOST, { ball: this });
        this.destroy();
    }

    /**
     * Apply AI assistance nudging
     * @param {number} targetX - Target X position to nudge towards
     * @param {number} force - Nudge force
     */
    applyAINudge(targetX, force = Config.AI.ASSISTANCE.BALL_NUDGE_FORCE) {
        if (this.onPaddle) return;

        const dx = targetX - this.position.x;
        if (Math.abs(dx) > 50) {
            this.velocity.x += dx > 0 ? force : -force;
        }
    }

    /**
     * Apply AI speed reduction
     * @param {number} factor - Speed reduction factor
     */
    applySpeedReduction(factor = Config.AI.ASSISTANCE.SPEED_REDUCTION) {
        if (this.onPaddle) return;

        const currentSpeed = MathUtils.magnitude(this.velocity);
        if (currentSpeed > 6) {
            this.velocity.x *= factor;
            this.velocity.y *= factor;
        }
    }

    /**
     * Get bounding box for collision detection
     * @returns {Object} Bounding box
     */
    getBounds() {
        return {
            x: this.position.x - this.radius,
            y: this.position.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }

    /**
     * Position ball on paddle
     * @param {Paddle} paddle - Paddle to position on
     */
    positionOnPaddle(paddle) {
        this.onPaddle = true;
        this.launched = false;
        this.position.x = paddle.getCenterX();
        this.position.y = paddle.getTopY() - this.radius;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.trail = [];
    }

    /**
     * Reset ball to initial state
     */
    /**
     * Get current ball speed
     * @returns {number} Current speed magnitude
     */
    getSpeed() {
        return MathUtils.magnitude(this.velocity);
    }

    reset() {
        this.onPaddle = true;
        this.launched = false;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.bounceCount = 0;
        this.lastCollisionTime = 0;
        this.trail = [];
        this.speed = Config.BALL.SPEED;
        this.color = Config.BALL.COLOR;
    }

    /**
     * Create a new ball for multi-ball power-up
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} vx - X velocity
     * @param {number} vy - Y velocity
     * @param {string} color - Ball color
     * @returns {Ball} New ball instance
     */
    static createMultiBall(x, y, vx, vy, color = '#FF69B4') {
        const ball = new Ball(x, y);
        ball.onPaddle = false;
        ball.launched = true;
        ball.velocity.x = vx;
        ball.velocity.y = vy;
        ball.color = color;
        return ball;
    }
}
