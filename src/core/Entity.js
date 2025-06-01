/**
 * Base Entity class for all game objects
 */
export class Entity {
    static nextId = 1;

    constructor(x = 0, y = 0) {
        this.id = Entity.nextId++;
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.active = true;
        this.visible = true;
        this.type = this.constructor.name;
        this.components = new Map();
        this.tags = new Set();
    }

    /**
     * Update the entity
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        if (!this.active) return;

        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime / 16.67; // Normalize to 60fps
        this.position.y += this.velocity.y * deltaTime / 16.67;

        // Call entity-specific update
        this.onUpdate(deltaTime);
    }

    /**
     * Override this method in derived classes for custom update logic
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    onUpdate(deltaTime) {
        // Override in derived classes
    }

    /**
     * Render the entity
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        if (!this.visible) return;
        this.onRender(ctx);
    }

    /**
     * Override this method in derived classes for custom rendering
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    onRender(ctx) {
        // Override in derived classes
    }

    /**
     * Get the bounding box of the entity
     * @returns {Object} Bounding box with x, y, width, height
     */
    getBounds() {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.width || 0,
            height: this.height || 0
        };
    }

    /**
     * Check if this entity intersects with another entity
     * @param {Entity} other - Other entity to check collision with
     * @returns {boolean} True if entities intersect
     */
    intersects(other) {
        const bounds1 = this.getBounds();
        const bounds2 = other.getBounds();

        return bounds1.x < bounds2.x + bounds2.width &&
               bounds1.x + bounds1.width > bounds2.x &&
               bounds1.y < bounds2.y + bounds2.height &&
               bounds1.y + bounds1.height > bounds2.y;
    }

    /**
     * Add a component to this entity
     * @param {string} name - Component name
     * @param {*} component - Component data
     */
    addComponent(name, component) {
        this.components.set(name, component);
    }

    /**
     * Get a component from this entity
     * @param {string} name - Component name
     * @returns {*} Component data or undefined
     */
    getComponent(name) {
        return this.components.get(name);
    }

    /**
     * Check if entity has a component
     * @param {string} name - Component name
     * @returns {boolean} True if component exists
     */
    hasComponent(name) {
        return this.components.has(name);
    }

    /**
     * Remove a component from this entity
     * @param {string} name - Component name
     */
    removeComponent(name) {
        this.components.delete(name);
    }

    /**
     * Add a tag to this entity
     * @param {string} tag - Tag to add
     */
    addTag(tag) {
        this.tags.add(tag);
    }

    /**
     * Check if entity has a tag
     * @param {string} tag - Tag to check
     * @returns {boolean} True if entity has the tag
     */
    hasTag(tag) {
        return this.tags.has(tag);
    }

    /**
     * Remove a tag from this entity
     * @param {string} tag - Tag to remove
     */
    removeTag(tag) {
        this.tags.delete(tag);
    }

    /**
     * Get all tags
     * @returns {Set<string>} Set of all tags
     */
    getTags() {
        return new Set(this.tags);
    }

    /**
     * Destroy the entity
     */
    destroy() {
        this.active = false;
        this.visible = false;
        this.onDestroy();
    }

    /**
     * Override this method in derived classes for cleanup
     */
    onDestroy() {
        // Override in derived classes
    }

    /**
     * Set the position of the entity
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }

    /**
     * Set the velocity of the entity
     * @param {number} vx - X velocity
     * @param {number} vy - Y velocity
     */
    setVelocity(vx, vy) {
        this.velocity.x = vx;
        this.velocity.y = vy;
    }

    /**
     * Get the center position of the entity
     * @returns {Object} Center position with x, y
     */
    getCenter() {
        const bounds = this.getBounds();
        return {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2
        };
    }

    /**
     * Set the center position of the entity
     * @param {number} x - Center X coordinate
     * @param {number} y - Center Y coordinate
     */
    setCenter(x, y) {
        const bounds = this.getBounds();
        this.position.x = x - bounds.width / 2;
        this.position.y = y - bounds.height / 2;
    }

    /**
     * Check if entity is within bounds
     * @param {Object} bounds - Bounds to check against
     * @returns {boolean} True if entity is within bounds
     */
    isWithinBounds(bounds) {
        const entityBounds = this.getBounds();
        return entityBounds.x >= bounds.x &&
               entityBounds.y >= bounds.y &&
               entityBounds.x + entityBounds.width <= bounds.x + bounds.width &&
               entityBounds.y + entityBounds.height <= bounds.y + bounds.height;
    }

    /**
     * Get distance to another entity
     * @param {Entity} other - Other entity
     * @returns {number} Distance between entities
     */
    distanceTo(other) {
        const center1 = this.getCenter();
        const center2 = other.getCenter();
        return Math.sqrt((center2.x - center1.x) ** 2 + (center2.y - center1.y) ** 2);
    }
}
