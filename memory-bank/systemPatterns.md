# System Patterns

## Architecture Overview
**Dual Architecture Approach** - Complete game available in both single HTML file format and modern modular ES6 structure. Uses Canvas 2D API for rendering with a main game loop pattern running at 60fps via requestAnimationFrame.

**Core Systems:**
- **Game State Management** - Central gameState object containing all game entities
- **Entity Management** - Modular entity system with base Entity class and component support
- **Event-Driven Communication** - Centralized EventBus for decoupled system interaction
- **Physics Engine** - Custom collision detection and ball/paddle physics
- **AI Analysis System** - Performance tracking and adaptive assistance
- **Particle System** - Visual effects for brick destruction and spectacular features
- **Power-up System** - Temporary game modifiers with timers and combinations

**Spectacular Feature Systems:**
- **Combo System** - Progressive multiplier tracking with visual escalation
- **Effects System** - Centralized visual effects management for screen shake, flashes, trails
- **Achievement System** - Badge tracking with celebration effects and notifications
- **Boss System** - Epic boss battle mechanics with attack patterns
- **Environment System** - Dynamic backgrounds and environmental hazards

## Key Technical Decisions
- **No External Dependencies** - Everything self-contained for offline functionality
- **Canvas-based Rendering** - Direct pixel manipulation for smooth 60fps performance
- **Rule-based AI** - Mathematical performance analysis instead of machine learning
- **Object-oriented Game Entities** - Structured approach for balls, bricks, power-ups
- **Event-driven Input** - Responsive keyboard and mouse controls
- **Immediate Mode Rendering** - Clear and redraw each frame for simplicity
- **Modular Architecture** - ES6 modules with clean separation of concerns
- **Event-Driven Communication** - Centralized EventBus for system decoupling
- **Performance-First Design** - All features optimized for 60fps maintenance
- **Spectacular Feature Integration** - Advanced systems for visual effects and player engagement

## Design Patterns in Use
- **Game Loop Pattern** - Main update/render cycle with fixed timestep
- **Entity-Component System** - Flexible entity composition with reusable components
- **State Pattern** - Game states (running, paused, game over) with different behaviors
- **Observer Pattern** - Event-driven communication between systems and UI updates
- **Factory Pattern** - Entity creation through static factory methods
- **Strategy Pattern** - Different AI assistance strategies and power-up behaviors
- **Command Pattern** - Input handling and action execution
- **Singleton Pattern** - EventBus and configuration management
- **Object Pool Pattern** - Particle and effect object reuse for performance

## Component Relationships
```
Modern Modular Architecture:
Game (Main Controller)
├── EntityManager (Entity Lifecycle)
├── CollisionSystem (Physics & Interactions)
├── AISystem (Performance Analysis & Assistance)
├── InputManager (User Input Processing)
├── ComboSystem (Score Multipliers & Tracking)
├── EffectsSystem (Visual Effects Management)
├── AchievementSystem (Badge Tracking & Celebrations)
├── BossSystem (Epic Battle Mechanics)
└── EnvironmentSystem (Dynamic Backgrounds & Hazards)

Entity Hierarchy:
Entity (Base Class)
├── Paddle (Player Control)
├── Ball (Physics Objects)
├── Brick (Destructible Targets)
│   ├── ExplosiveBrick (3x3 Destruction)
│   ├── SteelBrick (Multi-hit Durability)
│   ├── MysteryBrick (Random Bonuses)
│   └── ChainBrick (Lightning Reactions)
├── PowerUp (Temporary Modifiers)
│   ├── LaserPaddlePowerUp (Shooting Ability)
│   ├── StickyPaddlePowerUp (Trajectory Preview)
│   ├── FireballPowerUp (Multi-destruction)
│   └── TimeSlowPowerUp (Bullet-time)
├── Particle (Visual Effects)
└── BossBrick (Epic Battle Entities)

Event Flow:
Input → EventBus → Systems → Entities → Collision → Effects → Rendering
```

## Critical Implementation Paths
**Enhanced Game Loop Flow:**
1. Input processing (paddle movement, power-up activation)
2. Entity updates (movement, animations, state changes)
3. Physics updates (ball movement, collisions, special interactions)
4. System updates (AI analysis, combo tracking, achievement checking)
5. Effect updates (particles, screen shake, visual effects)
6. Rendering (entities, effects, UI elements)
7. Event processing (system communication, state synchronization)

**Spectacular Feature Pipeline:**
1. **Combo Tracking** - Monitor consecutive hits, calculate multipliers
2. **Visual Effects** - Apply screen shake, particle effects, color flashes
3. **Achievement Detection** - Check for unlockable achievements
4. **Boss Mechanics** - Update boss behavior, attack patterns, health
5. **Environmental Effects** - Update dynamic backgrounds, hazards
6. **Power-up Combinations** - Detect and apply synergistic effects

**AI Assistance Pipeline:**
1. Collect performance metrics (accuracy, ball loss rate, combo performance)
2. Analyze performance every 5 seconds with enhanced criteria
3. Determine assistance level (None/Subtle/Active) based on multiple factors
4. Apply physics modifications (paddle size, ball nudging, combo assistance)
5. Update UI to show assistance status and recommendations

