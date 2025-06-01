/**
 * Particle Entity for visual effects
 */
import { Entity } from '../core/Entity.js';
import { Config } from '../utils/Config.js';
import { MathUtils } from '../utils/MathUtils.js';

export class Particle extends Entity {
    constructor(x, y, options = {}) {
        super(x, y);
        
        // Particle properties
        this.life = options.life || Config.PARTICLES.LIFE_SPAN;
        this.maxLife = this.life;
        this.color = options.color || '#FFFFFF';
        this.size = options.size || MathUtils.random(1, 3);
        this.originalSize = this.size;
        
        // Physics properties
        this.velocity.x = options.vx || MathUtils.random(-Config.PARTICLES.SPEED_RANGE, Config.PARTICLES.SPEED_RANGE);
        this.velocity.y = options.vy || MathUtils.random(-Config.PARTICLES.SPEED_RANGE, Config.PARTICLES.SPEED_RANGE);
        this.gravity = options.gravity || 0.1;
        this.friction = options.friction || 0.98;
        
        // Visual properties
        this.alpha = 1;
        this.rotation = options.rotation || 0;
        this.rotationSpeed = options.rotationSpeed || MathUtils.random(-0.2, 0.2);
        this.scaleX = 1;
        this.scaleY = 1;
        
        // Particle type
        this.particleType = options.type || 'default';
        
        this.addTag('particle');
        this.addTag('effect');
    }

    /**
     * Update particle logic
     * @param {number} deltaTime - Time since last update
     */
    onUpdate(deltaTime) {
        this.updatePhysics(deltaTime);
        this.updateLife(deltaTime);
        this.updateVisualEffects(deltaTime);
        
        // Remove particle when life expires
        if (this.life <= 0) {
            this.destroy();
        }
    }

    /**
     * Update particle physics
     * @param {number} deltaTime - Time since last update
     */
    updatePhysics(deltaTime) {
        const normalizedDelta = deltaTime / 16.67;
        
        // Apply gravity
        this.velocity.y += this.gravity * normalizedDelta;
        
        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        // Update position
        this.position.x += this.velocity.x * normalizedDelta;
        this.position.y += this.velocity.y * normalizedDelta;
        
        // Update rotation
        this.rotation += this.rotationSpeed * normalizedDelta;
    }

    /**
     * Update particle life and aging effects
     * @param {number} deltaTime - Time since last update
     */
    updateLife(deltaTime) {
        this.life -= deltaTime / 16.67;
        
        // Calculate life ratio (1 = new, 0 = dead)
        const lifeRatio = Math.max(0, this.life / this.maxLife);
        
        // Update alpha based on life
        this.alpha = lifeRatio;
        
        // Update size based on life (particles shrink as they age)
        this.size = this.originalSize * (0.5 + lifeRatio * 0.5);
    }

    /**
     * Update visual effects
     * @param {number} deltaTime - Time since last update
     */
    updateVisualEffects(deltaTime) {
        // Type-specific visual effects
        switch (this.particleType) {
            case 'spark':
                this.updateSparkEffect(deltaTime);
                break;
            case 'smoke':
                this.updateSmokeEffect(deltaTime);
                break;
            case 'explosion':
                this.updateExplosionEffect(deltaTime);
                break;
            default:
                this.updateDefaultEffect(deltaTime);
                break;
        }
    }

    /**
     * Update spark particle effect
     * @param {number} deltaTime - Time since last update
     */
    updateSparkEffect(deltaTime) {
        const lifeRatio = this.life / this.maxLife;
        
        // Sparks fade quickly and maintain size longer
        this.alpha = lifeRatio * lifeRatio;
        this.size = this.originalSize * (0.8 + lifeRatio * 0.2);
        
        // Add slight flickering
        if (Math.random() < 0.1) {
            this.alpha *= 0.5;
        }
    }

    /**
     * Update smoke particle effect
     * @param {number} deltaTime - Time since last update
     */
    updateSmokeEffect(deltaTime) {
        const lifeRatio = this.life / this.maxLife;
        
        // Smoke grows and fades
        this.alpha = lifeRatio * 0.6; // More transparent
        this.size = this.originalSize * (1 + (1 - lifeRatio) * 2); // Grows over time
        
        // Reduce upward velocity over time
        this.velocity.y *= 0.99;
    }

    /**
     * Update explosion particle effect
     * @param {number} deltaTime - Time since last update
     */
    updateExplosionEffect(deltaTime) {
        const lifeRatio = this.life / this.maxLife;
        
        // Explosion particles maintain brightness then fade quickly
        if (lifeRatio > 0.7) {
            this.alpha = 1;
        } else {
            this.alpha = (lifeRatio / 0.7) * (lifeRatio / 0.7);
        }
        
        this.size = this.originalSize * (0.5 + lifeRatio * 0.5);
    }

