/**
 * Brick Entity
 */
import { Entity } from '../core/Entity.js';
import { Config } from '../utils/Config.js';
import { eventBus, GameEvents } from '../core/EventBus.js';

export class Brick extends Entity {
    constructor(x, y, brickType) {
        super(x, y);
        
        this.width = Config.BRICKS.WIDTH;
        this.height = Config.BRICKS.HEIGHT;
        
        // Brick properties from type
        this.hits = brickType.hits;
        this.maxHits = brickType.maxHits;
        this.color = brickType.color;
        this.points = brickType.points;
        this.originalColor = brickType.color;
        
        // Visual effects
        this.flashIntensity = 0;
        this.flashDirection = 0;
        this.damageAlpha = 0;
        
        // Animation properties
        this.scaleX = 1;
        this.scaleY = 1;
        this.rotation = 0;
        
        this.addTag('brick');
        this.addTag('destructible');
        this.addTag('collidable');
    }

    /**
     * Update brick logic
     * @param {number} deltaTime - Time since last update
     */
    onUpdate(deltaTime) {
        this.updateVisualEffects(deltaTime);
        this.updateDamageEffect();
    }

    /**
     * Update visual effects
     * @param {number} deltaTime - Time since last update
     */
    updateVisualEffects(deltaTime) {
        // Flash effect when hit
        if (this.flashIntensity > 0) {
            this.flashIntensity -= deltaTime / 200; // Fade over 200ms
            if (this.flashIntensity <= 0) {
                this.flashIntensity = 0;
                this.flashDirection = 0;
            }
        }

        // Scale animation when hit
        if (this.scaleX !== 1 || this.scaleY !== 1) {
            const returnSpeed = deltaTime / 100;
            this.scaleX = this.lerp(this.scaleX, 1, returnSpeed);
            this.scaleY = this.lerp(this.scaleY, 1, returnSpeed);
            
            if (Math.abs(this.scaleX - 1) < 0.01) this.scaleX = 1;
            if (Math.abs(this.scaleY - 1) < 0.01) this.scaleY = 1;
        }
    }

    /**
     * Update damage visual effect
     */
    updateDamageEffect() {
        if (this.hits < this.maxHits) {
            const damageRatio = 1 - (this.hits / this.maxHits);
            this.damageAlpha = damageRatio * 0.4; // Max 40% darkness
        } else {
            this.damageAlpha = 0;
        }
    }

    /**
     * Render the brick
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    onRender(ctx) {
        if (!this.visible) return;

        ctx.save();

        // Apply transformations
        const centerX = this.position.x + this.width / 2;
        const centerY = this.position.y + this.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.scale(this.scaleX, this.scaleY);
        ctx.rotate(this.rotation);
        ctx.translate(-this.width / 2, -this.height / 2);

        // Main brick color
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, this.width, this.height);

        // Flash effect
        if (this.flashIntensity > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashIntensity})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        // Damage effect
        if (this.damageAlpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.damageAlpha})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        // Highlight effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(0, 0, this.width, 3);

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, this.width, this.height);

        // Hit indicator for multi-hit bricks
        if (this.maxHits > 1) {
            this.drawHitIndicator(ctx);
        }

        ctx.restore();
    }

    /**
     * Draw hit indicator for multi-hit bricks
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawHitIndicator(ctx) {
        const indicatorSize = 4;
        const spacing = 2;
        const startX = this.width - (this.maxHits * (indicatorSize + spacing)) + spacing;
        const y = this.height - indicatorSize - 2;

        for (let i = 0; i < this.maxHits; i++) {
            const x = startX + i * (indicatorSize + spacing);
            
            if (i < this.hits) {
                // Remaining hits - bright
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            } else {
                // Used hits - dim
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            }
            
            ctx.fillRect(x, y, indicatorSize, indicatorSize);
        }
    }

    /**
     * Handle being hit by a ball
     * @param {Ball} ball - Ball that hit this brick
     * @returns {boolean} True if brick was destroyed
     */
    hit(ball) {
        this.hits--;
        
        // Visual effects
        this.triggerHitEffect();
        
        // Emit hit event
        eventBus.emit(GameEvents.BRICK_HIT, { 
            brick: this, 
            ball: ball,
            pointsAwarded: this.points,
            hitsRemaining: this.hits
        });

        // Check if destroyed
        if (this.hits <= 0) {
            this.destroy();
            eventBus.emit(GameEvents.BRICK_DESTROYED, { 
                brick: this, 
                ball: ball,
                pointsAwarded: this.points
            });
            return true;
        }

        return false;
    }

