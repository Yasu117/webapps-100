'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Types } from 'phaser';

export default function MarioGamePage() {
    const gameRef = useRef<HTMLDivElement>(null);
    const gameInstance = useRef<Phaser.Game | null>(null);

    // Shared input state between React and Phaser
    const inputRef = useRef({ left: false, right: false, up: false, down: false });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!gameRef.current) return;

        let cancelled = false;

        const initGame = async () => {
            const Phaser = await import('phaser');
            const { Game, Scene, Scale, Input, AUTO } = Phaser.default;

            if (cancelled) return;

            class GameScene extends Scene {
                private player!: Phaser.Physics.Arcade.Sprite;
                private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
                private platforms!: Phaser.Physics.Arcade.StaticGroup;
                private jumpBtn!: Phaser.Input.Keyboard.Key;
                private debugText!: Phaser.GameObjects.Text;
                private enemies!: Phaser.Physics.Arcade.Group;
                private mushrooms!: Phaser.Physics.Arcade.Group;
                private blocks!: Phaser.Physics.Arcade.StaticGroup;

                // Game State
                private lives = 5;
                private score = 0;
                private isInvincible = false;
                private isHurt = false;
                private isBig = false;
                private heartsText!: Phaser.GameObjects.Text;
                private scoreText!: Phaser.GameObjects.Text;

                private isGameActive = false;
                private audioCtx: AudioContext | null = null;

                constructor() {
                    super('GameScene');
                }

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

                preload() {
                    // Generate Textures Programmatically
                    const p = this.make.graphics({ x: 0, y: 0 });
                    p.fillStyle(0xFF0000); p.fillRect(0, 0, 30, 30);
                    p.generateTexture('player', 30, 30);

                    const g = this.make.graphics({ x: 0, y: 0 });
                    g.fillStyle(0x654321); g.fillRect(0, 4, 32, 28);
                    g.fillStyle(0x00AA00); g.fillRect(0, 0, 32, 4);
                    g.lineStyle(2, 0x000000); g.strokeRect(0, 0, 32, 32);
                    g.generateTexture('ground', 32, 32);

                    const b = this.make.graphics({ x: 0, y: 0 });
                    b.fillStyle(0xB8860B); b.fillRect(0, 0, 32, 32);
                    b.lineStyle(2, 0x550000); b.strokeRect(0, 0, 32, 32);
                    b.generateTexture('brick', 32, 32);

                    const e = this.make.graphics({ x: 0, y: 0 });
                    e.fillStyle(0x8B0000); e.fillCircle(16, 16, 15);
                    e.fillStyle(0xFFCCAC); e.fillRect(8, 20, 16, 12);
                    e.generateTexture('enemy', 32, 32);

                    const f = this.make.graphics({ x: 0, y: 0 });
                    f.fillStyle(0x00FF00); f.fillRect(0, 0, 10, 200);
                    f.fillStyle(0xFFFF00); f.fillTriangle(10, 20, 50, 40, 10, 60);
                    f.generateTexture('goal', 60, 200);

                    const q = this.make.graphics({ x: 0, y: 0 });
                    q.fillStyle(0xFFD700); q.fillRect(0, 0, 32, 32);
                    q.lineStyle(2, 0xB8860B); q.strokeRect(0, 0, 32, 32);
                    q.fillStyle(0x000000); q.lineStyle(2, 0x000000);
                    q.beginPath(); q.moveTo(10, 10); q.lineTo(22, 10); q.lineTo(22, 16); q.lineTo(16, 16); q.lineTo(16, 20); q.strokePath();
                    q.fillCircle(16, 26, 2);
                    q.generateTexture('block-question', 32, 32);

                    const eb = this.make.graphics({ x: 0, y: 0 });
                    eb.fillStyle(0x805A46); eb.fillRect(0, 0, 32, 32);
                    eb.lineStyle(2, 0x000000); eb.strokeRect(0, 0, 32, 32);
                    eb.generateTexture('block-empty', 32, 32);

                    const m = this.make.graphics({ x: 0, y: 0 });
                    m.fillStyle(0xFF0000); m.fillCircle(16, 16, 16);
                    m.fillStyle(0xFFFFFF); m.fillCircle(8, 10, 4); m.fillCircle(24, 10, 4); m.fillCircle(16, 24, 4);
                    m.generateTexture('mushroom', 32, 32);
                }

                create() {
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
                        this.jumpBtn = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
                    }

                    // 2. Setup Virtual Controller (Removed Internal Virtual Controller Logic)
                    // We are now using external React inputs via inputRef

                    // 3. World (Platforms)
                    this.platforms = this.physics.add.staticGroup();
                    this.blocks = this.physics.add.staticGroup();
                    this.mushrooms = this.physics.add.group();

                    // Floor
                    for (let x = 0; x < 100; x++) {
                        if (x < 48 || x > 52) {
                            this.platforms.create(16 + x * 32, 344, 'ground').refreshBody();
                        }
                    }

                    // Blocks
                    this.createPlatformRow(20, 25, 250);
                    this.createPlatformRow(40, 45, 180);

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
                    this.spawnEnemy(1500, 100);

                    // Camera
                    this.cameras.main.setBounds(0, 0, 3200, 360);
                    this.physics.world.setBounds(0, 0, 3200, 600);
                    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

                    // Collisions
                    this.physics.add.collider(this.player, this.platforms);
                    this.physics.add.collider(this.enemies, this.platforms);

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
                    this.debugText = this.add.text(10, 10, 'TAP SCREEN TO START', {
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

                    this.updateHeartsUI();

                    // Start Logic
                    this.physics.pause();
                    this.input.on('pointerdown', () => {
                        if (!this.isGameActive) {
                            this.startGame();
                        }
                    });
                }

                startGame() {
                    this.isGameActive = true;
                    this.lives = 5;
                    this.score = 0;
                    this.isBig = false;
                    this.isInvincible = false;
                    this.updateHeartsUI();
                    this.scoreText.setText('SCORE: 0');

                    this.physics.resume();
                    this.debugText.setText('');
                    this.initSound();

                    // Respawn logic if needed
                    this.player.setPosition(100, 100);
                    this.player.setVelocity(0, 0);
                    this.enemies.clear(true, true);
                    this.spawnEnemy(600, 300);
                    this.spawnEnemy(1200, 300);
                    this.spawnEnemy(1500, 100);
                }

                createPlatformRow(start: number, end: number, y: number) {
                    for (let i = start; i < end; i++) {
                        this.platforms.create(16 + i * 32, y, 'brick').refreshBody();
                    }
                }

                spawnEnemy(x: number, y: number) {
                    const enemy = this.enemies.create(x, y, 'enemy');
                    enemy.setVelocityX(-50);
                    enemy.setBounce(1);
                    enemy.setCollideWorldBounds(true);
                }

                hitBlock(player: any, block: any) {
                    if (block.texture.key === 'block-empty') return;

                    if (player.body.touching.up && block.body.touching.down) {
                        this.playSound('bump');
                        block.setTexture('block-empty');
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
                            const mush = this.mushrooms.create(block.x, block.y - 32, 'mushroom');
                            // Gentle hop and fall
                            mush.setVelocity(80, -150);
                            mush.setBounce(1, 0); // Bounce only on walls (X)
                            mush.setCollideWorldBounds(true);
                            mush.setGravityY(1000); // Ensure falls
                            mush.setSize(24, 24);
                        }
                    }
                }

                hitMushroom(player: any, mushroom: any) {
                    mushroom.destroy();
                    this.playSound('powerup');
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
                    const isFalling = player.body!.velocity.y > 0;
                    const isAbove = player.y < enemy.y - 10;

                    if (isFalling && isAbove) {
                        enemy.destroy();
                        player.setVelocityY(-400);
                        this.playSound('stomp');
                    } else {
                        if (this.isInvincible) return;

                        this.lives--;
                        this.updateHeartsUI();

                        if (this.lives <= 0) {
                            this.finishGame("GAME OVER");
                        } else {
                            this.playSound('die');
                            this.isHurt = true;
                            this.time.delayedCall(400, () => { this.isHurt = false; });
                            player.setVelocityY(-250);
                            if (player.x < enemy.x) {
                                player.setVelocityX(-250);
                            } else {
                                player.setVelocityX(250);
                            }
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
                    if (this.isHurt) return;

                    const speed = 200;
                    const jumpForce = -500;

                    this.player.setVelocityX(0);

                    // Combine Keyboard and External Ref Inputs
                    const left = this.cursors?.left.isDown || inputRef.current.left;
                    const right = this.cursors?.right.isDown || inputRef.current.right;
                    const jump = (this.cursors?.up.isDown || this.jumpBtn?.isDown || inputRef.current.up);
                    const isGrounded = this.player.body?.touching.down;

                    if (left) {
                        this.player.setVelocityX(-speed);
                        this.player.setFlipX(true);
                    } else if (right) {
                        this.player.setVelocityX(speed);
                        this.player.setFlipX(false);
                    }

                    if (jump && isGrounded) {
                        this.player.setVelocityY(jumpForce);
                        this.playSound('jump');
                    }

                    if (this.player.y > 400) {
                        this.finishGame("GAME OVER");
                    }

                    this.debugText.setText(`Pos: ${Math.floor(this.player.x)}`);
                }
            }

            const config: Types.Core.GameConfig = {
                type: AUTO,
                width: 640,
                height: 360,
                backgroundColor: '#5C94FC',
                parent: gameRef.current,
                scale: {
                    mode: Scale.FIT,
                    autoCenter: Scale.CENTER_BOTH
                },
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 0, x: 0 },
                        debug: false
                    }
                },
                scene: [GameScene]
            };

            const game = new Game(config);
            gameInstance.current = game;
        };

        if (gameRef.current && !gameInstance.current) {
            initGame();
        }

        return () => {
            cancelled = true;
            if (gameInstance.current) {
                gameInstance.current.destroy(true);
                gameInstance.current = null;
            }
        };
    }, []);

    // Handlers
    const handleStart = (key: 'left' | 'right' | 'up' | 'down') => {
        inputRef.current[key] = true;
    };

    const handleEnd = (key: 'left' | 'right' | 'up' | 'down') => {
        inputRef.current[key] = false;
    };

    const preventDefault = (e: React.TouchEvent | React.MouseEvent) => {
        // Prevent default behavior if needed, e.g. text selection or scrolling
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-2 select-none touch-none">
            <Link href="/apps" className="fixed top-4 left-4 z-50 p-3 bg-slate-900/90 text-slate-100 rounded-full hover:bg-slate-800 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <h1 className="text-white mb-2 font-bold text-xl">Mario Game (Phaser)</h1>

            {/* Game Container */}
            <div className="w-full max-w-[640px] aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-slate-700 relative">
                <div
                    ref={gameRef}
                    className="w-full h-full"
                />
            </div>

            {/* Famicom Controller */}
            <div className="w-full max-w-[600px] mt-6 relative">
                {/* Controller Body */}
                <div className="bg-[#8b0000] rounded-xl p-2 sm:p-4 shadow-[0_10px_0_rgb(60,0,0)] border-b-4 border-[#5d0000] relative">

                    {/* Gold Faceplate */}
                    <div className="bg-[#bd9f5c] rounded lg:rounded-lg p-4 flex justify-between items-center shadow-inner border border-[#8f7536] relative overflow-hidden">
                        {/* Brushed metal effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10 pointer-events-none"></div>

                        {/* LEFT: D-Pad */}
                        <div className="relative w-36 h-36 flex-shrink-0">
                            {/* D-Pad Container */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32">
                                {/* Up */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-11 bg-[#1a1a1a] rounded-t shadow-md z-10 active:bg-black"></div>
                                {/* Down */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-11 bg-[#1a1a1a] rounded-b shadow-md z-10 active:bg-black"></div>
                                {/* Left */}
                                <button
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-10 bg-[#1a1a1a] rounded-l shadow-md z-20 active:translate-y-[1px] active:bg-[#000]"
                                    onMouseDown={(e) => { preventDefault(e); handleStart('left'); }}
                                    onMouseUp={(e) => { preventDefault(e); handleEnd('left'); }}
                                    onMouseLeave={() => handleEnd('left')}
                                    onTouchStart={(e) => { handleStart('left'); }}
                                    onTouchEnd={(e) => { handleEnd('left'); }}
                                ></button>
                                {/* Right */}
                                <button
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-10 bg-[#1a1a1a] rounded-r shadow-md z-20 active:translate-y-[1px] active:bg-[#000]"
                                    onMouseDown={(e) => { preventDefault(e); handleStart('right'); }}
                                    onMouseUp={(e) => { preventDefault(e); handleEnd('right'); }}
                                    onMouseLeave={() => handleEnd('right')}
                                    onTouchStart={(e) => { handleStart('right'); }}
                                    onTouchEnd={(e) => { handleEnd('right'); }}
                                ></button>
                                {/* Center */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#1a1a1a] z-10">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-white/5 to-black/20"></div>
                                </div>
                            </div>
                        </div>

                        {/* MIDDLE: Select / Start (Visual Only) */}
                        <div className="hidden sm:flex gap-4 self-end mb-4 mx-4">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-12 h-4 bg-[#1a1a1a] rounded-full transform -rotate-12 border border-black/50 shadow-[0_1px_0_rgba(255,255,255,0.2)]"></div>
                                <span className="text-[10px] font-bold text-[#8b0000] uppercase tracking-widest mt-1">Select</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-12 h-4 bg-[#1a1a1a] rounded-full transform -rotate-12 border border-black/50 shadow-[0_1px_0_rgba(255,255,255,0.2)]"></div>
                                <span className="text-[10px] font-bold text-[#8b0000] uppercase tracking-widest mt-1">Start</span>
                            </div>
                        </div>

                        {/* RIGHT: A / B Buttons */}
                        <div className="flex gap-4 sm:gap-6 pr-2 sm:pr-6 items-end relative top-2">
                            {/* B Button */}
                            <div className="flex flex-col items-end group">
                                <button
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black shadow-[0_3px_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none border border-gray-800 relative overflow-hidden"
                                    onMouseDown={(e) => { preventDefault(e); handleStart('up'); }}
                                    onMouseUp={(e) => { preventDefault(e); handleEnd('up'); }}
                                    onMouseLeave={() => handleEnd('up')}
                                    onTouchStart={(e) => { handleStart('up'); }}
                                    onTouchEnd={(e) => { handleEnd('up'); }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full"></div>
                                </button>
                                <span className="font-bold text-[#8b0000] mr-2 mt-1">B</span>
                            </div>

                            {/* A Button */}
                            <div className="flex flex-col items-end relative -top-4 group">
                                <button
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black shadow-[0_3px_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none border border-gray-800 relative overflow-hidden"
                                    onMouseDown={(e) => { preventDefault(e); handleStart('up'); }}
                                    onMouseUp={(e) => { preventDefault(e); handleEnd('up'); }}
                                    onMouseLeave={() => handleEnd('up')}
                                    onTouchStart={(e) => { handleStart('up'); }}
                                    onTouchEnd={(e) => { handleEnd('up'); }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full"></div>
                                </button>
                                <span className="font-bold text-[#8b0000] mr-2 mt-1">A</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-2 right-4 text-[#5d0000] text-xs font-bold tracking-widest opacity-50">
                        NINTENDO FAMILY COMPUTER
                    </div>
                </div>
            </div>

            <p className="text-slate-500 mt-4 text-sm text-center">
                Controls: Use D-Pad Left/Right to move. A or B to Jump.<br />
                Tap the game screen to start/focus.
            </p>
        </div>
    );
}
