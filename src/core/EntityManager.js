/**
 * Entity Manager for handling all game entities
 */
import { eventBus, GameEvents } from './EventBus.js';

export class EntityManager {
    constructor() {
        this.entities = new Map();
        this.entitiesByType = new Map();
        this.entitiesByTag = new Map();
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
    }

    /**
     * Add an entity to the manager
     * @param {Entity} entity - Entity to add
     */
    addEntity(entity) {
        this.entitiesToAdd.push(entity);
    }

    /**
     * Remove an entity from the manager
     * @param {Entity|number} entityOrId - Entity instance or entity ID
     */
    removeEntity(entityOrId) {
        const id = typeof entityOrId === 'number' ? entityOrId : entityOrId.id;
        this.entitiesToRemove.push(id);
    }

    /**
     * Get an entity by ID
     * @param {number} id - Entity ID
     * @returns {Entity|undefined} Entity or undefined if not found
     */
    getEntity(id) {
        return this.entities.get(id);
    }

    /**
     * Get all entities of a specific type
     * @param {string} type - Entity type
     * @returns {Array<Entity>} Array of entities
     */
    getEntitiesByType(type) {
        return this.entitiesByType.get(type) || [];
    }

    /**
     * Get all entities with a specific tag
     * @param {string} tag - Tag to search for
     * @returns {Array<Entity>} Array of entities
     */
    getEntitiesByTag(tag) {
        return this.entitiesByTag.get(tag) || [];
    }

    /**
     * Get all entities
     * @returns {Array<Entity>} Array of all entities
     */
    getAllEntities() {
        return Array.from(this.entities.values());
    }

    /**
     * Get entities within a specific area
     * @param {Object} bounds - Bounds to search within
     * @returns {Array<Entity>} Array of entities within bounds
     */
    getEntitiesInArea(bounds) {
        return this.getAllEntities().filter(entity => {
            const entityBounds = entity.getBounds();
            return this._boundsIntersect(entityBounds, bounds);
        });
    }

    /**
     * Find the closest entity to a point
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} type - Optional entity type filter
     * @returns {Entity|null} Closest entity or null
     */
    getClosestEntity(x, y, type = null) {
        let closest = null;
        let closestDistance = Infinity;

        const entities = type ? this.getEntitiesByType(type) : this.getAllEntities();

        entities.forEach(entity => {
            if (!entity.active) return;

            const center = entity.getCenter();
            const distance = Math.sqrt((center.x - x) ** 2 + (center.y - y) ** 2);

            if (distance < closestDistance) {
                closestDistance = distance;
                closest = entity;
            }
        });

        return closest;
    }

    /**
     * Update all entities
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Process entities to add
        this._processAdditions();

        // Update all active entities
        this.entities.forEach(entity => {
            if (entity.active) {
                entity.update(deltaTime);
            }
        });

        // Process entities to remove
        this._processRemovals();
    }

    /**
     * Render all entities
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // Render entities in order (background to foreground)
        const renderOrder = ['Brick', 'PowerUp', 'Paddle', 'Ball', 'Particle'];
        
        renderOrder.forEach(type => {
            const entities = this.getEntitiesByType(type);
            entities.forEach(entity => {
                if (entity.visible) {
                    entity.render(ctx);
                }
            });
        });

        // Render any entities not in the render order
        this.entities.forEach(entity => {
            if (entity.visible && !renderOrder.includes(entity.type)) {
                entity.render(ctx);
            }
        });
    }

    /**
     * Clear all entities
     */
    clear() {
        this.entities.clear();
        this.entitiesByType.clear();
        this.entitiesByTag.clear();
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
    }

    /**
     * Get entity count
     * @param {string} type - Optional type filter
     * @returns {number} Number of entities
     */
    getEntityCount(type = null) {
        if (type) {
            return this.getEntitiesByType(type).length;
        }
        return this.entities.size;
    }

    /**
     * Check if any entities of a type exist
     * @param {string} type - Entity type
     * @returns {boolean} True if entities exist
     */
    hasEntitiesOfType(type) {
        return this.getEntityCount(type) > 0;
    }

    /**
     * Get entities that intersect with a given entity
     * @param {Entity} entity - Entity to check intersections for
     * @param {string} type - Optional type filter
     * @returns {Array<Entity>} Array of intersecting entities
     */
    getIntersectingEntities(entity, type = null) {
        const entities = type ? this.getEntitiesByType(type) : this.getAllEntities();
        
        return entities.filter(other => {
            return other !== entity && 
                   other.active && 
                   entity.intersects(other);
        });
    }

    /**
     * Process entities to add
     * @private
     */
    _processAdditions() {
        this.entitiesToAdd.forEach(entity => {
            this.entities.set(entity.id, entity);

            // Add to type index
            if (!this.entitiesByType.has(entity.type)) {
                this.entitiesByType.set(entity.type, []);
            }
            this.entitiesByType.get(entity.type).push(entity);

            // Add to tag indices
            entity.getTags().forEach(tag => {
                if (!this.entitiesByTag.has(tag)) {
                    this.entitiesByTag.set(tag, []);
                }
                this.entitiesByTag.get(tag).push(entity);
            });

            // Emit event
            eventBus.emit(GameEvents.ENTITY_CREATED, { entity });
        });

        this.entitiesToAdd = [];
    }

    /**
     * Process entities to remove
     * @private
     */
    _processRemovals() {
        this.entitiesToRemove.forEach(id => {
            const entity = this.entities.get(id);
            if (!entity) return;

            // Remove from main collection
            this.entities.delete(id);

            // Remove from type index
            const typeEntities = this.entitiesByType.get(entity.type);
            if (typeEntities) {
                const index = typeEntities.indexOf(entity);
                if (index !== -1) {
                    typeEntities.splice(index, 1);
                }
                if (typeEntities.length === 0) {
                    this.entitiesByType.delete(entity.type);
                }
            }

            // Remove from tag indices
            entity.getTags().forEach(tag => {
                const tagEntities = this.entitiesByTag.get(tag);
                if (tagEntities) {
                    const index = tagEntities.indexOf(entity);
                    if (index !== -1) {
                        tagEntities.splice(index, 1);
                    }
                    if (tagEntities.length === 0) {
                        this.entitiesByTag.delete(tag);
                    }
                }
            });

            // Call entity destroy method
            entity.onDestroy();

            // Emit event
            eventBus.emit(GameEvents.ENTITY_DESTROYED, { entity });
        });

        this.entitiesToRemove = [];
    }

    /**
     * Check if two bounds intersect
     * @private
     */
    _boundsIntersect(bounds1, bounds2) {
        return bounds1.x < bounds2.x + bounds2.width &&
               bounds1.x + bounds1.width > bounds2.x &&
               bounds1.y < bounds2.y + bounds2.height &&
               bounds1.y + bounds1.height > bounds2.y;
    }

    /**
     * Get debug information
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        const typeCount = {};
        this.entitiesByType.forEach((entities, type) => {
            typeCount[type] = entities.length;
        });

        return {
            totalEntities: this.entities.size,
            entitiesByType: typeCount,
            pendingAdditions: this.entitiesToAdd.length,
            pendingRemovals: this.entitiesToRemove.length
        };
    }
}
