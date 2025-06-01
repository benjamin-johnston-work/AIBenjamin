/**
 * Event Bus for decoupled communication between game systems
 */
export class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @param {Object} context - Context for the callback (optional)
     */
    on(event, callback, context = null) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        
        this.listeners.get(event).push({
            callback,
            context,
            once: false
        });
    }

    /**
     * Subscribe to an event that will only fire once
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @param {Object} context - Context for the callback (optional)
     */
    once(event, callback, context = null) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        
        this.listeners.get(event).push({
            callback,
            context,
            once: true
        });
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     * @param {Object} context - Context that was used when subscribing
     */
    off(event, callback, context = null) {
        if (!this.listeners.has(event)) return;

        const eventListeners = this.listeners.get(event);
        const index = eventListeners.findIndex(listener => 
            listener.callback === callback && listener.context === context
        );

        if (index !== -1) {
            eventListeners.splice(index, 1);
        }

        // Clean up empty event arrays
        if (eventListeners.length === 0) {
            this.listeners.delete(event);
        }
    }

    /**
     * Emit an event to all subscribers
     * @param {string} event - Event name
     * @param {*} data - Data to pass to listeners
     */
    emit(event, data = null) {
        if (!this.listeners.has(event)) return;

        const eventListeners = this.listeners.get(event).slice(); // Copy array to avoid issues with modifications during iteration
        const toRemove = [];

        eventListeners.forEach((listener, index) => {
            try {
                if (listener.context) {
                    listener.callback.call(listener.context, data);
                } else {
                    listener.callback(data);
                }

                // Mark once listeners for removal
                if (listener.once) {
                    toRemove.push(index);
                }
            } catch (error) {
                console.error(`Error in event listener for '${event}':`, error);
            }
        });

        // Remove once listeners
        if (toRemove.length > 0) {
            const currentListeners = this.listeners.get(event);
            toRemove.reverse().forEach(index => {
                currentListeners.splice(index, 1);
            });

            if (currentListeners.length === 0) {
                this.listeners.delete(event);
            }
        }
    }

    /**
     * Remove all listeners for a specific event
     * @param {string} event - Event name
     */
    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Get the number of listeners for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    listenerCount(event) {
        return this.listeners.has(event) ? this.listeners.get(event).length : 0;
    }

    /**
     * Get all event names that have listeners
     * @returns {Array<string>} Array of event names
     */
    eventNames() {
        return Array.from(this.listeners.keys());
    }

    /**
     * Check if there are any listeners for an event
     * @param {string} event - Event name
     * @returns {boolean} True if there are listeners
     */
    hasListeners(event) {
        return this.listeners.has(event) && this.listeners.get(event).length > 0;
    }
}

// Game Events Constants
export const GameEvents = {
    // Game state events
    GAME_START: 'game:start',
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',
    GAME_OVER: 'game:over',
    GAME_RESTART: 'game:restart',
    LEVEL_COMPLETE: 'game:levelComplete',
    LEVEL_START: 'game:levelStart',

    // Entity events
    BALL_LOST: 'ball:lost',
    BALL_PADDLE_HIT: 'ball:paddleHit',
    BALL_WALL_HIT: 'ball:wallHit',
    BRICK_HIT: 'brick:hit',
    BRICK_DESTROYED: 'brick:destroyed',
    POWERUP_SPAWNED: 'powerup:spawned',
    POWERUP_COLLECTED: 'powerup:collected',
    POWERUP_ACTIVATED: 'powerup:activated',
    POWERUP_EXPIRED: 'powerup:expired',

    // Player events
    LIFE_LOST: 'player:lifeLost',
    SCORE_CHANGED: 'player:scoreChanged',
    LIVES_CHANGED: 'player:livesChanged',

    // AI events
    AI_ASSISTANCE_CHANGED: 'ai:assistanceChanged',
    AI_PERFORMANCE_ANALYZED: 'ai:performanceAnalyzed',

    // Input events
    INPUT_PADDLE_MOVE: 'input:paddleMove',
    INPUT_BALL_LAUNCH: 'input:ballLaunch',
    INPUT_PAUSE_TOGGLE: 'input:pauseToggle',

    // Rendering events
    PARTICLE_SPAWN: 'render:particleSpawn',
    SCREEN_SHAKE: 'render:screenShake',

    // System events
    ENTITY_CREATED: 'system:entityCreated',
    ENTITY_DESTROYED: 'system:entityDestroyed',
    COLLISION_DETECTED: 'system:collisionDetected'
};

// Create a global event bus instance
export const eventBus = new EventBus();
