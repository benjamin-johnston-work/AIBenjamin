import { Brick } from './Brick.js';
import { Config } from '../utils/Config.js';
import { eventBus } from '../core/EventBus.js';

/**
 * MysteryBrick - Rainbow color-shifting brick that provides random bonuses
 */
export class MysteryBrick extends Brick {
    constructor(x, y) {
        super(x, y, {
            hits: 1,
            maxHits: 1,
            color: '#FF0080', // Initial color, will be overridden
            points: Config.SPECIAL_BRICKS.MYSTERY.POINTS
        });
        
        this.type = 'mystery';
        this.hue = Math.random() * 360;
        this.colorShiftSpeed = Config.SPECIAL_BRICKS.MYSTERY.COLOR_SHIFT_SPEED;
        this.bonusEffects = Config.SPECIAL_BRICKS.MYSTERY.BONUS_EFFECTS;
        this.glowIntensity = 0;
        this.sparkles = [];
        
        this.addTag('mystery');
        this.addTag('special');
        this.addTag('bonus');
        
        this.initializeSparkles();
    }
    
    initializeSparkles() {
        // Create sparkle effects around the brick
        const sparkleCount = 8;
        for (let i = 0; i < sparkleCount; i++) {
            this.sparkles.push({
                angle: (i / sparkleCount) * Math.PI * 2,
                radius: 20 + Math.random() * 10,
                phase: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.03,
                size: 1 + Math.random() * 2
            });
        }
    }
    
    onUpdate(deltaTime) {
        super.onUpdate(deltaTime);
        
        // Color shifting animation
        this.hue += this.colorShiftSpeed * deltaTime;
        if (this.hue >= 360) this.hue -= 360;
        
        // Update color
        this.color = `hsl(${this.hue}, 100%, 50%)`;
        
        // Glow pulsing
        this.glowIntensity = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
        
        // Update sparkles
        this.updateSparkles(deltaTime);
    }
    
