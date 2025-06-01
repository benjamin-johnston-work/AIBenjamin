/**
 * Collision Detection System
 */
import { MathUtils } from '../utils/MathUtils.js';
import { eventBus, GameEvents } from '../core/EventBus.js';

export class CollisionSystem {
    constructor(entityManager) {
        this.entityManager = entityManager;
        this.collisionPairs = new Map();
        this.lastCollisionTime = new Map();
        this.minCollisionInterval = 50; // Prevent rapid re-collisions
    }

    /**
     * Update collision detection
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        this.checkBallPaddleCollisions();
        this.checkBallBrickCollisions();
        this.checkPowerUpPaddleCollisions();
        this.cleanupOldCollisions();
    }

    /**
     * Check collisions between balls and paddle
     */
    checkBallPaddleCollisions() {
        const balls = this.entityManager.getEntitiesByType('Ball');
        const paddles = this.entityManager.getEntitiesByType('Paddle');

        balls.forEach(ball => {
            if (ball.onPaddle) return; // Skip balls on paddle

            paddles.forEach(paddle => {
                if (this.canCollide(ball, paddle) && this.isBallPaddleColliding(ball, paddle)) {
                    this.handleBallPaddleCollision(ball, paddle);
                }
            });
        });
    }

    /**
     * Check collisions between balls and bricks
     */
    checkBallBrickCollisions() {
        const balls = this.entityManager.getEntitiesByType('Ball');
        const bricks = this.entityManager.getEntitiesByType('Brick');

        balls.forEach(ball => {
            if (ball.onPaddle) return; // Skip balls on paddle

            bricks.forEach(brick => {
                if (brick.visible && this.canCollide(ball, brick) && this.isBallBrickColliding(ball, brick)) {
                    this.handleBallBrickCollision(ball, brick);
                }
            });
        });
    }

    /**
     * Check collisions between power-ups and paddle
     */
    checkPowerUpPaddleCollisions() {
        const powerUps = this.entityManager.getEntitiesByType('PowerUp');
        const paddles = this.entityManager.getEntitiesByType('Paddle');

        powerUps.forEach(powerUp => {
            paddles.forEach(paddle => {
                if (this.isPowerUpPaddleColliding(powerUp, paddle)) {
                    this.handlePowerUpPaddleCollision(powerUp, paddle);
                }
            });
        });
    }

    /**
     * Check if ball is colliding with paddle
     * @param {Ball} ball - Ball entity
     * @param {Paddle} paddle - Paddle entity
     * @returns {boolean} True if colliding
     */
    isBallPaddleColliding(ball, paddle) {
        // Only check collision if ball is moving downward
        if (ball.velocity.y <= 0) return false;

        const ballBounds = {
            x: ball.position.x - ball.radius,
            y: ball.position.y - ball.radius,
            width: ball.radius * 2,
            height: ball.radius * 2
        };

        const paddleBounds = paddle.getBounds();

        return MathUtils.rectIntersect(ballBounds, paddleBounds);
    }

    /**
     * Check if ball is colliding with brick
     * @param {Ball} ball - Ball entity
     * @param {Brick} brick - Brick entity
     * @returns {boolean} True if colliding
     */
    isBallBrickColliding(ball, brick) {
        const ballCenter = { x: ball.position.x, y: ball.position.y, radius: ball.radius };
        const brickBounds = brick.getBounds();

        return MathUtils.circleRectIntersect(ballCenter, brickBounds);
    }

    /**
     * Check if power-up is colliding with paddle
     * @param {PowerUp} powerUp - PowerUp entity
     * @param {Paddle} paddle - Paddle entity
     * @returns {boolean} True if colliding
     */
    isPowerUpPaddleColliding(powerUp, paddle) {
        const powerUpBounds = powerUp.getBounds();
        const paddleBounds = paddle.getBounds();

        return MathUtils.rectIntersect(powerUpBounds, paddleBounds);
    }

