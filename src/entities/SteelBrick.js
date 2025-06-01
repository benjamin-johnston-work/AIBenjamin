import { Brick } from './Brick.js';
import { Config } from '../utils/Config.js';
import { eventBus } from '../core/EventBus.js';

/**
 * SteelBrick - Requires multiple hits to destroy, shows progressive damage
 */
export class SteelBrick extends Brick {
    constructor(x, y) {
        super(x, y, {
            hits: Config.SPECIAL_BRICKS.STEEL.MAX_HITS,
            maxHits: Config.SPECIAL_BRICKS.STEEL.MAX_HITS,
            color: Config.SPECIAL_BRICKS.STEEL.COLOR,
            points: Config.SPECIAL_BRICKS.STEEL.POINTS
        });
        
        this.type = 'steel';
        this.rivetPattern = true;
        this.metalGlint = 0;
        this.crackPattern = [];
        
        this.addTag('steel');
        this.addTag('special');
        this.addTag('durable');
    }
    
    onUpdate(deltaTime) {
        super.onUpdate(deltaTime);
        
        // Metal glint animation
        this.metalGlint += deltaTime * 0.003;
        
        // Update crack pattern based on damage
        this.updateCrackPattern();
    }
    
    updateCrackPattern() {
        const damageLevel = this.maxHits - this.hits;
        const targetCracks = damageLevel * 2;
        
        // Add cracks as damage increases
        while (this.crackPattern.length < targetCracks) {
            this.crackPattern.push({
                startX: Math.random() * this.width,
                startY: Math.random() * this.height,
                endX: Math.random() * this.width,
                endY: Math.random() * this.height,
                intensity: 0.3 + Math.random() * 0.4
            });
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

        // Main brick color (metallic base)
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, this.width, this.height);

        // Metallic gradient overlay
        this.renderMetallicSurface(ctx);

        // Rivet pattern
        this.renderRivetPattern(ctx);

        // Crack pattern for damage
        this.renderCrackPattern(ctx);

        // Metal glint effect
        this.renderMetalGlint(ctx);

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

        // Hit indicator for remaining hits
        this.drawHitIndicator(ctx);

        ctx.restore();
    }
    
    renderMetallicSurface(ctx) {
        // Create metallic gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
    }
    
    renderRivetPattern(ctx) {
        ctx.save();
        
        const rivetSize = 3;
        const spacing = 15;
        
        ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.6)';
        ctx.lineWidth = 1;
        
        // Draw rivets in a grid pattern
        for (let x = spacing; x < this.width; x += spacing) {
            for (let y = spacing; y < this.height; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, rivetSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                
                // Rivet highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.beginPath();
                ctx.arc(x - 1, y - 1, rivetSize * 0.6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
            }
        }
        
        ctx.restore();
    }
    
    renderCrackPattern(ctx) {
        if (this.crackPattern.length === 0) return;
        
        ctx.save();
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        
        for (const crack of this.crackPattern) {
            ctx.globalAlpha = crack.intensity;
            ctx.beginPath();
            ctx.moveTo(crack.startX, crack.startY);
            ctx.lineTo(crack.endX, crack.endY);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    renderMetalGlint(ctx) {
        const glintPosition = (this.metalGlint % 1) * (this.width + 20) - 10;
        
        if (glintPosition >= 0 && glintPosition <= this.width) {
            ctx.save();
            
            const gradient = ctx.createLinearGradient(
                glintPosition - 5, 0,
                glintPosition + 5, 0
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(glintPosition - 5, 0, 10, this.height);
            
            ctx.restore();
        }
    }
    
    hit(ball) {
        // Create spark particles on hit
        this.createSparkParticles();
        
        // Enhanced hit effect for steel
        this.triggerSteelHitEffect();
        
        // Call parent hit method
        const destroyed = super.hit(ball);
        
        if (destroyed) {
            this.createMetalBreakEffect();
        }
        
        return destroyed;
    }
    
    createSparkParticles() {
        const center = this.getCenter();
        const sparkCount = 15;
        
        for (let i = 0; i < sparkCount; i++) {
            eventBus.emit('particle:create', {
                x: center.x + (Math.random() - 0.5) * this.width,
                y: center.y + (Math.random() - 0.5) * this.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                life: 500 + Math.random() * 300,
                size: 1 + Math.random() * 2,
                color: this.getSparkColor(),
                gravity: 0.0003
            });
        }
    }
    
    createMetalBreakEffect() {
        const center = this.getCenter();
        const fragmentCount = 20;
        
        // Metal fragments
        for (let i = 0; i < fragmentCount; i++) {
            eventBus.emit('particle:create', {
                x: center.x,
                y: center.y,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                life: 1000 + Math.random() * 500,
                size: 2 + Math.random() * 3,
                color: '#888888',
                gravity: 0.0002
            });
        }
        
        // Screen shake for satisfying destruction
        eventBus.emit('effects:screenShake', { intensity: 6 });
    }
    
    getSparkColor() {
        const colors = ['#FFFF00', '#FFAA00', '#FFFFFF', '#FFDD44'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    triggerSteelHitEffect() {
        // Enhanced hit effect for steel bricks
        super.triggerHitEffect();
        
        // Additional metallic sound effect (visual feedback)
        eventBus.emit('effects:screenShake', { intensity: 3 });
        
        // Flash effect with metallic color
        eventBus.emit('effects:colorFlash', {
            color: '#CCCCCC',
            intensity: 0.2
        });
    }
    
    drawHitIndicator(ctx) {
        // Custom hit indicator for steel bricks
        const indicatorSize = 4;
        const spacing = 2;
        const startX = this.width - (this.maxHits * (indicatorSize + spacing)) + spacing;
        const y = this.height - indicatorSize - 2;

        for (let i = 0; i < this.maxHits; i++) {
            const x = startX + i * (indicatorSize + spacing);
            
            if (i < this.hits) {
                // Remaining hits - metallic
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
            } else {
                // Used hits - damaged metal
                ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
                ctx.strokeStyle = 'rgba(50, 50, 50, 0.8)';
            }
            
            ctx.fillRect(x, y, indicatorSize, indicatorSize);
            ctx.strokeRect(x, y, indicatorSize, indicatorSize);
        }
    }
    
    getDebugInfo() {
        return {
            ...super.getDebugInfo(),
            type: this.type,
            cracksCount: this.crackPattern.length,
            metalGlint: this.metalGlint,
            damageLevel: this.maxHits - this.hits
        };
    }
}