    updateSparkles(deltaTime) {
        for (const sparkle of this.sparkles) {
            sparkle.phase += sparkle.speed * deltaTime;
            sparkle.angle += 0.001 * deltaTime;
        }
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

        // Glow effect
        this.renderGlow(ctx);

        // Main brick with rainbow gradient
        this.renderRainbowBrick(ctx);

        // Sparkle effects
        this.renderSparkles(ctx);

        // Mystery symbol
        this.renderMysterySymbol(ctx);

        // Flash effect
        if (this.flashIntensity > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashIntensity})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        // Damage effect (shouldn't be visible for 1-hit bricks)
        if (this.damageAlpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.damageAlpha})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        ctx.restore();
    }
    
    renderGlow(ctx) {
        ctx.save();
        
        // Outer glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15 * this.glowIntensity;
        ctx.fillStyle = this.color;
        ctx.fillRect(-2, -2, this.width + 4, this.height + 4);
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    
    renderRainbowBrick(ctx) {
        // Create rainbow gradient
        const gradient = ctx.createLinearGradient(0, 0, this.width, 0);
        
        // Add multiple color stops for rainbow effect
        for (let i = 0; i <= 6; i++) {
            const hue = (this.hue + i * 60) % 360;
            const color = `hsl(${hue}, 100%, 50%)`;
            gradient.addColorStop(i / 6, color);
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Add shimmer effect
        const shimmerGradient = ctx.createLinearGradient(0, 0, 0, this.height);
        shimmerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        shimmerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
        
        ctx.fillStyle = shimmerGradient;
        ctx.fillRect(0, 0, this.width, this.height);
    }
    
    renderSparkles(ctx) {
        ctx.save();
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        for (const sparkle of this.sparkles) {
            const x = centerX + Math.cos(sparkle.angle) * sparkle.radius;
            const y = centerY + Math.sin(sparkle.angle) * sparkle.radius;
            const alpha = 0.5 + Math.sin(sparkle.phase) * 0.5;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, sparkle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Star sparkle effect
            this.renderStar(ctx, x, y, sparkle.size * 2, alpha);
        }
        
        ctx.restore();
    }
    
    renderStar(ctx, x, y, size, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        
        // Draw 4-pointed star
        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderMysterySymbol(ctx) {
        ctx.save();
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const symbolSize = 12;
        
        // Question mark symbol with glow
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${symbolSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', centerX, centerY);
        
        ctx.restore();
    }
    
    hit(ball) {
        // Trigger bonus effect before destruction
        this.triggerBonusEffect();
        
        // Create spectacular destruction effect
        this.createMysteryDestructionEffect();
        
        // Call parent hit method
        return super.hit(ball);
    }
    
    triggerBonusEffect() {
        const effect = this.bonusEffects[Math.floor(Math.random() * this.bonusEffects.length)];
        const center = this.getCenter();
        
        switch (effect) {
            case 'points':
                this.grantBonusPoints();
                break;
            case 'powerup':
                this.spawnBonusPowerUp();
                break;
            case 'extraball':
                this.grantExtraBall();
                break;
            case 'combo':
                this.grantComboBonus();
                break;
        }
        
        // Visual feedback for bonus
        eventBus.emit('effects:bonusReveal', {
            position: center,
            effect: effect,
            color: this.color
        });
    }
    
    grantBonusPoints() {
        const bonusPoints = 200 + Math.floor(Math.random() * 300);
        
        eventBus.emit('score:bonus', {
            points: bonusPoints,
            source: 'mystery',
            position: this.getCenter()
        });
        
        eventBus.emit('ui:showFloatingText', {
            text: `+${bonusPoints}!`,
            position: this.getCenter(),
            color: '#FFD700',
            size: 16
        });
    }
    
    spawnBonusPowerUp() {
        eventBus.emit('powerup:spawn', {
            position: this.getCenter(),
            type: 'random',
            source: 'mystery'
        });
        
        eventBus.emit('ui:showFloatingText', {
            text: 'Power-Up!',
            position: this.getCenter(),
            color: '#00FFFF',
            size: 14
        });
    }
    
    grantExtraBall() {
        eventBus.emit('game:extraBall', {
            source: 'mystery'
        });
        
        eventBus.emit('ui:showFloatingText', {
            text: 'Extra Ball!',
            position: this.getCenter(),
            color: '#FF00FF',
            size: 14
        });
    }
    
    grantComboBonus() {
        eventBus.emit('combo:bonus', {
            amount: 5,
            source: 'mystery'
        });
        
        eventBus.emit('ui:showFloatingText', {
            text: '+5 Combo!',
            position: this.getCenter(),
            color: '#00FF00',
            size: 14
        });
    }
    
    createMysteryDestructionEffect() {
        const center = this.getCenter();
        
        // Rainbow explosion particles
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 0.1 + Math.random() * 0.2;
            const hue = (this.hue + i * 12) % 360;
            
            eventBus.emit('particle:create', {
                x: center.x,
                y: center.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1000 + Math.random() * 500,
                size: 2 + Math.random() * 3,
                color: `hsl(${hue}, 100%, 50%)`,
                gravity: 0.0001
            });
        }
        
        // Screen flash with rainbow colors
        eventBus.emit('effects:colorFlash', {
            color: this.color,
            intensity: 0.3
        });
        
        // Screen shake
        eventBus.emit('effects:screenShake', { intensity: 5 });
    }
    
    triggerHitEffect() {
        // Enhanced hit effect for mystery bricks
        super.triggerHitEffect();
        
        // Additional rainbow particle burst
        const center = this.getCenter();
        const burstCount = 15;
        
        for (let i = 0; i < burstCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.05 + Math.random() * 0.1;
            const hue = Math.random() * 360;
            
            eventBus.emit('particle:create', {
                x: center.x,
                y: center.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 800,
                size: 1 + Math.random() * 2,
                color: `hsl(${hue}, 100%, 50%)`,
                gravity: 0.0002
            });
        }
    }
    
    getDebugInfo() {
        return {
            ...super.getDebugInfo(),
            type: this.type,
            hue: this.hue,
            glowIntensity: this.glowIntensity,
            sparkleCount: this.sparkles.length,
            bonusEffects: this.bonusEffects
        };
    }
}
