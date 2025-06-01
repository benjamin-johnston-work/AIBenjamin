import { Brick } from './Brick.js';
import { Config } from '../utils/Config.js';
import { eventBus } from '../core/EventBus.js';

/**
 * ChainBrick - Creates lightning chain reactions to nearby chain bricks
 */
export class ChainBrick extends Brick {
    constructor(x, y) {
        super(x, y, {
            hits: 1,
            maxHits: 1,
            color: Config.SPECIAL_BRICKS.CHAIN.COLOR,
            points: Config.SPECIAL_BRICKS.CHAIN.POINTS
        });
        
        this.type = 'chain';
        this.chainRadius = Config.SPECIAL_BRICKS.CHAIN.CHAIN_RADIUS;
        this.lightningPhase = 0;
        this.electricIntensity = 0;
        this.chainTargets = [];
        this.isChaining = false;
        
        this.addTag('chain');
        this.addTag('special');
        this.addTag('electric');
    }
    
    onUpdate(deltaTime) {
        super.onUpdate(deltaTime);
        
        // Lightning animation
        this.lightningPhase += deltaTime * 0.008;
        this.electricIntensity = 0.4 + Math.sin(this.lightningPhase) * 0.3;
        
        // Update chain targets periodically
        if (Math.random() < 0.01) { // 1% chance per frame
            this.findChainTargets();
        }
    }
    
    findChainTargets() {
        // This will be called by the collision system to find nearby chain bricks
        eventBus.emit('chain:findTargets', {
            source: this,
            position: this.getCenter(),
            radius: this.chainRadius
        });
    }
    
    setChainTargets(targets) {
        this.chainTargets = targets;
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

        // Electric glow effect
        this.renderElectricGlow(ctx);

        // Main brick color
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, this.width, this.height);

        // Lightning pattern overlay
        this.renderLightningPattern(ctx);

        // Electric border
        this.renderElectricBorder(ctx);

        // Chain connection indicators
        this.renderChainConnections(ctx);

        // Lightning bolt symbol
        this.renderLightningSymbol(ctx);

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

        ctx.restore();
    }
    
    renderElectricGlow(ctx) {
        ctx.save();
        
        // Pulsing electric glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12 * this.electricIntensity;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(-3, -3, this.width + 6, this.height + 6);
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    
    renderLightningPattern(ctx) {
        ctx.save();
        
        // Create jagged lightning pattern across the brick
        const segments = 8;
        const amplitude = 3;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.electricIntensity})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        // Horizontal lightning
        ctx.beginPath();
        ctx.moveTo(0, this.height / 2);
        
        for (let i = 1; i <= segments; i++) {
            const x = (i / segments) * this.width;
            const y = this.height / 2 + (Math.random() - 0.5) * amplitude;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Vertical lightning
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        
        for (let i = 1; i <= segments; i++) {
            const x = this.width / 2 + (Math.random() - 0.5) * amplitude;
            const y = (i / segments) * this.height;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderElectricBorder(ctx) {
        ctx.save();
        
        // Electric border effect
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.electricIntensity * 0.8})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.lineDashOffset = this.lightningPhase * 10;
        
        ctx.strokeRect(0, 0, this.width, this.height);
        
        ctx.restore();
    }
    
    renderChainConnections(ctx) {
        if (this.chainTargets.length === 0) return;
        
        ctx.save();
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Draw connection indicators to nearby chain bricks
        for (const target of this.chainTargets) {
            if (!target.visible) continue;
            
            const targetCenter = target.getCenter();
            const myCenter = this.getCenter();
            
            // Calculate direction to target
            const dx = targetCenter.x - myCenter.x;
            const dy = targetCenter.y - myCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.chainRadius) {
                // Draw connection line
                const alpha = 0.3 * this.electricIntensity;
                ctx.strokeStyle = `rgba(0, 170, 255, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 3]);
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                
                // Convert target position to local coordinates
                const localTargetX = centerX + dx;
                const localTargetY = centerY + dy;
                
                ctx.lineTo(localTargetX, localTargetY);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
    
    renderLightningSymbol(ctx) {
        ctx.save();
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const symbolSize = 10;
        
        // Lightning bolt symbol
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 + this.electricIntensity * 0.1})`;
        ctx.font = `bold ${symbolSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', centerX, centerY);
        
        ctx.restore();
    }
    
    hit(ball) {
        // Trigger chain reaction before destruction
        this.triggerChainReaction();
        
        // Call parent hit method
        return super.hit(ball);
    }
    
    triggerChainReaction() {
        if (this.isChaining) return; // Prevent infinite loops
        
        this.isChaining = true;
        
        // Create lightning effects to all targets
        this.createLightningEffects();
        
        // Trigger chain reaction
        eventBus.emit('chain:reaction', {
            source: this,
            targets: this.chainTargets,
            position: this.getCenter()
        });
        
        // Screen effects
        eventBus.emit('effects:screenShake', { intensity: 4 });
        eventBus.emit('effects:colorFlash', {
            color: '#00AAFF',
            intensity: 0.25
        });
    }
    
    createLightningEffects() {
        const center = this.getCenter();
        
        // Lightning particles
        const particleCount = 25;
        for (let i = 0; i < particleCount; i++) {
            eventBus.emit('particle:create', {
                x: center.x,
                y: center.y,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                life: 800 + Math.random() * 400,
                size: 1 + Math.random() * 2,
                color: this.getLightningColor(),
                gravity: 0
            });
        }
        
        // Create lightning bolts to each target
        for (const target of this.chainTargets) {
            if (!target.visible || target.isChaining) continue;
            
            this.createLightningBolt(center, target.getCenter());
        }
    }
    
    createLightningBolt(start, end) {
        // Create visual lightning bolt effect
        eventBus.emit('effects:lightning', {
            start: start,
            end: end,
            color: this.color,
            intensity: this.electricIntensity
        });
        
        // Create particles along the lightning path
        const segments = 10;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = start.x + (end.x - start.x) * t;
            const y = start.y + (end.y - start.y) * t;
            
            eventBus.emit('particle:create', {
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1,
                life: 600,
                size: 2,
                color: '#FFFFFF',
                gravity: 0
            });
        }
    }
    
    getLightningColor() {
        const colors = ['#00AAFF', '#FFFFFF', '#AAEEFF', '#0088CC'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    triggerHitEffect() {
        // Enhanced hit effect for chain bricks
        super.triggerHitEffect();
        
        // Electric spark effect
        const center = this.getCenter();
        const sparkCount = 12;
        
        for (let i = 0; i < sparkCount; i++) {
            const angle = (i / sparkCount) * Math.PI * 2;
            const speed = 0.08 + Math.random() * 0.12;
            
            eventBus.emit('particle:create', {
                x: center.x,
                y: center.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 500,
                size: 1 + Math.random(),
                color: this.getLightningColor(),
                gravity: 0
            });
        }
    }
    
    // Called by other chain bricks to trigger this one
    chainActivate() {
        if (this.isChaining || !this.visible) return;
        
        // Simulate being hit for chain reaction
        this.triggerChainReaction();
        this.destroy();
        
        eventBus.emit('brick:destroyed', {
            brick: this,
            ball: null, // No ball involved in chain reaction
            points: this.points,
            source: 'chain'
        });
    }
    
    getDebugInfo() {
        return {
            ...super.getDebugInfo(),
            type: this.type,
            chainRadius: this.chainRadius,
            lightningPhase: this.lightningPhase,
            electricIntensity: this.electricIntensity,
            chainTargets: this.chainTargets.length,
            isChaining: this.isChaining
        };
    }
}
