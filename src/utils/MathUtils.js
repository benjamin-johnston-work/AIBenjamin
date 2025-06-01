/**
 * Mathematical utility functions
 */
export const MathUtils = {
    /**
     * Clamp a value between min and max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Calculate distance between two points
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    /**
     * Linear interpolation between two values
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    /**
     * Convert degrees to radians
     */
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    },

    /**
     * Convert radians to degrees
     */
    toDegrees(radians) {
        return radians * 180 / Math.PI;
    },

    /**
     * Generate random number between min and max
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Generate random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Check if two rectangles intersect (AABB collision)
     */
    rectIntersect(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },

    /**
     * Check if a circle intersects with a rectangle
     */
    circleRectIntersect(circle, rect) {
        const closestX = this.clamp(circle.x, rect.x, rect.x + rect.width);
        const closestY = this.clamp(circle.y, rect.y, rect.y + rect.height);
        
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        
        return (distanceX * distanceX + distanceY * distanceY) <= (circle.radius * circle.radius);
    },

    /**
     * Normalize a vector
     */
    normalize(vector) {
        const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (magnitude === 0) return { x: 0, y: 0 };
        return {
            x: vector.x / magnitude,
            y: vector.y / magnitude
        };
    },

    /**
     * Calculate vector magnitude
     */
    magnitude(vector) {
        return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    },

    /**
     * Multiply vector by scalar
     */
    multiplyVector(vector, scalar) {
        return {
            x: vector.x * scalar,
            y: vector.y * scalar
        };
    },

    /**
     * Add two vectors
     */
    addVectors(v1, v2) {
        return {
            x: v1.x + v2.x,
            y: v1.y + v2.y
        };
    },

    /**
     * Subtract two vectors
     */
    subtractVectors(v1, v2) {
        return {
            x: v1.x - v2.x,
            y: v1.y - v2.y
        };
    },

    /**
     * Calculate dot product of two vectors
     */
    dotProduct(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    },

    /**
     * Reflect a vector off a surface normal
     */
    reflect(vector, normal) {
        const dot = this.dotProduct(vector, normal);
        return {
            x: vector.x - 2 * dot * normal.x,
            y: vector.y - 2 * dot * normal.y
        };
    }
};
