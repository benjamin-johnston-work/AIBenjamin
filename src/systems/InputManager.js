/**
 * Input Manager for handling keyboard and mouse input
 */
import { eventBus, GameEvents } from '../core/EventBus.js';
import { Config } from '../utils/Config.js';

export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = new Map();
        this.mousePosition = { x: 0, y: 0 };
        this.mouseButtons = new Map();
        this.isActive = true;
        
        // Input state
        this.inputState = {
            paddle: {
                left: false,
                right: false,
                mouseX: 0,
                useMouseControl: false
            },
            game: {
                paused: false,
                ballLaunch: false
            }
        };
        
        // Key bindings
        this.keyBindings = {
            'ArrowLeft': 'paddle.left',
            'ArrowRight': 'paddle.right',
            'a': 'paddle.left',
            'd': 'paddle.right',
            ' ': 'game.pause',
            'Escape': 'game.pause',
            'Enter': 'game.ballLaunch'
        };
        
        // Mouse settings
        this.mouseSensitivity = Config.INPUT.MOUSE_SENSITIVITY;
        this.keyboardSensitivity = Config.INPUT.KEYBOARD_SENSITIVITY;
        
        this.setupEventListeners();
    }

    /**
     * Set up event listeners for input
     */
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Mouse events
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('click', this.onClick.bind(this));
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Focus events
        window.addEventListener('blur', this.onWindowBlur.bind(this));
        window.addEventListener('focus', this.onWindowFocus.bind(this));
        
        // Prevent default behavior for game keys
        document.addEventListener('keydown', this.preventDefaultKeys.bind(this));
    }

    /**
     * Update input manager
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.processInputState();
        this.emitInputEvents();
    }

    /**
     * Process current input state
     */
    processInputState() {
        // Update paddle input state
        this.inputState.paddle.left = this.isKeyPressed('ArrowLeft') || this.isKeyPressed('a');
        this.inputState.paddle.right = this.isKeyPressed('ArrowRight') || this.isKeyPressed('d');
        
        // Check for mouse control
        if (this.mousePosition.x > 0) {
            this.inputState.paddle.mouseX = this.mousePosition.x;
            this.inputState.paddle.useMouseControl = true;
        }
    }

    /**
     * Emit input events based on current state
     */
    emitInputEvents() {
        // Emit paddle movement events
        if (this.inputState.paddle.left || this.inputState.paddle.right || this.inputState.paddle.useMouseControl) {
            eventBus.emit(GameEvents.INPUT_PADDLE_MOVE, {
                left: this.inputState.paddle.left,
                right: this.inputState.paddle.right,
                mouseX: this.inputState.paddle.mouseX,
                useMouseControl: this.inputState.paddle.useMouseControl
            });
        }
    }

    /**
     * Handle key down events
     * @param {KeyboardEvent} event - Keyboard event
     */
    onKeyDown(event) {
        if (!this.isActive) return;
        
        const key = event.key;
        this.keys.set(key, true);
        
        // Handle special key actions
        this.handleKeyAction(key, true);
    }

    /**
     * Handle key up events
     * @param {KeyboardEvent} event - Keyboard event
     */
    onKeyUp(event) {
        if (!this.isActive) return;
        
        const key = event.key;
        this.keys.set(key, false);
        
        // Handle special key actions
        this.handleKeyAction(key, false);
    }

    /**
     * Handle key actions
     * @param {string} key - Key pressed
     * @param {boolean} pressed - Whether key is pressed or released
     */
    handleKeyAction(key, pressed) {
        // Only trigger on key press (not release) for these actions
        if (!pressed) return;
        
        switch (key) {
            case ' ':
            case 'Escape':
                eventBus.emit(GameEvents.INPUT_PAUSE_TOGGLE);
                break;
                
            case 'Enter':
                eventBus.emit(GameEvents.INPUT_BALL_LAUNCH);
                break;
        }
    }

    /**
     * Handle mouse move events
     * @param {MouseEvent} event - Mouse event
     */
    onMouseMove(event) {
        if (!this.isActive) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition.x = (event.clientX - rect.left) * this.mouseSensitivity;
        this.mousePosition.y = (event.clientY - rect.top) * this.mouseSensitivity;
        
        // Clamp mouse position to canvas bounds
        this.mousePosition.x = Math.max(0, Math.min(this.mousePosition.x, Config.CANVAS.WIDTH));
        this.mousePosition.y = Math.max(0, Math.min(this.mousePosition.y, Config.CANVAS.HEIGHT));
        
        // Enable mouse control
        this.inputState.paddle.useMouseControl = true;
        this.inputState.paddle.mouseX = this.mousePosition.x;
    }

    /**
     * Handle mouse down events
     * @param {MouseEvent} event - Mouse event
     */
    onMouseDown(event) {
        if (!this.isActive) return;
        
        this.mouseButtons.set(event.button, true);
    }

    /**
     * Handle mouse up events
     * @param {MouseEvent} event - Mouse event
     */
    onMouseUp(event) {
        if (!this.isActive) return;
        
        this.mouseButtons.set(event.button, false);
    }

    /**
     * Handle mouse click events
     * @param {MouseEvent} event - Mouse event
     */
    onClick(event) {
        if (!this.isActive) return;
        
        // Left click launches ball
        if (event.button === 0) {
            eventBus.emit(GameEvents.INPUT_BALL_LAUNCH);
        }
    }

    /**
     * Handle window blur (focus lost)
     */
    onWindowBlur() {
        // Clear all input states when window loses focus
        this.keys.clear();
        this.mouseButtons.clear();
        this.inputState.paddle.left = false;
        this.inputState.paddle.right = false;
        this.inputState.paddle.useMouseControl = false;
        
        // Auto-pause game when focus is lost
        eventBus.emit(GameEvents.GAME_PAUSE);
    }

    /**
     * Handle window focus
     */
    onWindowFocus() {
        // Resume game when focus is regained (optional)
        // eventBus.emit(GameEvents.GAME_RESUME);
    }

    /**
     * Prevent default behavior for game keys
     * @param {KeyboardEvent} event - Keyboard event
     */
    preventDefaultKeys(event) {
        const gameKeys = [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        
        if (gameKeys.includes(event.key)) {
            event.preventDefault();
        }
    }

    /**
     * Check if a key is currently pressed
     * @param {string} key - Key to check
     * @returns {boolean} True if key is pressed
     */
    isKeyPressed(key) {
        return this.keys.get(key) || false;
    }

    /**
     * Check if a mouse button is currently pressed
     * @param {number} button - Mouse button to check (0=left, 1=middle, 2=right)
     * @returns {boolean} True if button is pressed
     */
    isMouseButtonPressed(button) {
        return this.mouseButtons.get(button) || false;
    }

    /**
     * Get current mouse position
     * @returns {Object} Mouse position with x, y coordinates
     */
    getMousePosition() {
        return { ...this.mousePosition };
    }

    /**
     * Get current input state
     * @returns {Object} Current input state
     */
    getInputState() {
        return {
            ...this.inputState,
            mousePosition: this.getMousePosition(),
            keys: Array.from(this.keys.entries()).filter(([key, pressed]) => pressed).map(([key]) => key),
            mouseButtons: Array.from(this.mouseButtons.entries()).filter(([button, pressed]) => pressed).map(([button]) => button)
        };
    }

    /**
     * Set mouse sensitivity
     * @param {number} sensitivity - Mouse sensitivity (0.1 to 2.0)
     */
    setMouseSensitivity(sensitivity) {
        this.mouseSensitivity = Math.max(0.1, Math.min(2.0, sensitivity));
    }

    /**
     * Set keyboard sensitivity
     * @param {number} sensitivity - Keyboard sensitivity (0.1 to 2.0)
     */
    setKeyboardSensitivity(sensitivity) {
        this.keyboardSensitivity = Math.max(0.1, Math.min(2.0, sensitivity));
    }

    /**
     * Add custom key binding
     * @param {string} key - Key to bind
     * @param {string} action - Action to bind to
     */
    addKeyBinding(key, action) {
        this.keyBindings[key] = action;
    }

    /**
     * Remove key binding
     * @param {string} key - Key to unbind
     */
    removeKeyBinding(key) {
        delete this.keyBindings[key];
    }

    /**
     * Get all current key bindings
     * @returns {Object} Key bindings
     */
    getKeyBindings() {
        return { ...this.keyBindings };
    }

    /**
     * Enable or disable input processing
     * @param {boolean} active - Whether input should be active
     */
    setActive(active) {
        this.isActive = active;
        
        if (!active) {
            // Clear all input states when disabled
            this.keys.clear();
            this.mouseButtons.clear();
            this.inputState.paddle.left = false;
            this.inputState.paddle.right = false;
            this.inputState.paddle.useMouseControl = false;
        }
    }

    /**
     * Reset input state
     */
    reset() {
        this.keys.clear();
        this.mouseButtons.clear();
        this.mousePosition = { x: 0, y: 0 };
        this.inputState = {
            paddle: {
                left: false,
                right: false,
                mouseX: 0,
                useMouseControl: false
            },
            game: {
                paused: false,
                ballLaunch: false
            }
        };
    }

    /**
     * Check if any input is currently active
     * @returns {boolean} True if any input is active
     */
    hasActiveInput() {
        const hasKeys = Array.from(this.keys.values()).some(pressed => pressed);
        const hasMouseButtons = Array.from(this.mouseButtons.values()).some(pressed => pressed);
        return hasKeys || hasMouseButtons;
    }

    /**
     * Get debug information
     * @returns {Object} Debug information
     */
    getDebugInfo() {
        return {
            isActive: this.isActive,
            pressedKeys: Array.from(this.keys.entries()).filter(([key, pressed]) => pressed).map(([key]) => key),
            pressedMouseButtons: Array.from(this.mouseButtons.entries()).filter(([button, pressed]) => pressed).map(([button]) => button),
            mousePosition: this.mousePosition,
            inputState: this.inputState,
            mouseSensitivity: this.mouseSensitivity,
            keyboardSensitivity: this.keyboardSensitivity,
            keyBindings: Object.keys(this.keyBindings).length
        };
    }

    /**
     * Cleanup event listeners
     */
    destroy() {
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        document.removeEventListener('keyup', this.onKeyUp.bind(this));
        
        this.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.removeEventListener('click', this.onClick.bind(this));
        this.canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
        
        window.removeEventListener('blur', this.onWindowBlur.bind(this));
        window.removeEventListener('focus', this.onWindowFocus.bind(this));
        
        document.removeEventListener('keydown', this.preventDefaultKeys.bind(this));
    }
}
