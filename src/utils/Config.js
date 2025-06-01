/**
 * Game Configuration
 * Centralized configuration for all game parameters
 */
export const Config = {
    // Canvas settings
    CANVAS: {
        WIDTH: 800,
        HEIGHT: 600,
        BACKGROUND_COLOR: '#000000'
    },

    // Paddle settings
    PADDLE: {
        WIDTH: 100,
        HEIGHT: 15,
        SPEED: 8,
        COLOR: '#4CAF50',
        Y_POSITION: 550,
        WIDE_WIDTH: 150,
        WIDE_DURATION: 15000 // 15 seconds
    },

    // Ball settings
    BALL: {
        RADIUS: 8,
        SPEED: 4,
        COLOR: '#FFD700',
        MIN_SPEED: 2,
        MAX_SPEED: 8,
        SPEED_INCREASE_PER_LEVEL: 0.5
    },

    // Brick settings
    BRICKS: {
        WIDTH: 75,
        HEIGHT: 20,
        PADDING: 5,
        OFFSET_TOP: 60,
        OFFSET_LEFT: 35,
        ROWS: 6,
        COLS: 10,
        TYPES: [
            { color: '#FF4444', hits: 1, maxHits: 1, points: 10 }, // Red
            { color: '#FF8844', hits: 1, maxHits: 1, points: 20 }, // Orange
            { color: '#FFDD44', hits: 2, maxHits: 2, points: 30 }, // Yellow
            { color: '#44FF44', hits: 2, maxHits: 2, points: 40 }  // Green
        ]
    },

    // Power-up settings
    POWERUPS: {
        DROP_CHANCE: 0.25,
        FALL_SPEED: 2,
        WIDTH: 20,
        HEIGHT: 20,
        TYPES: [
            { type: 'widePaddle', color: '#00FFFF', name: 'Wide Paddle' },
            { type: 'multiBall', color: '#FF00FF', name: 'Multi Ball' }
        ]
    },

    // Particle system
    PARTICLES: {
        COUNT_PER_BRICK: 8,
        LIFE_SPAN: 30,
        SPEED_RANGE: 8
    },

    // AI system
    AI: {
        ANALYSIS_INTERVAL: 5000, // 5 seconds
        ASSISTANCE_LEVELS: {
            NONE: 0,
            SUBTLE: 1,
            ACTIVE: 2
        },
        THRESHOLDS: {
            POOR_ACCURACY: 0.3,
            FAIR_ACCURACY: 0.6,
            POOR_BRICK_HIT_RATE: 0.1,
            MAX_CONSECUTIVE_DEATHS: 2
        },
        ASSISTANCE: {
            SUBTLE_PADDLE_BONUS: 10,
            ACTIVE_PADDLE_BONUS: 20,
            BALL_NUDGE_FORCE: 0.1,
            SPEED_REDUCTION: 0.95
        }
    },

    // Game settings
    GAME: {
        INITIAL_LIVES: 3,
        TARGET_FPS: 60,
        FRAME_TIME: 1000 / 60 // 16.67ms
    },

    // Input settings
    INPUT: {
        MOUSE_SENSITIVITY: 1.0,
        KEYBOARD_SENSITIVITY: 1.0
    },

    // Debug settings
    DEBUG: {
        SHOW_COLLISION_BOXES: false,
        SHOW_PERFORMANCE_METRICS: false,
        SHOW_AI_INFO: true,
        LOG_ENTITY_COUNTS: false
    }
};
