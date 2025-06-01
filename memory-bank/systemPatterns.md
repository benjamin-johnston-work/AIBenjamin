# System Patterns

## Architecture Overview
**Single-File Game Architecture** - Complete game contained in one HTML file with embedded CSS and JavaScript. Uses Canvas 2D API for rendering with a main game loop pattern running at 60fps via requestAnimationFrame.

**Core Systems:**
- **Game State Management** - Central gameState object containing all game entities
- **Physics Engine** - Custom collision detection and ball/paddle physics
- **AI Analysis System** - Performance tracking and adaptive assistance
- **Particle System** - Visual effects for brick destruction
- **Power-up System** - Temporary game modifiers with timers

## Key Technical Decisions
- **No External Dependencies** - Everything self-contained for offline functionality
- **Canvas-based Rendering** - Direct pixel manipulation for smooth 60fps performance
- **Rule-based AI** - Mathematical performance analysis instead of machine learning
- **Object-oriented Game Entities** - Structured approach for balls, bricks, power-ups
- **Event-driven Input** - Responsive keyboard and mouse controls
- **Immediate Mode Rendering** - Clear and redraw each frame for simplicity

## Design Patterns in Use
- **Game Loop Pattern** - Main update/render cycle with fixed timestep
- **Component Pattern** - Game entities have position, velocity, and behavior components
- **State Pattern** - Game states (running, paused, game over) with different behaviors
- **Observer Pattern** - UI updates based on game state changes
- **Factory Pattern** - Brick and power-up creation with type-based configuration
- **Strategy Pattern** - Different AI assistance strategies based on performance level

## Component Relationships
```
GameState (Central Hub)
├── Paddle (Player Control)
├── Balls[] (Physics Objects)
├── Bricks[] (Destructible Targets)
├── PowerUps[] (Temporary Modifiers)
├── Particles[] (Visual Effects)
└── PlayerMetrics (AI Analysis)

Input System → Paddle → Ball Physics → Collision Detection → Game State Updates → Rendering
AI System → Performance Analysis → Assistance Application → Physics Modifications
```

## Critical Implementation Paths
**Game Loop Flow:**
1. Input processing (paddle movement)
2. Physics updates (ball movement, collisions)
3. AI analysis and assistance application
4. Game state updates (score, lives, level progression)
5. Rendering (clear canvas, draw all entities)
6. UI updates (score display, assistance level)

**AI Assistance Pipeline:**
1. Collect performance metrics (accuracy, ball loss rate)
2. Analyze performance every 5 seconds
3. Determine assistance level (None/Subtle/Active)
4. Apply physics modifications (paddle size, ball nudging)
5. Update UI to show assistance status

## Conventions and Standards
- **Naming:** camelCase for functions and variables, PascalCase for constructors
- **File Organization:** All code in single HTML file with clear section comments
- **Function Structure:** Small, focused functions with single responsibilities
- **State Management:** Centralized gameState object with clear property organization
- **Error Handling:** Defensive programming with bounds checking and fallbacks
- **Performance:** Efficient collision detection with early exits and spatial optimization

## Performance Considerations
- **60fps Target** - Optimized game loop with minimal garbage collection
- **Efficient Collision Detection** - AABB (Axis-Aligned Bounding Box) for speed
- **Particle System Optimization** - Limited particle count with automatic cleanup
- **Canvas Optimization** - Minimal state changes, efficient drawing operations
- **Memory Management** - Object pooling for particles, array splicing for cleanup
- **Input Debouncing** - Smooth paddle movement without input lag

## Security Patterns
- **No External Requests** - Completely self-contained, no network dependencies
- **Input Validation** - Bounds checking on all user inputs
- **Safe DOM Manipulation** - Direct element access, no innerHTML injection
- **Local Storage Avoidance** - All state in memory variables as specified
- **Cross-browser Compatibility** - Standard APIs only, no experimental features

---
*Created: 2025-06-01*
*Updated: 2025-06-01*
*Status: Complete - All Patterns Implemented*
*Depends on: projectbrief.md*