## New System Patterns

### **Combo System Pattern**
```javascript
// Progressive reward system with visual escalation
class ComboSystem {
  trackHit() → updateMultiplier() → triggerVisualEffects() → notifyScoreSystem()
  
  Visual Escalation:
  - Text size increases with combo level
  - Screen shake intensity scales with multiplier
  - Particle effects multiply with combo count
  - Color progression through combo tiers
}
```

### **Effects System Pattern**
```javascript
// Centralized visual effects management
class EffectsSystem {
  manageScreenShake() → controlParticleIntensity() → handleColorFlashes()
  
  Performance Optimization:
  - Object pooling for effect objects
  - Spatial culling for off-screen effects
  - Intensity scaling based on performance
  - Automatic cleanup of expired effects
}
```

### **Achievement System Pattern**
```javascript
// Event-driven achievement tracking with celebrations
class AchievementSystem {
  listenForEvents() → checkCriteria() → unlockAchievement() → triggerCelebration()
  
  Celebration Pipeline:
  - Confetti particle explosion
  - Achievement banner animation
  - Screen flash with achievement color
  - Sound effect and visual feedback
}
```

### **Boss System Pattern**
```javascript
// Epic battle mechanics with phases
class BossSystem {
  updateMovement() → executeAttackPattern() → handleDamage() → checkPhaseTransition()
  
  Epic Destruction Sequence:
  - Multiple explosion points across boss
  - Screen-wide visual effects
  - Victory celebration with fanfare
  - Achievement unlock integration
}
```

## Conventions and Standards
- **Naming:** camelCase for functions and variables, PascalCase for classes
- **File Organization:** Modular structure with clear separation of concerns
- **Function Structure:** Small, focused functions with single responsibilities
- **State Management:** Event-driven state updates with centralized configuration
- **Error Handling:** Defensive programming with graceful degradation
- **Performance:** Object pooling, efficient rendering, spatial optimization
- **Documentation:** Comprehensive JSDoc comments for all public APIs

## Performance Considerations
- **60fps Target** - Optimized game loop with all spectacular features active
- **Efficient Collision Detection** - Spatial partitioning for complex interactions
- **Advanced Particle System** - Object pooling with automatic lifecycle management
- **Canvas Optimization** - Minimal state changes, batched drawing operations
- **Memory Management** - Automatic cleanup, efficient object reuse
- **Effect Culling** - Disable off-screen effects, intensity scaling
- **Input Responsiveness** - <16ms input lag maintained with all features

## Spectacular Feature Patterns

### **Visual Spectacle Pattern**
- **Progressive Intensity** - Effects escalate with player performance
- **Satisfying Feedback** - Every action has immediate, rewarding response
- **Epic Moments** - Boss battles and achievements create memorable highlights
- **Consistent Art Style** - Cohesive visual design across all features

### **Player Engagement Pattern**
- **Addictive Progression** - Combo system creates "one more try" gameplay
- **Strategic Depth** - Special bricks and power-ups add tactical decisions
- **Power Fantasy** - Moments where players feel incredibly powerful
- **Achievement Drive** - Long-term goals maintain engagement

### **Performance Optimization Pattern**
- **Modular Loading** - Features can be enabled/disabled for performance
- **Adaptive Quality** - Visual effects scale based on performance
- **Efficient Rendering** - Batched operations, minimal state changes
- **Memory Conscious** - Object pooling, automatic cleanup

## Security Patterns
- **No External Requests** - Completely self-contained, no network dependencies
- **Input Validation** - Bounds checking on all user inputs and configurations
- **Safe DOM Manipulation** - Direct element access, no innerHTML injection
- **Local Storage Avoidance** - All state in memory variables as specified
- **Cross-browser Compatibility** - Standard APIs only, no experimental features
- **Modular Security** - Each system isolated, no cross-contamination

## Integration Patterns

### **Event-Driven Integration**
```javascript
// Systems communicate through well-defined events
EventBus.emit('brick:destroyed', { brick, points, position });
EventBus.on('combo:increased', (data) => this.updateVisualEffects(data));
```

### **Configuration-Driven Features**
```javascript
// All features controlled through centralized configuration
Config.COMBO.MULTIPLIER_THRESHOLDS = [3, 6, 10, 15, 25];
Config.EFFECTS.SCREEN_SHAKE_INTENSITY = [0, 2, 4, 6, 8, 10];
```

### **System Independence**
```javascript
// Each system operates independently with clear interfaces
class ComboSystem {
  constructor(eventBus, config) { /* Clean dependency injection */ }
  update(deltaTime) { /* Independent operation */ }
  getDebugInfo() { /* Standardized debugging */ }
}
```

---
*Created: 2025-06-01*
*Updated: 2025-06-01*
*Status: Complete - All Patterns Including Spectacular Features*
*Depends on: projectbrief.md, featureSpecifications.md*
