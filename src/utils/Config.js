/**
 * Game Configuration
 * Centralized configuration for all game parameters including spectacular features
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

    // Combo system settings
    COMBO: {
        BREAK_TIMEOUT: 3000,        // ms before combo breaks from inactivity
        MULTIPLIER_THRESHOLDS: [3, 6, 10, 15, 25],
        MULTIPLIER_VALUES: [1, 2, 3, 5, 10, 20],
        SCREEN_SHAKE_INTENSITY: [0, 2, 4, 6, 8, 10],
        PARTICLE_MULTIPLIER: [1, 1.5, 2, 3, 4, 5]
    },

    // Special brick types
    SPECIAL_BRICKS: {
        SPAWN_RATES: {
            EXPLOSIVE: 0.08,  // 8% chance
            STEEL: 0.12,      // 12% chance
            MYSTERY: 0.05,    // 5% chance
            CHAIN: 0.10       // 10% chance
        },
        EXPLOSIVE: {
            COLOR: '#FF4444',
            EXPLOSION_RADIUS: 90, // 3x3 brick area
            POINTS: 50
        },
        STEEL: {
            COLOR: '#888888',
            MAX_HITS: 3,
            POINTS: 60
        },
        MYSTERY: {
            COLOR_SHIFT_SPEED: 0.1,
            POINTS: 100,
            BONUS_EFFECTS: ['points', 'powerup', 'extraball', 'combo']
        },
        CHAIN: {
            COLOR: '#00AAFF',
            CHAIN_RADIUS: 60,
            POINTS: 40
        }
    },

    // Enhanced power-ups
    ENHANCED_POWERUPS: {
        LASER_PADDLE: {
            COLOR: '#00FFFF',
            DURATION: 20000,  // 20 seconds
            SHOTS: 10,
            LASER_SPEED: 12,
            LASER_WIDTH: 4
        },
        STICKY_PADDLE: {
            COLOR: '#00FF00',
            DURATION: 15000,  // 15 seconds
            TRAJECTORY_LENGTH: 200
        },
        FIREBALL: {
            COLOR: '#FF6600',
            DURATION: 10000,  // 10 seconds
            TRAIL_PARTICLES: 20
        },
        TIME_SLOW: {
            COLOR: '#8800FF',
            DURATION: 8000,   // 8 seconds
            SLOW_FACTOR: 0.3  // 30% speed
        }
    },

    // Visual effects
    EFFECTS: {
        SCREEN_SHAKE: {
            DECAY: 0.9,
            MIN_INTENSITY: 0.1
        },
        COLOR_FLASH: {
            DECAY: 0.95,
            MIN_INTENSITY: 0.01
        },
        PARTICLES: {
            MAX_COUNT: 500,
            POOL_SIZE: 500,
            DEFAULT_LIFE: 1000,
            DEFAULT_DECAY: 0.98
        },
        TRAILS: {
            MAX_LENGTH: 20,
            DEFAULT_LIFE: 300
        }
    },

    // Achievement system
    ACHIEVEMENTS: {
        PERFECTIONIST: {
            id: 'perfectionist',
            name: 'Perfectionist',
            description: 'Clear a level without losing a ball',
            icon: '👑',
            color: '#FFD700',
            rarity: 'rare'
        },
        COMBO_MASTER: {
            id: 'combo_master',
            name: 'Combo Master',
            description: 'Achieve a 15+ combo',
            icon: '⚡',
            color: '#FF6600',
            rarity: 'epic'
        },
        SPEEDRUN: {
            id: 'speedrun',
            name: 'Speed Demon',
            description: 'Complete a level in under 60 seconds',
            icon: '⏱️',
            color: '#00AAFF',
            rarity: 'rare'
        },
        POWER_COLLECTOR: {
            id: 'power_collector',
            name: 'Power Collector',
            description: 'Use all power-up types in one level',
            icon: '🔋',
            color: '#AA00FF',
            rarity: 'uncommon'
        },
        CHAIN_MASTER: {
            id: 'chain_master',
            name: 'Chain Reaction',
            description: 'Trigger 5+ chain explosions',
            icon: '💥',
            color: '#FF4444',
            rarity: 'epic'
        },
        BOSS_SLAYER: {
            id: 'boss_slayer',
            name: 'Boss Slayer',
            description: 'Defeat your first boss',
            icon: '🏆',
            color: '#FF0080',
            rarity: 'legendary'
        }
    },

    // Boss system
    BOSS: {
        SPAWN_LEVEL: 5,  // Every 5th level
        BASE_HEALTH: 20,
        HEALTH_PER_LEVEL: 5,
        WIDTH: 200,
        HEIGHT: 60,
        MOVEMENT_SPEED: 1,
        ATTACK_INTERVAL: 3000, // 3 seconds
        PATTERNS: {
            DROP_OBSTACLES: {
                COUNT: 3,
                SPEED: 2
            },
            SHOOT_PROJECTILES: {
                COUNT: 5,
                SPEED: 3
            },
            CREATE_BARRIERS: {
                COUNT: 2,
                DURATION: 10000
            },
            GRAVITY_WELL: {
                RADIUS: 80,
                STRENGTH: 0.5,
                DURATION: 8000
            }
        }
    },

    // Environmental hazards
    ENVIRONMENT: {
        MOVING_BARRIERS: {
            WIDTH: 20,
            HEIGHT: 100,
            SPEED: 2
        },
        GRAVITY_WELLS: {
            RADIUS: 80,
            STRENGTH: 0.5,
            VISUAL_INTENSITY: 0.3
        },
        PORTALS: {
            RADIUS: 30,
            TELEPORT_SPEED: 0.8
        }
    },

    // Power-up combinations
    COMBINATIONS: {
        EXPLOSIVE_LASER: {
            TRIGGERS: ['laser', 'fireball'],
            NAME: 'Explosive Laser',
            EXPLOSION_RADIUS: 50
        },
        PERFECT_PRECISION: {
            TRIGGERS: ['sticky', 'timeSlow'],
            NAME: 'Perfect Precision',
            ACCURACY_BONUS: 2.0
        },
        BALL_CONTROL_MASTER: {
            TRIGGERS: ['widePaddle', 'multiBall'],
            NAME: 'Ball Control Master',
            CONTROL_BONUS: 1.5
        }
    },

    // Debug settings
    DEBUG: {
        SHOW_COLLISION_BOXES: false,
        SHOW_PERFORMANCE_METRICS: false,
        SHOW_AI_INFO: true,
        LOG_ENTITY_COUNTS: false,
        SHOW_COMBO_INFO: true,
        SHOW_EFFECTS_INFO: false,
        SHOW_ACHIEVEMENT_INFO: false
    }
};
