/**
 * 🧠 STATE MACHINE - Finite State Machine untuk game entities
 *
 * Digunakan oleh Player dan Enemy untuk manage states
 * Mencegah spaghetti code dengan pattern yang clean
 */

/**
 * Base State class - extend untuk setiap state
 */
export class State {
    constructor(name, stateMachine) {
        this.name = name;
        this.stateMachine = stateMachine;
    }

    // Override di subclass
    enter(prevState, ...args) {}
    execute(delta, ...args) {}
    exit(nextState) {}
}

/**
 * State Machine Manager
 */
export class StateMachine {
    constructor(owner, initialState = null) {
        this.owner = owner;
        this.states = new Map();
        this.currentState = null;
        this.previousState = null;
        this.isChangingState = false;
        this.stateQueue = [];
    }

    addState(name, state) {
        this.states.set(name, state);
        return this;
    }

    addStates(statesObject) {
        Object.entries(statesObject).forEach(([name, StateClass]) => {
            this.states.set(name, new StateClass(name, this));
        });
        return this;
    }

    setState(name, ...args) {
        if (this.isChangingState) {
            this.stateQueue.push({ name, args });
            return;
        }

        if (!this.states.has(name)) {
            console.warn(`State "${name}" tidak ditemukan`);
            return;
        }

        this.isChangingState = true;

        if (this.currentState) {
            this.currentState.exit(name);
        }

        this.previousState = this.currentState;
        this.currentState = this.states.get(name);
        this.currentState.enter(this.previousState?.name, ...args);

        this.isChangingState = false;

        if (this.stateQueue.length > 0) {
            const { name: nextName, args: nextArgs } = this.stateQueue.shift();
            this.setState(nextName, ...nextArgs);
        }
    }

    update(delta, ...args) {
        if (this.currentState) {
            this.currentState.execute(delta, ...args);
        }
    }

    getCurrentStateName() {
        return this.currentState?.name || null;
    }

    isInState(name) {
        return this.currentState?.name === name;
    }

    wasInState(name) {
        return this.previousState?.name === name;
    }
}

// ============================================
// PLAYER STATES
// ============================================

export class IdleState extends State {
    enter(prevState) {
        const player = this.stateMachine.owner;
        player.setVelocityX(0);
        player.playAnimation('idle');
    }

    execute(delta) {
        const player = this.stateMachine.owner;
        const input = player.inputManager;

        if (input.isHidePressed()) {
            this.stateMachine.setState('hiding');
            return;
        }

        if (input.getHorizontal() !== 0) {
            this.stateMachine.setState('walking');
            return;
        }

        if (input.isJumpJustPressed() && player.isOnGround()) {
            this.stateMachine.setState('jumping');
            return;
        }

        if (!player.isOnGround()) {
            this.stateMachine.setState('falling');
            return;
        }
    }
}

export class WalkingState extends State {
    enter(prevState) {
        const player = this.stateMachine.owner;
        player.playAnimation('walk');
    }

    execute(delta) {
        const player = this.stateMachine.owner;
        const input = player.inputManager;
        const horizontal = input.getHorizontal();

        if (horizontal !== 0) {
            player.move(horizontal);
        } else {
            this.stateMachine.setState('idle');
            return;
        }

        if (input.isHidePressed()) {
            this.stateMachine.setState('hiding');
            return;
        }

        if (input.isJumpJustPressed() && player.isOnGround()) {
            this.stateMachine.setState('jumping');
            return;
        }

        if (!player.isOnGround()) {
            this.stateMachine.setState('falling');
            return;
        }
    }
}

export class JumpingState extends State {
    enter(prevState) {
        const player = this.stateMachine.owner;
        player.jump();
        player.playAnimation('jump');
    }

    execute(delta) {
        const player = this.stateMachine.owner;
        const input = player.inputManager;
        const horizontal = input.getHorizontal();

        // Air control (reduced)
        if (horizontal !== 0) {
            player.move(horizontal, 0.6);
        }

        // Transition to falling
        if (player.body.velocity.y > 0) {
            this.stateMachine.setState('falling');
            return;
        }
    }
}

export class FallingState extends State {
    enter(prevState) {
        const player = this.stateMachine.owner;
        player.playAnimation('fall');
    }

    execute(delta) {
        const player = this.stateMachine.owner;
        const input = player.inputManager;
        const horizontal = input.getHorizontal();

        if (horizontal !== 0) {
            player.move(horizontal, 0.6);
        }

        if (player.isOnGround()) {
            player.onLand();
            if (input.getHorizontal() !== 0) {
                this.stateMachine.setState('walking');
            } else {
                this.stateMachine.setState('idle');
            }
            return;
        }
    }
}

export class HidingState extends State {
    enter(prevState) {
        const player = this.stateMachine.owner;
        player.enterShellMode();
        player.playAnimation('shell_enter');
    }

    execute(delta) {
        const player = this.stateMachine.owner;
        const input = player.inputManager;

        if (!input.isHidePressed()) {
            this.stateMachine.setState('shell_exit');
            return;
        }

        // Saat hiding, tidak bisa bergerak
        player.setVelocityX(0);
    }
}

export class ShellExitState extends State {
    constructor(name, stateMachine) {
        super(name, stateMachine);
        this.exitTimer = 0;
        this.exitDuration = 300;
    }

    enter(prevState) {
        const player = this.stateMachine.owner;
        player.playAnimation('shell_exit');
        this.exitTimer = 0;
    }

    execute(delta) {
        const player = this.stateMachine.owner;
        this.exitTimer += delta;

        if (this.exitTimer >= this.exitDuration) {
            player.exitShellMode();
            this.stateMachine.setState('idle');
        }
    }
}

export class HurtState extends State {
    constructor(name, stateMachine) {
        super(name, stateMachine);
        this.hurtTimer = 0;
        this.hurtDuration = 500;
    }

    enter(prevState, damage = 1, knockbackDirection = 0) {
        const player = this.stateMachine.owner;
        player.receiveDamage(damage);
        player.playAnimation('hurt');
        player.setTint(0xff0000);

        const knockbackForce = 5;
        player.setVelocity(knockbackDirection * knockbackForce, -3);

        this.hurtTimer = 0;
    }

    execute(delta) {
        this.hurtTimer += delta;

        if (this.hurtTimer >= this.hurtDuration) {
            const player = this.stateMachine.owner;
            player.clearTint();
            this.stateMachine.setState('idle');
        }
    }
}

export class DeadState extends State {
    enter(prevState) {
        const player = this.stateMachine.owner;
        player.playAnimation('death');
        player.setVelocity(0, 0);
        player.onDeath();
    }

    execute(delta) {
        // Dead state - tunggu restart
    }
}

// Export bundle
export const PlayerStates = {
    idle: IdleState,
    walking: WalkingState,
    jumping: JumpingState,
    falling: FallingState,
    hiding: HidingState,
    shell_exit: ShellExitState,
    hurt: HurtState,
    dead: DeadState,
};

export default StateMachine;
