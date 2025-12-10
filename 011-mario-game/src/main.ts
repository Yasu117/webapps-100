import Phaser from 'phaser';

// ----------------------------------------------------------------------------
// Simple Mario-like Game - Single File Ver. (Robust & Clean)
// ----------------------------------------------------------------------------

class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private jumpBtn!: Phaser.Input.Keyboard.Key;
    private debugText!: Phaser.GameObjects.Text;
    private enemies!: Phaser.Physics.Arcade.Group;
    private mushrooms!: Phaser.Physics.Arcade.Group;
    private blocks!: Phaser.Physics.Arcade.StaticGroup;

    // Game State
    private lives = 5;
    private score = 0;
    private isInvincible = false;
    private isHurt = false; // New flag for knockback
    private isBig = false;
    private heartsText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;

    // Virtual Controller State
    private vLeft = false;
    private vRight = false;
    private vJump = false;

    private isGameActive = false;

    // Sound Logic
    private audioCtx: AudioContext | null = null;

    initSound() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    playSound(type: 'jump' | 'stomp' | 'die' | 'clear' | 'coin' | 'powerup' | 'bump') {
        if (!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;

        switch (type) {
            case 'jump':
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(300, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'stomp':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'die':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(50, now + 0.5);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            case 'clear':
                this.playNote(523.25, now, 0.1); // C5
                this.playNote(659.25, now + 0.1, 0.1); // E5
                this.playNote(783.99, now + 0.2, 0.1); // G5
                this.playNote(1046.50, now + 0.3, 0.4); // C6
                break;
            case 'coin':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(900, now);
                osc.frequency.setValueAtTime(1200, now + 0.05);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'powerup':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(600, now + 0.5);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            case 'bump':
                osc.type = 'square';
                osc.frequency.setValueAtTime(100, now);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
        }
    }

    playNote(freq: number, time: number, duration: number) {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.frequency.setValueAtTime(freq, time);
        osc.type = 'square';

        gain.gain.setValueAtTime(0.1, time);
        gain.gain.setValueAtTime(0, time + duration - 0.01);

        osc.start(time);
        osc.stop(time + duration);
    }

    constructor() {
        super('GameScene');
    }

    preload() {
        console.log("Preloading Assets...");

        // 1. Generate Textures Programmatically

        // Player
        const p = this.make.graphics({ x: 0, y: 0 });
        p.fillStyle(0xFF0000); p.fillRect(0, 0, 30, 30);
        p.generateTexture('player', 30, 30);

        // Ground
        const g = this.make.graphics({ x: 0, y: 0 });
        g.fillStyle(0x654321); g.fillRect(0, 4, 32, 28);
        g.fillStyle(0x00AA00); g.fillRect(0, 0, 32, 4);
        g.lineStyle(2, 0x000000); g.strokeRect(0, 0, 32, 32);
        g.generateTexture('ground', 32, 32);

        // Brick
        const b = this.make.graphics({ x: 0, y: 0 });
        b.fillStyle(0xB8860B); b.fillRect(0, 0, 32, 32);
        b.lineStyle(2, 0x550000); b.strokeRect(0, 0, 32, 32);
        b.generateTexture('brick', 32, 32);

        // Enemies
        const e = this.make.graphics({ x: 0, y: 0 });
        e.fillStyle(0x8B0000); e.fillCircle(16, 16, 15);
        e.fillStyle(0xFFCCAC); e.fillRect(8, 20, 16, 12);
        e.generateTexture('enemy', 32, 32);

        // Goal
        const f = this.make.graphics({ x: 0, y: 0 });
        f.fillStyle(0x00FF00); f.fillRect(0, 0, 10, 200);
        f.fillStyle(0xFFFF00); f.fillTriangle(10, 20, 50, 40, 10, 60);
        f.generateTexture('goal', 60, 200);

        // Question Block
        const q = this.make.graphics({ x: 0, y: 0 });
        q.fillStyle(0xFFD700); q.fillRect(0, 0, 32, 32);
        q.lineStyle(2, 0xB8860B); q.strokeRect(0, 0, 32, 32);
        q.fillStyle(0x000000); q.lineStyle(2, 0x000000);
        // Simple '?'
        q.beginPath(); q.moveTo(10, 10); q.lineTo(22, 10); q.lineTo(22, 16); q.lineTo(16, 16); q.lineTo(16, 20); q.strokePath();
        q.fillCircle(16, 26, 2);
        q.generateTexture('block-question', 32, 32);

        // Empty Block
        const eb = this.make.graphics({ x: 0, y: 0 });
        eb.fillStyle(0x805A46); eb.fillRect(0, 0, 32, 32);
        eb.lineStyle(2, 0x000000); eb.strokeRect(0, 0, 32, 32);
        eb.generateTexture('block-empty', 32, 32);

        // Mushroom
        const m = this.make.graphics({ x: 0, y: 0 });
        m.fillStyle(0xFF0000); m.fillCircle(16, 16, 16);
        m.fillStyle(0xFFFFFF); m.fillCircle(8, 10, 4); m.fillCircle(24, 10, 4); m.fillCircle(16, 24, 4);
        m.generateTexture('mushroom', 32, 32);
    }

    create() {
        console.log("Creating Game World...");

        // RESET STATE ON SCENE START
        this.isGameActive = false;
        this.isInvincible = false;
        this.isHurt = false;
        this.lives = 5;
        this.score = 0;
        this.isBig = false;

        // 1. Inputs
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.jumpBtn = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        }

        // 2. Setup Virtual Controller (Touch)
        this.createVirtualController();

        // 3. World (Platforms)
        this.platforms = this.physics.add.staticGroup();
        this.blocks = this.physics.add.staticGroup();
        this.mushrooms = this.physics.add.group(); // Items group

        // Floor
        for (let x = 0; x < 100; x++) {
            // Gap at x=50
            if (x < 48 || x > 52) {
                this.platforms.create(16 + x * 32, 344, 'ground').refreshBody();
            }
        }

        // Blocks
        this.createPlatformRow(20, 25, 250); // Low platform
        this.createPlatformRow(40, 45, 180); // High platform

        // Question Blocks
        this.blocks.create(16 + 22 * 32, 150, 'block-question').refreshBody().setData('type', 'mushroom');
        this.blocks.create(16 + 10 * 32, 200, 'block-question').refreshBody().setData('type', 'coin');
        this.blocks.create(16 + 30 * 32, 200, 'block-question').refreshBody().setData('type', 'coin');

        // 4. Player
        this.player = this.physics.add.sprite(100, 100, 'player');
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(false);
        this.player.setGravityY(1000);

        // 5. Enemies
        this.enemies = this.physics.add.group();
        this.spawnEnemy(600, 300);
        this.spawnEnemy(1200, 300);
        this.spawnEnemy(1500, 100); // Falling enemy

        // Camera
        this.cameras.main.setBounds(0, 0, 3200, 360);
        this.physics.world.setBounds(0, 0, 3200, 600);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);

        // Item Collisions
        this.physics.add.collider(this.mushrooms, this.platforms);
        this.physics.add.collider(this.mushrooms, this.blocks);
        this.physics.add.collider(this.player, this.blocks, (p, b) => this.hitBlock(p, b));

        this.physics.add.overlap(this.player, this.mushrooms, (p, m) => this.hitMushroom(p, m));
        this.physics.add.overlap(this.player, this.enemies, (p, e) => this.hitEnemy(p as Phaser.Physics.Arcade.Sprite, e as Phaser.Physics.Arcade.Sprite));

        // Goal
        const goal = this.physics.add.staticImage(3100, 250, 'goal');
        this.physics.add.overlap(this.player, goal, () => {
            this.finishGame("COURSE CLEAR!");
        });

        // Debug Text
        this.debugText = this.add.text(10, 10, 'TAP TO START', {
            font: '20px monospace', color: '#fff', backgroundColor: '#000'
        }).setScrollFactor(0).setDepth(100);

        // Hearts UI
        this.heartsText = this.add.text(10, 40, '', {
            font: '24px monospace', color: '#ff0000', backgroundColor: '#00000055'
        }).setScrollFactor(0).setDepth(100);

        // Score UI
        this.scoreText = this.add.text(10, 70, 'SCORE: 0', {
            font: '20px monospace', color: '#fff', backgroundColor: '#00000055'
        }).setScrollFactor(0).setDepth(100);

        this.updateHeartsUI(); // Initial hearts render

        // Start Logic
        this.physics.pause();
        this.input.on('pointerdown', () => {
            if (!this.isGameActive) {
                this.isGameActive = true;
                this.lives = 5; // Reset UI
                this.score = 0;
                this.isBig = false;
                this.isInvincible = false;
                this.updateHeartsUI();
                this.scoreText.setText('SCORE: 0');

                this.physics.resume();
                this.debugText.setText('');
                this.initSound(); // Initialize Sound
            }
        });

        console.log("Game World Created!");
    }

    createPlatformRow(start: number, end: number, y: number) {
        for (let i = start; i < end; i++) {
            this.platforms.create(16 + i * 32, y, 'brick').refreshBody();
        }
    }

    spawnEnemy(x: number, y: number) {
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocityX(-50); // Move left
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true); // Don't fall off world edges easily
    }

    // ACTION HANDLERS

    hitBlock(player: any, block: any) {
        if (block.texture.key === 'block-empty') return;

        // Check if hit from bottom
        if (player.body.touching.up && block.body.touching.down) {
            this.playSound('bump');

            // Disable block
            block.setTexture('block-empty');

            // Bump animation
            this.tweens.add({
                targets: block,
                y: block.y - 10,
                duration: 50,
                yoyo: true
            });

            const type = block.getData('type');
            if (type === 'coin') {
                this.playSound('coin');
                this.score += 100;
                this.scoreText.setText(`SCORE: ${this.score}`);
            } else if (type === 'mushroom') {
                this.playSound('powerup');
                // Spawn Mushroom
                const mush = this.mushrooms.create(block.x, block.y - 32, 'mushroom');

                // Pop up and move
                mush.setVelocity(80, -150); // Gentle hop
                mush.setBounce(1, 0);
                mush.setCollideWorldBounds(true);
                mush.setGravityY(1000); // Ensure strong gravity

                // Smaller hitbox to help it fall into gaps
                mush.setSize(24, 24);
            }
        }
    }

    hitMushroom(player: any, mushroom: any) {
        mushroom.destroy();
        this.playSound('powerup');

        // Full Heal
        this.lives = 5;
        this.updateHeartsUI();

        this.score += 1000;
        this.scoreText.setText(`SCORE: ${this.score}`);

        if (!this.isBig) {
            this.isBig = true;
            this.tweens.add({
                targets: player,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 200,
                yoyo: false
            });
        }
    }

    hitEnemy(player: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
        // Simple bounds check for stomping
        // Player must be falling AND collision must be from above

        // Check if player is falling (velocity > 0) or at least not jumping up strictly
        // And ensure player is visually above the enemy center somewhat
        const isFalling = player.body!.velocity.y > 0;
        const isAbove = player.y < enemy.y - 10; // Slightly above center

        if (isFalling && isAbove) {
            // Stomp
            enemy.destroy();
            player.setVelocityY(-400);
            this.playSound('stomp');
        } else {
            // Damage / Die logic
            console.log(`Hit Enemy! Invincible: ${this.isInvincible}, Lives: ${this.lives}`);

            if (this.isInvincible) return;

            this.lives--;
            console.log(`Lives decreased to: ${this.lives}`);
            this.updateHeartsUI();

            if (this.lives <= 0) {
                this.finishGame("GAME OVER");
            } else {
                // Damage (Not Dead)
                this.playSound('die');

                // Knockback & Input Block
                this.isHurt = true;
                this.time.delayedCall(400, () => { this.isHurt = false; });

                // Knockback velocity
                player.setVelocityY(-250);
                if (player.x < enemy.x) {
                    player.setVelocityX(-250);
                } else {
                    player.setVelocityX(250);
                }

                // Invincibility visualization
                this.isInvincible = true;
                this.tweens.add({
                    targets: player,
                    alpha: 0,
                    duration: 100,
                    repeat: 10,
                    yoyo: true,
                    onComplete: () => {
                        this.isInvincible = false;
                        player.alpha = 1;
                    }
                });
            }
        }
    }

    updateHeartsUI() {
        let hearts = '';
        for (let i = 0; i < this.lives; i++) {
            hearts += '❤';
        }
        this.heartsText.setText(hearts);
    }

    finishGame(msg: string) {
        this.physics.pause();
        this.isGameActive = false;
        this.add.text(this.cameras.main.scrollX + 320, 180, msg, { fontSize: '40px', color: '#fff', backgroundColor: '#000' }).setOrigin(0.5);
        if (msg === "GAME OVER") {
            this.playSound('die');
        } else if (msg === "COURSE CLEAR!") {
            this.playSound('clear');
        }
        this.time.delayedCall(2000, () => this.scene.restart());
    }

    update() {
        if (!this.isGameActive) return;
        if (!this.player.active) return;

        // If hurt/knockback, disable input control so player flies back
        if (this.isHurt) return;

        const speed = 200;
        const jumpForce = -500;

        // Reset velocity x
        this.player.setVelocityX(0);

        // Input Logic (Keyboard OR Virtual)
        const left = this.cursors?.left.isDown || this.vLeft;
        const right = this.cursors?.right.isDown || this.vRight;
        const jump = (this.cursors?.up.isDown || this.jumpBtn?.isDown || this.vJump);

        // Just pressed check for jump sound?
        // Phaser keys have JustDown, checking manually for virtual is harder.
        // Let's just play sound if jumping and touching down
        const isGrounded = this.player.body?.touching.down;

        if (left) {
            this.player.setVelocityX(-speed);
        } else if (right) {
            this.player.setVelocityX(speed);
        }

        if (jump && isGrounded) {
            this.player.setVelocityY(jumpForce);
            this.playSound('jump');
        }

        // Fall Death Check
        if (this.player.y > 400) {
            this.finishGame("GAME OVER"); // Use finishGame for consistent death handling
        }

        this.debugText.setText(`X: ${Math.floor(this.player.x)}`);
    }

    createVirtualController() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Left Zone (Move Left)
        const zoneLeft = this.add.zone(0, height / 2, width / 3, height / 2).setOrigin(0).setScrollFactor(0).setInteractive();
        zoneLeft.on('pointerdown', () => this.vLeft = true);
        zoneLeft.on('pointerup', () => this.vLeft = false);
        zoneLeft.on('pointerout', () => this.vLeft = false); // Safety

        // Center Zone (Move Right) - a bit rough logic but works
        const zoneRight = this.add.zone(width / 3, height / 2, width / 3, height / 2).setOrigin(0).setScrollFactor(0).setInteractive();
        zoneRight.on('pointerdown', () => this.vRight = true);
        zoneRight.on('pointerup', () => this.vRight = false);
        zoneRight.on('pointerout', () => this.vRight = false);

        // Right Zone (Jump)
        const zoneJump = this.add.zone(width * 2 / 3, height / 2, width / 3, height / 2).setOrigin(0).setScrollFactor(0).setInteractive();
        zoneJump.on('pointerdown', () => this.vJump = true);
        zoneJump.on('pointerup', () => this.vJump = false);
        zoneJump.on('pointerout', () => this.vJump = false);

        // Visual Guides
        const gfx = this.add.graphics().setScrollFactor(0);
        gfx.fillStyle(0xFFFFFF, 0.1);
        gfx.fillRect(10, height - 60, 50, 50); // L
        gfx.fillRect(70, height - 60, 50, 50); // R
        gfx.fillStyle(0xFF0000, 0.2);
        gfx.fillCircle(width - 50, height - 35, 30); // J

        this.add.text(20, height - 45, '<', { fontSize: '20px' }).setScrollFactor(0);
        this.add.text(85, height - 45, '>', { fontSize: '20px' }).setScrollFactor(0);
        this.add.text(width - 60, height - 45, 'J', { fontSize: '20px' }).setScrollFactor(0);
    }
}

// ----------------------------------------------------------------------------
// Game Config & Entry
// ----------------------------------------------------------------------------

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    backgroundColor: '#5C94FC',
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 }, // Will set per sprite
            debug: false
        }
    },
    scene: [GameScene]
};

new Phaser.Game(config);
