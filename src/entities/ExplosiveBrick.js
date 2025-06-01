import { Brick } from './Brick.js';
import { Config } from '../utils/Config.js';
import { eventBus } from '../core/EventBus.js';

/**
 * ExplosiveBrick - Destroys surrounding bricks in a 3x3 area when destroyed
 */
export class ExplosiveBrick extends Brick {
    constructor(x, y) {
        super(x, y, {
            hits: 1,
            maxHits: 1,
            color: Config.SPECIAL_BRICKS.EXPLOSIVE.COLOR,
            points: Config.SPECIAL_BRICKS.EXPLOSIVE.POINTS
        });
        
        this.type = 'explosive';
        this.explosionRadius = Config.SPECIAL_BRICKS.EXPLOSIVE.EXPLOSION_RADIUS;
        this.sparkPhase = 0;
        this.pulseIntensity = 0;
        
        this.addTag('explosive');
        this.addTag('special');
    }
    
    onUpdate(deltaTime) {
        super.onUpdate(deltaTime);
        
        // Spark animation
        this.sparkPhase += deltaTime * 0.005;
        this.pulseIntensity = 0.3 + Math.sin(this.sparkPhase) * 0.2;
    }
    
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

        // Spark pattern overlay
        this.renderSparkPattern(ctx);

        // Pulsing glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10 * this.pulseIntensity;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, this.width, this.height);
        ctx.shadowBlur = 0;

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

        // Explosion warning icon
        this.renderExplosionIcon(ctx);

        ctx.restore();
    }
    
    renderSparkPattern(ctx) {
        ctx.save();
        
        // Create spark pattern
        const sparkCount = 8;
        const sparkSize = 2;
        
        ctx.fillStyle = `rgba(255, 255, 0, ${this.pulseIntensity})`;
        
        for (let i = 0; i < sparkCount; i++) {
            const angle = (i / sparkCount) * Math.PI * 2 + this.sparkPhase;
            const radius = 15 + Math.sin(this.sparkPhase * 2 + i) * 5;
            
            const x = this.width / 2 + Math.cos(angle) * radius;
            const y = this.height / 2 + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.arc(x, y, sparkSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    renderExplosionIcon(ctx) {
        ctx.save();
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const iconSize = 8;
        
        // Explosion symbol
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + this.pulseIntensity * 0.2})`;
        ctx.font = `${iconSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💥', centerX, centerY);
        
        ctx.restore();
    }
    
    hit(ball) {
        // Trigger explosion immediately when hit
        this.triggerExplosion();
        
        // Call parent hit method
        return super.hit(ball);
    }
    
    triggerExplosion() {
        // Create massive explosion effect
        eventBus.emit('effects:explosion', {
            position: this.getCenter(),
            radius: this.explosionRadius,
            intensity: 1.0,
            color: this.color
        });
        
        // Screen shake
        eventBus.emit('effects:screenShake', { intensity: 8 });
        
        // Color flash
        eventBus.emit('effects:colorFlash', {
            color: '#FF4444',
            intensity: 0.4
        });
        
        // Find and destroy nearby bricks
        this.destroyNearbyBricks();
        
        // Create massive particle effect
        this.createExplosionParticles();
    }
    
    destroyNearbyBricks() {
        const center = this.getCenter();
        
        eventBus.emit('brick:explode', {
            center: center,
            radius: this.explosionRadius,
            source: this
        });
    }
    
    createExplosionParticles() {
        const center = this.getCenter();
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            eventBus.emit('particle:create', {
                x: center.x,
                y: center.y,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                life: 1500 + Math.random() * 1000,
                size: 2 + Math.random() * 4,
                color: this.getExplosionColor(),
                gravity: 0.0001
            });
        }
    }
    
    getExplosionColor() {
        const colors = ['#FF4444', '#FF8800', '#FFAA00', '#FFFF00'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    triggerHitEffect() {
        // Enhanced hit effect for explosive bricks
        super.triggerHitEffect();
        
        // Additional explosion warning effect
        eventBus.emit('effects:screenShake', { intensity: 4 });
    }
    
    getDebugInfo() {
        return {
            ...super.getDebugInfo(),
            type: this.type,
            explosionRadius: this.explosionRadius,
            sparkPhase: this.sparkPhase,
            pulseIntensity: this.pulseIntensity
        };
    }
}