    /**
     * Handle ball-paddle collision
     * @param {Ball} ball - Ball entity
     * @param {Paddle} paddle - Paddle entity
     */
    handleBallPaddleCollision(ball, paddle) {
        // Get AI assistance level (this would come from the AI system)
        const assistanceLevel = this.getAIAssistanceLevel();
        
        // Handle collision using ball's method
        ball.handlePaddleCollision(paddle, assistanceLevel);
        
        // Record collision
        this.recordCollision(ball, paddle);
        
        // Emit collision event
        eventBus.emit(GameEvents.COLLISION_DETECTED, {
            type: 'ball-paddle',
            ball: ball,
            paddle: paddle
        });
    }

    /**
     * Handle ball-brick collision
     * @param {Ball} ball - Ball entity
     * @param {Brick} brick - Brick entity
     */
    handleBallBrickCollision(ball, brick) {
        // Handle collision using ball's method
        ball.handleBrickCollision(brick);
        
        // Handle brick being hit
        const destroyed = brick.hit(ball);
        
        // Record collision
        this.recordCollision(ball, brick);
        
        // Emit collision event
        eventBus.emit(GameEvents.COLLISION_DETECTED, {
            type: 'ball-brick',
            ball: ball,
            brick: brick,
            destroyed: destroyed
        });
    }

    /**
     * Handle power-up-paddle collision
     * @param {PowerUp} powerUp - PowerUp entity
     * @param {Paddle} paddle - Paddle entity
     */
    handlePowerUpPaddleCollision(powerUp, paddle) {
        // Handle collection using power-up's method
        powerUp.collect(paddle);
        
        // Emit collision event
        eventBus.emit(GameEvents.COLLISION_DETECTED, {
            type: 'powerup-paddle',
            powerUp: powerUp,
            paddle: paddle
        });
    }

    /**
     * Check if two entities can collide (prevents rapid re-collisions)
     * @param {Entity} entity1 - First entity
     * @param {Entity} entity2 - Second entity
     * @returns {boolean} True if entities can collide
     */
    canCollide(entity1, entity2) {
        const pairKey = this.getCollisionPairKey(entity1, entity2);
        const lastTime = this.lastCollisionTime.get(pairKey) || 0;
        const currentTime = Date.now();
        
        return currentTime - lastTime >= this.minCollisionInterval;
    }

    /**
     * Record a collision between two entities
     * @param {Entity} entity1 - First entity
     * @param {Entity} entity2 - Second entity
     */
    recordCollision(entity1, entity2) {
        const pairKey = this.getCollisionPairKey(entity1, entity2);
        this.lastCollisionTime.set(pairKey, Date.now());
    }

    /**
     * Get collision pair key for two entities
     * @param {Entity} entity1 - First entity
     * @param {Entity} entity2 - Second entity
     * @returns {string} Collision pair key
     */
    getCollisionPairKey(entity1, entity2) {
        const id1 = entity1.id;
        const id2 = entity2.id;
        return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
    }

    /**
     * Clean up old collision records
     */
    cleanupOldCollisions() {
        const currentTime = Date.now();
        const maxAge = 1000; // 1 second

        for (const [key, time] of this.lastCollisionTime.entries()) {
            if (currentTime - time > maxAge) {
                this.lastCollisionTime.delete(key);
            }
        }
    }

    /**
     * Get AI assistance level (placeholder - would be provided by AI system)
     * @returns {number} AI assistance level (0-2)
     */
    getAIAssistanceLevel() {
        // This would be provided by the AI system
        // For now, return 0 (no assistance)
        return 0;
    }

    /**
     * Set AI assistance level
     * @param {number} level - Assistance level (0-2)
     */
    setAIAssistanceLevel(level) {
        this.aiAssistanceLevel = level;
    }

    /**
     * Check collision between two arbitrary entities
     * @param {Entity} entity1 - First entity
     * @param {Entity} entity2 - Second entity
     * @returns {boolean} True if colliding
     */
    checkEntityCollision(entity1, entity2) {
        const bounds1 = entity1.getBounds();
        const bounds2 = entity2.getBounds();
        
        return MathUtils.rectIntersect(bounds1, bounds2);
    }

    /**
     * Check collision between circle and rectangle
     * @param {Object} circle - Circle with x, y, radius
     * @param {Object} rect - Rectangle with x, y, width, height
     * @returns {boolean} True if colliding
     */
    checkCircleRectCollision(circle, rect) {
        return MathUtils.circleRectIntersect(circle, rect);
    }