    /**
     * Trigger visual hit effect
     */
    triggerHitEffect() {
        // Flash effect
        this.flashIntensity = 1;
        this.flashDirection = -1;
        
        // Scale effect
        this.scaleX = 1.1;
        this.scaleY = 0.9;
        
        // Spawn particles
        eventBus.emit(GameEvents.PARTICLE_SPAWN, {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2,
            color: this.color,
            count: Config.PARTICLES.COUNT_PER_BRICK
        });
    }

    /**
     * Linear interpolation helper
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} factor - Interpolation factor
     * @returns {number} Interpolated value
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    /**
     * Get the center position of the brick
     * @returns {Object} Center position
     */
    getCenter() {
        return {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        };
    }

    /**
     * Check if brick is damaged
     * @returns {boolean} True if brick has taken damage
     */
    isDamaged() {
        return this.hits < this.maxHits;
    }

    /**
     * Get damage percentage
     * @returns {number} Damage percentage (0-1)
     */
    getDamagePercentage() {
        return 1 - (this.hits / this.maxHits);
    }

    /**
     * Get brick type information
     * @returns {Object} Brick type info
     */
    getTypeInfo() {
        return {
            hits: this.hits,
            maxHits: this.maxHits,
            points: this.points,
            color: this.originalColor,
            isDamaged: this.isDamaged(),
            damagePercentage: this.getDamagePercentage()
        };
    }

    /**
     * Create a brick from grid position
     * @param {number} row - Grid row
     * @param {number} col - Grid column
     * @returns {Brick} New brick instance
     */
    static createFromGrid(row, col) {
        const x = col * (Config.BRICKS.WIDTH + Config.BRICKS.PADDING) + Config.BRICKS.OFFSET_LEFT;
        const y = row * (Config.BRICKS.HEIGHT + Config.BRICKS.PADDING) + Config.BRICKS.OFFSET_TOP;
        
        // Select brick type based on row
        const typeIndex = Math.min(row, Config.BRICKS.TYPES.length - 1);
        const brickType = Config.BRICKS.TYPES[typeIndex];
        
        return new Brick(x, y, brickType);
    }

    /**
     * Create a full grid of bricks
     * @returns {Array<Brick>} Array of brick instances
     */
    static createBrickGrid() {
        const bricks = [];
        
        for (let row = 0; row < Config.BRICKS.ROWS; row++) {
            for (let col = 0; col < Config.BRICKS.COLS; col++) {
                const brick = Brick.createFromGrid(row, col);
                bricks.push(brick);
            }
        }
        
        return bricks;
    }

    /**
     * Get brick color based on hits remaining
     * @param {number} hits - Hits remaining
     * @param {number} maxHits - Maximum hits
     * @param {string} originalColor - Original brick color
     * @returns {string} Color for current hit state
     */
    static getBrickColor(hits, maxHits, originalColor) {
        if (hits === maxHits) {
            return originalColor;
        }
        
        // Darken color based on damage
        const damageRatio = 1 - (hits / maxHits);
        const darkenFactor = 1 - (damageRatio * 0.5); // Max 50% darker
        
        // Parse hex color and darken
        const hex = originalColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const newR = Math.floor(r * darkenFactor);
        const newG = Math.floor(g * darkenFactor);
        const newB = Math.floor(b * darkenFactor);
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }

    /**
     * Check if point is inside brick
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if point is inside
     */
    containsPoint(x, y) {
        return x >= this.position.x &&
               x <= this.position.x + this.width &&
               y >= this.position.y &&
               y <= this.position.y + this.height;
    }

    /**
     * Get the closest point on the brick to a given point
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object} Closest point
     */
    getClosestPoint(x, y) {
        const clampedX = Math.max(this.position.x, Math.min(x, this.position.x + this.width));
        const clampedY = Math.max(this.position.y, Math.min(y, this.position.y + this.height));
        
        return { x: clampedX, y: clampedY };
    }

    /**
     * Reset brick to initial state
     */
    reset() {
        this.hits = this.maxHits;
        this.visible = true;
        this.active = true;
        this.flashIntensity = 0;
        this.flashDirection = 0;
        this.damageAlpha = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.rotation = 0;
        this.color = this.originalColor;
    }
}