    /**
     * Update default particle effect
     * @param {number} deltaTime - Time since last update
     */
    updateDefaultEffect(deltaTime) {
        const lifeRatio = this.life / this.maxLife;
        
        // Standard fade and shrink
        this.alpha = lifeRatio;
        this.size = this.originalSize * (0.3 + lifeRatio * 0.7);
    }

    /**
     * Render the particle
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    onRender(ctx) {
        if (this.alpha <= 0 || this.size <= 0) return;

        ctx.save();

        // Apply transformations
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scaleX, this.scaleY);

        // Set alpha
        ctx.globalAlpha = this.alpha;

        // Render based on particle type
        switch (this.particleType) {
            case 'spark':
                this.renderSpark(ctx);
                break;
            case 'smoke':
                this.renderSmoke(ctx);
                break;
            case 'explosion':
                this.renderExplosion(ctx);
                break;
            default:
                this.renderDefault(ctx);
                break;
        }

        ctx.restore();
    }

    /**
     * Render spark particle
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderSpark(ctx) {
        // Bright, small particles
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 2;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Render smoke particle
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderSmoke(ctx) {
        // Soft, growing circles
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Render explosion particle
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderExplosion(ctx) {
        // Bright, energetic particles
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 3;
        
        // Draw as a small rectangle for more angular look
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }

    /**
     * Render default particle
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderDefault(ctx) {
        ctx.fillStyle = this.color;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Check if particle is still alive
     * @returns {boolean} True if particle is alive
     */
    isAlive() {
        return this.life > 0 && this.alpha > 0;
    }

    /**
     * Get life percentage
     * @returns {number} Life percentage (0-1)
     */
    getLifePercentage() {
        return Math.max(0, this.life / this.maxLife);
    }

    /**
     * Create a burst of particles
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Particle options
     * @returns {Array<Particle>} Array of particles
     */
    static createBurst(x, y, options = {}) {
        const particles = [];
        const count = options.count || Config.PARTICLES.COUNT_PER_BRICK;
        const color = options.color || '#FFFFFF';
        const type = options.type || 'default';
        const speed = options.speed || Config.PARTICLES.SPEED_RANGE;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + MathUtils.random(-0.5, 0.5);
            const velocity = MathUtils.random(speed * 0.5, speed);
            
            const particle = new Particle(x, y, {
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color: color,
                type: type,
                size: MathUtils.random(1, 4),
                life: MathUtils.random(20, 40)
            });
            
            particles.push(particle);
        }
        
        return particles;
    }

    /**
     * Create explosion particles
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Particle color
     * @returns {Array<Particle>} Array of explosion particles
     */
    static createExplosion(x, y, color = '#FF6600') {
        return Particle.createBurst(x, y, {
            count: 12,
            color: color,
            type: 'explosion',
            speed: 6
        });
    }

    /**
     * Create spark particles
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Particle color
     * @returns {Array<Particle>} Array of spark particles
     */
    static createSparks(x, y, color = '#FFFF00') {
        return Particle.createBurst(x, y, {
            count: 8,
            color: color,
            type: 'spark',
            speed: 4
        });
    }

    /**
     * Create smoke particles
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Particle color
     * @returns {Array<Particle>} Array of smoke particles
     */
    static createSmoke(x, y, color = '#888888') {
        const particles = [];
        const count = 5;
        
        for (let i = 0; i < count; i++) {
            const particle = new Particle(x + MathUtils.random(-5, 5), y, {
                vx: MathUtils.random(-1, 1),
                vy: MathUtils.random(-3, -1),
                color: color,
                type: 'smoke',
                size: MathUtils.random(2, 5),
                life: MathUtils.random(40, 80),
                gravity: -0.05 // Smoke rises
            });
            
            particles.push(particle);
        }
        
        return particles;
    }

    /**
     * Create trail particles for moving objects
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Particle color
     * @returns {Particle} Single trail particle
     */
    static createTrail(x, y, color = '#FFFFFF') {
        return new Particle(x + MathUtils.random(-2, 2), y + MathUtils.random(-2, 2), {
            vx: MathUtils.random(-0.5, 0.5),
            vy: MathUtils.random(-0.5, 0.5),
            color: color,
            size: MathUtils.random(0.5, 2),
            life: MathUtils.random(10, 20),
            gravity: 0,
            friction: 0.95
        });
    }

    /**
     * Get bounding box (particles don't need collision detection)
     * @returns {Object} Bounding box
     */
    getBounds() {
        return {
            x: this.position.x - this.size,
            y: this.position.y - this.size,
            width: this.size * 2,
            height: this.size * 2
        };
    }
}