    /**
     * Get all entities colliding with a given entity
     * @param {Entity} entity - Entity to check collisions for
     * @param {string} targetType - Type of entities to check against (optional)
     * @returns {Array<Entity>} Array of colliding entities
     */
    getCollidingEntities(entity, targetType = null) {
        const entities = targetType ? 
            this.entityManager.getEntitiesByType(targetType) : 
            this.entityManager.getAllEntities();
        
        return entities.filter(other => {
            return other !== entity && 
                   other.active && 
                   this.checkEntityCollision(entity, other);
        });
    }

    /**
     * Check if a point is inside any entity of a given type
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} entityType - Type of entities to check
     * @returns {Entity|null} Entity containing the point, or null
     */
    getEntityAtPoint(x, y, entityType) {
        const entities = this.entityManager.getEntitiesByType(entityType);
        
        for (const entity of entities) {
            if (entity.active && entity.containsPoint && entity.containsPoint(x, y)) {
                return entity;
            }
        }
        
        return null;
    }

    /**
     * Perform a raycast to find the first entity hit
     * @param {number} startX - Ray start X
     * @param {number} startY - Ray start Y
     * @param {number} dirX - Ray direction X
     * @param {number} dirY - Ray direction Y
     * @param {number} maxDistance - Maximum ray distance
     * @param {string} entityType - Type of entities to check (optional)
     * @returns {Object|null} Hit result with entity and distance, or null
     */
    raycast(startX, startY, dirX, dirY, maxDistance, entityType = null) {
        const entities = entityType ? 
            this.entityManager.getEntitiesByType(entityType) : 
            this.entityManager.getAllEntities();
        
        let closestHit = null;
        let closestDistance = maxDistance;
        
        entities.forEach(entity => {
            if (!entity.active) return;
            
            const bounds = entity.getBounds();
            const hit = this.rayRectIntersect(startX, startY, dirX, dirY, bounds);
            
            if (hit && hit.distance < closestDistance) {
                closestDistance = hit.distance;
                closestHit = {
                    entity: entity,
                    distance: hit.distance,
                    point: hit.point
                };
            }
        });
        
        return closestHit;
    }

    /**
     * Check ray-rectangle intersection
     * @param {number} rayX - Ray start X
     * @param {number} rayY - Ray start Y
     * @param {number} dirX - Ray direction X
     * @param {number} dirY - Ray direction Y
     * @param {Object} rect - Rectangle bounds
     * @returns {Object|null} Intersection result or null
     */
    rayRectIntersect(rayX, rayY, dirX, dirY, rect) {
        // Normalize direction
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        if (length === 0) return null;
        
        dirX /= length;
        dirY /= length;
        
        // Calculate intersection with each edge
        const tLeft = (rect.x - rayX) / dirX;
        const tRight = (rect.x + rect.width - rayX) / dirX;
        const tTop = (rect.y - rayY) / dirY;
        const tBottom = (rect.y + rect.height - rayY) / dirY;
        
        const tMin = Math.max(
            Math.min(tLeft, tRight),
            Math.min(tTop, tBottom)
        );
        
        const tMax = Math.min(
            Math.max(tLeft, tRight),
            Math.max(tTop, tBottom)
        );
        
        // No intersection if tMax < 0 or tMin > tMax
        if (tMax < 0 || tMin > tMax) return null;
        
        const t = tMin >= 0 ? tMin : tMax;
        if (t < 0) return null;
        
        return {
            distance: t,
            point: {
                x: rayX + dirX * t,
                y: rayY + dirY * t
            }
        };
    }

    /**
     * Get debug information about collisions
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        return {
            activeCollisionPairs: this.lastCollisionTime.size,
            minCollisionInterval: this.minCollisionInterval,
            aiAssistanceLevel: this.aiAssistanceLevel || 0
        };
    }

    /**
     * Reset collision system
     */
    reset() {
        this.lastCollisionTime.clear();
        this.collisionPairs.clear();
        this.aiAssistanceLevel = 0;
    }
}
