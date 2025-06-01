import { eventBus } from '../core/EventBus.js';
import { Config } from '../utils/Config.js';

/**
 * EffectsSystem - Centralized visual effects management
 * Handles screen shake, color flashes, particle effects, and visual spectacle
 */
export class EffectsSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Screen shake
        this.shakeOffset = { x: 0, y: 0 };
        this.shakeIntensity = 0;
        this.shakeDecay = 0.9;
        
        // Color flash
        this.flashColor = null;
        this.flashIntensity = 0;
        this.flashDecay = 0.95;
        
        // Background effects
        this.backgroundHue = 220; // Blue base
        this.backgroundIntensity = 0;
        this.pulsePhase = 0;
        
        // Trail effects
        this.ballTrails = new Map();
        this.maxTrailLength = 20;
        
        // Particle pools for performance
        this.particlePool = [];
        this.activeParticles = [];
        this.maxParticles = 500;
        
        this.initializeParticlePool();
        this.setupEventListeners();
    }
    
    initializeParticlePool() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push(this.createParticle());
        }
    }
    
    createParticle() {
        return {
            x: 0, y: 0,
            vx: 0, vy: 0,
            life: 0, maxLife: 1000,
            size: 2, color: '#FFFFFF',
            alpha: 1, decay: 0.98,
            active: false
        };
    }
    
    setupEventListeners() {
        eventBus.on('effects:screenShake', (data) => this.addScreenShake(data.intensity));
        eventBus.on('effects:colorFlash', (data) => this.addColorFlash(data.color, data.intensity));
        eventBus.on('effects:comboParticles', (data) => this.createComboParticles(data));
        eventBus.on('brick:destroyed', (data) => this.createBrickParticles(data));
        eventBus.on('ball:trail', (data) => this.updateBallTrail(data));
        eventBus.on('powerup:collected', (data) => this.createPowerUpEffect(data));
        eventBus.on('game:reset', () => this.reset());
    }
    
    update(deltaTime) {
        this.updateScreenShake(deltaTime);
        this.updateColorFlash(deltaTime);
        this.updateBackground(deltaTime);
        this.updateParticles(deltaTime);
        this.updateTrails(deltaTime);
    }
    
    updateScreenShake(deltaTime) {
        if (this.shakeIntensity > 0) {
            // Generate random shake offset
            const angle = Math.random() * Math.PI * 2;
            this.shakeOffset.x = Math.cos(angle) * this.shakeIntensity;
            this.shakeOffset.y = Math.sin(angle) * this.shakeIntensity;
            
            // Decay shake intensity
            this.shakeIntensity *= this.shakeDecay;
            
            if (this.shakeIntensity < 0.1) {
                this.shakeIntensity = 0;
                this.shakeOffset.x = 0;
                this.shakeOffset.y = 0;
            }
        }
    }
    
    updateColorFlash(deltaTime) {
        if (this.flashIntensity > 0) {
            this.flashIntensity *= this.flashDecay;
            
            if (this.flashIntensity < 0.01) {
                this.flashIntensity = 0;
                this.flashColor = null;
            }
        }
    }
    
    updateBackground(deltaTime) {
        this.pulsePhase += deltaTime * 0.002;
        
        // Background intensity based on game state
        // This will be enhanced when we integrate with combo system
        this.backgroundIntensity = 0.1 + Math.sin(this.pulsePhase) * 0.05;
    }
    
    updateParticles(deltaTime) {
        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const particle = this.activeParticles[i];
            
            // Update position
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Update life
            particle.life -= deltaTime;
            particle.alpha *= particle.decay;
            
            // Apply gravity if specified
            if (particle.gravity) {
                particle.vy += particle.gravity * deltaTime;
            }
            
            // Remove dead particles
            if (particle.life <= 0 || particle.alpha < 0.01) {
                particle.active = false;
                this.activeParticles.splice(i, 1);
                this.particlePool.push(particle);
            }
        }
    }
    
    updateTrails(deltaTime) {
        // Clean up old trail points
        for (const [ballId, trail] of this.ballTrails) {
            for (let i = trail.length - 1; i >= 0; i--) {
                trail[i].life -= deltaTime;
                if (trail[i].life <= 0) {
                    trail.splice(i, 1);
                }
            }
            
            // Remove empty trails
            if (trail.length === 0) {
                this.ballTrails.delete(ballId);
            }
        }
    }
    
    addScreenShake(intensity) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }
    
    addColorFlash(color, intensity) {
        this.flashColor = color;
        this.flashIntensity = Math.max(this.flashIntensity, intensity);
    }
    
    createComboParticles(data) {
        const { combo, multiplier, position } = data;
        const particleCount = Math.min(combo * 2, 50);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle();
            if (!particle) break;
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 0.1 + Math.random() * 0.2;
            
            particle.x = position.x;
            particle.y = position.y;
            particle.vx = Math.cos(angle) * speed * multiplier;
            particle.vy = Math.sin(angle) * speed * multiplier;
            particle.life = 1000 + combo * 100;
            particle.maxLife = particle.life;
            particle.size = 2 + multiplier * 0.5;
            particle.color = this.getComboColor(combo);
            particle.alpha = 1;
            particle.decay = 0.995;
            particle.active = true;
            
            this.activeParticles.push(particle);
        }
    }
    
    createBrickParticles(data) {
        const { position, color, points } = data;
        const particleCount = Math.min(points / 2, 20);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle();
            if (!particle) break;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.05 + Math.random() * 0.15;
            
            particle.x = position.x + (Math.random() - 0.5) * 40;
            particle.y = position.y + (Math.random() - 0.5) * 20;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed - 0.1; // Slight upward bias
            particle.life = 800 + Math.random() * 400;
            particle.maxLife = particle.life;
            particle.size = 1 + Math.random() * 2;
            particle.color = color;
            particle.alpha = 1;
            particle.decay = 0.99;
            particle.gravity = 0.0002;
            particle.active = true;
            
            this.activeParticles.push(particle);
        }
    }
    
    createPowerUpEffect(data) {
        const { position, type } = data;
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle();
            if (!particle) break;
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 0.08 + Math.random() * 0.12;
            
            particle.x = position.x;
            particle.y = position.y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.life = 1200;
            particle.maxLife = particle.life;
            particle.size = 3;
            particle.color = this.getPowerUpColor(type);
            particle.alpha = 1;
            particle.decay = 0.995;
            particle.active = true;
            
            this.activeParticles.push(particle);
        }
    }
    
    updateBallTrail(data) {
        const { ballId, position, speed, combo } = data;
        
        if (!this.ballTrails.has(ballId)) {
            this.ballTrails.set(ballId, []);
        }
        
        const trail = this.ballTrails.get(ballId);
        
        // Add new trail point
        trail.push({
            x: position.x,
            y: position.y,
            life: 300 + speed * 100, // Longer trails for faster balls
            maxLife: 300 + speed * 100,
            intensity: Math.min(1, speed / 0.5),
            combo: combo || 0
        });
        
        // Limit trail length
        if (trail.length > this.maxTrailLength) {
            trail.shift();
        }
    }
    
    getParticle() {
        return this.particlePool.pop();
    }
    
    getComboColor(combo) {
        if (combo >= 25) return '#FF0080'; // Hot pink
        if (combo >= 15) return '#FF4400'; // Red-orange
        if (combo >= 10) return '#FF8800'; // Orange
        if (combo >= 5) return '#FFAA00';  // Yellow
        return '#00AA00'; // Green
    }
    
    getPowerUpColor(type) {
        const colors = {
            'wide': '#00FFFF',
            'multi': '#FF00FF',
            'laser': '#00FFFF',
            'sticky': '#00FF00',
            'fireball': '#FF6600',
            'timeSlow': '#8800FF'
        };
        return colors[type] || '#FFFFFF';
    }
    
    // Rendering methods
    renderBackground() {
        if (this.backgroundIntensity > 0) {
            const gradient = this.ctx.createRadialGradient(
                this.canvas.width / 2, this.canvas.height / 2, 0,
                this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
            );
            
            const alpha = this.backgroundIntensity * 0.3;
            gradient.addColorStop(0, `hsla(${this.backgroundHue}, 50%, 20%, ${alpha})`);
            gradient.addColorStop(1, `hsla(${this.backgroundHue}, 30%, 10%, ${alpha * 0.5})`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    renderColorFlash() {
        if (this.flashIntensity > 0 && this.flashColor) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.fillStyle = this.flashColor;
            this.ctx.globalAlpha = this.flashIntensity;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
    }
    
    renderParticles() {
        this.ctx.save();
        
        for (const particle of this.activeParticles) {
            if (!particle.active) continue;
            
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    renderTrails() {
        this.ctx.save();
        
        for (const [ballId, trail] of this.ballTrails) {
            if (trail.length < 2) continue;
            
            this.ctx.strokeStyle = trail[0].combo > 10 ? '#FF4400' : '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';
            
            for (let i = 1; i < trail.length; i++) {
                const point = trail[i];
                const prevPoint = trail[i - 1];
                const alpha = point.life / point.maxLife;
                
                this.ctx.globalAlpha = alpha * point.intensity;
                this.ctx.beginPath();
                this.ctx.moveTo(prevPoint.x, prevPoint.y);
                this.ctx.lineTo(point.x, point.y);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    applyScreenShake() {
        if (this.shakeIntensity > 0) {
            this.ctx.translate(this.shakeOffset.x, this.shakeOffset.y);
        }
    }
    
    resetScreenShake() {
        if (this.shakeIntensity > 0) {
            this.ctx.translate(-this.shakeOffset.x, -this.shakeOffset.y);
        }
    }
    
    render() {
        // Background effects
        this.renderBackground();
        
        // Apply screen shake
        this.applyScreenShake();
        
        // Render trails (behind everything)
        this.renderTrails();
        
        // Reset shake for UI elements
        this.resetScreenShake();
        
        // Render particles (on top)
        this.renderParticles();
        
        // Color flash (on top of everything)
        this.renderColorFlash();
    }
    
    reset() {
        this.shakeIntensity = 0;
        this.shakeOffset = { x: 0, y: 0 };
        this.flashIntensity = 0;
        this.flashColor = null;
        this.backgroundIntensity = 0;
        this.pulsePhase = 0;
        
        // Return all particles to pool
        for (const particle of this.activeParticles) {
            particle.active = false;
            this.particlePool.push(particle);
        }
        this.activeParticles = [];
        
        // Clear trails
        this.ballTrails.clear();
    }
    
    getDebugInfo() {
        return {
            shakeIntensity: this.shakeIntensity,
            flashIntensity: this.flashIntensity,
            activeParticles: this.activeParticles.length,
            availableParticles: this.particlePool.length,
            activeTrails: this.ballTrails.size,
            backgroundIntensity: this.backgroundIntensity
        };
    }
}
