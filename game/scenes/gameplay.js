import {WIDTH_CANVAS, PADDING_CANVAS, HEIGHT_CANVAS, FONT_DEFAULT, FONT_TITLE} from '../globals.js';
import LEVELS from '../data/LEVELS.js';
import BADDIES from '../data/baddies.js';


const MAP_WIDTH = 1500;
const MAP_HEIGHT = 1000;
// PHYSICS
const RUN_ACCEL = 0.2;
const RUN_DECEL = 1;
const MAX_SPEED = 5;

const dude = {
    xvel: 0,
    yvel: 0,
    width: 128,
    height: 128,
    hp_max: 5,
    hp_current: 5,
    level: 1
}

let bullets = [];
let baddies = [];
let ghosts = [];
let ghost_count = 0;
let stored_actions = [];
const fireRate = 600;
let nextFire = fireRate;
const spawnRate = 1000;
const bulletSpeed = 12;
const hitInvince = 1000;
const time_limit = 10;
let timer = time_limit;
let second_count;
let nextInvince = 0;
let scene_playing = false;

export default new Phaser.Class({
	Extends: Phaser.Scene,
	initialize: function()
	{
		Phaser.Scene.call(this, {key: 'gameplay'});
	},
	preload: function()
	{
		// this.load.image('bullet', 'assets/sprites/purple_ball.png');
        this.load.atlas("tiles", "assets/dungeon_tiles.png", "assets/dungeon_tiles.json");
        this.load.image('bullet', 'assets/sprites/rifle_bullet.png');
        this.load.image('smoke_trail', 'assets/sprites/smoke_trail.png');
        this.load.image('blood', 'assets/sprites/blood.png');
        this.load.image('time_effect', 'assets/sprites/time_effect.png');


        this.load.spritesheet('final_boss',
            'assets/sprites/final_boss.png',
            {frameWidth: 128, frameHeight: 64}
        );

        this.load.spritesheet('idle',
            'assets/sprites/idle.png',
            {frameWidth: 16, frameHeight: 20}
        );

        this.load.spritesheet("run",
            "assets/sprites/run.png",
            {frameWidth: 16, frameHeight: 20}
        );

        this.load.spritesheet("fire",
            "assets/sprites/fire.png",
            {frameWidth: 16, frameHeight: 20}
        );

        this.load.spritesheet("death",
            "assets/sprites/death.png",
            {frameWidth: 16, frameHeight: 20}
        );

        this.load.spritesheet("eyeball",
            "assets/sprites/eyeball.png",
            {frameWidth: 16, frameHeight: 16}
        );

        this.load.spritesheet("scampy",
            "assets/sprites/scampy.png",
            {frameWidth: 16, frameHeight: 16}
        );

        this.load.spritesheet("fomp",
            "assets/sprites/fomp.png",
            {frameWidth: 16, frameHeight: 16}
        );

        this.load.spritesheet("peeker",
            "assets/sprites/peeker.png",
            {frameWidth: 16, frameHeight: 16}
        );

        //soundfx
        this.load.audio("magic_missle", "assets/soundfx/magic_missle.mp3");
        this.load.audio("time_travel", "assets/soundfx/time_travel.mp3");
        this.load.audio("theme", "assets/soundfx/theme.mp3");
        this.load.audio("baddie_hit", "assets/soundfx/baddie_hit.wav");
        this.load.audio("player_hit", "assets/soundfx/player_hit.wav");
        this.load.audio("level_complete", "assets/soundfx/level_complete.mp3");
        
	},
	create: function()
	{
        let floor_tiles = ['floor-1','floor-1','floor-1','floor-1','floor-1','floor-1','floor-1','floor-1',
        'floor-1','floor-1','floor-1','floor-1','floor-1','floor-1','floor-1','floor-1','floor-3', 'floor-4', 'floor-5'];


        for(let i = 64; i < MAP_WIDTH - 64; i+=64)
        {
            for(let j = 64; j < MAP_HEIGHT; j+=64)
            {
                const display_tile_index = Math.floor(Math.random() * floor_tiles.length)
                const display_tile = floor_tiles[display_tile_index];
                this.add.image(i, j, "tiles", display_tile).setScale(4).setOrigin(0);
            }
        }

        
 
        for(let i = 64; i < MAP_WIDTH-64; i+=64)
        {
            this.add.image(i, 0, "tiles", 'top-wall').setScale(4).setOrigin(0);
            this.add.image(i, MAP_HEIGHT - 64, "tiles", 'top-wall').setScale(4).setOrigin(0);
        }
        for(let i = 64; i < MAP_WIDTH-64; i+=64)
        {
            this.add.image(i, 64, "tiles", 'wall').setScale(4).setOrigin(0);;
        }

        for(let i = 64; i < MAP_HEIGHT; i+=64)
        {
            this.add.image(64, i, "tiles", 'left-wall').setScale(4).setOrigin(0);
            this.add.image(MAP_WIDTH-10, i, "tiles", 'right-wall').setScale(4).setOrigin(0);
        }


        //load sounds

        //load anims
        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("idle", {start: 0, end: 14}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("run", {start: 0, end: 4}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: "fire",
            frames: this.anims.generateFrameNumbers("fire", {start: 4, end: 16}),
            frameRate: 30,
        });

        this.anims.create({
            key: "victory",
            frames: this.anims.generateFrameNumbers("fire", {start: 4, end: 16}),
            frameRate: 30,
            repeat: -1
        });

        this.anims.create({
            key: "death",
            frames: this.anims.generateFrameNumbers("death", {start: 0, end: 10}),
            frameRate: 10,
        });

        this.anims.create({
            key: "final_boss",
            frames: this.anims.generateFrameNumbers("final_boss", {start: 0, end: 0}),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: "eyeball",
            frames: this.anims.generateFrameNumbers("eyeball", {start: 0, end: 24}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "scampy",
            frames: this.anims.generateFrameNumbers("scampy", {start: 0, end: 8}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "fomp",
            frames: this.anims.generateFrameNumbers("fomp", {start: 0, end: 9}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "peeker",
            frames: this.anims.generateFrameNumbers("peeker", {start: 0, end: 9}),
            frameRate: 15,
            repeat: -1
        });


        this.input.setDefaultCursor('url(assets/sprites/crosshair.png), pointer');
        dude.sprite = this.add.sprite(MAP_WIDTH/2, MAP_HEIGHT/2, 'dude').setDisplaySize(dude.width, dude.height).setDepth(4);

        this.cameras.main.startFollow(dude.sprite);
        this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.cameras.main.setZoom(1);
        
        for(let i = 0; i < LEVELS[dude.level-1].spawns.length; i++)
        {
            spawn_enemy(this, LEVELS[dude.level-1].spawns[i]);
        }

        this.cursors = this.input.keyboard.addKeys("UP,LEFT,DOWN,RIGHT,W,A,S,D,R,SPACE");
        this.ui = {
            top_hud_bg: this.add.graphics().fillStyle(0x000000, 0.7).fillRect(0, 0, WIDTH_CANVAS, 60).setPosition(0, 0),
            // bottom_hud_bg: this.add.graphics().fillStyle(0x000000, 0.7).fillRect(0, 0, WIDTH_CANVAS, 40).setPosition(0, HEIGHT_CANVAS-40),
            bar_bg: this.add.graphics().fillStyle(0xcc2418, 1).fillRect(0, -2, 204, 38).setPosition(14, 14),
            bar: this.add.graphics().fillStyle(0xebb134, 1).fillRect(0, 0, 200, 30).setPosition(16, 16),
            health_display: this.add.text(52, 18, "Health: " + dude.hp_max, {fontSize: "24px", fill: "#000"}),
            text_timer: this.add.text(500, 18, + timer + " SECONDS REMAIN", {fontSize: "24px", fill: "white"}),
            baddies_left: this.add.text(WIDTH_CANVAS-300, 18, "Enemies Remaining " + baddies.length, {fontSize: "24px", fill: "white"}),
            text_level: this.add.text(WIDTH_CANVAS-150, HEIGHT_CANVAS - 30, "LEVEL: " + dude.level, {fontSize: "24px", fill: "white"}),
        };

        for(const key_object in this.ui)
            this.ui[key_object].setScrollFactor(0).setDepth(4);

        second_count = this.time.addEvent({ delay: 1000, callback: addSecond, callbackScope: this, loop: true });
        second_count.paused = true;
        startLoop(this);
        dude.sprite.play("idle");
	},
    update: function()
    {   
        if(scene_playing === false)
        {
            if(second_count.paused === true)
            {
                second_count.paused = false;  
            }

            if(dude.level === 5 && this.ui.final_boss_hp_bg === undefined)
            {
                this.ui.final_boss_hp_bg = this.add.graphics().fillStyle(0xcc2418, 1).fillRect(0, -2, 800, 38).setPosition(WIDTH_CANVAS/2 - 400, HEIGHT_CANVAS-102).setScrollFactor(0).setDepth(4);
            }
            // console.log(random.float(0, 5));
            // random.lcg.reset();
            const left = this.cursors.A.isDown || this.cursors.LEFT.isDown;
            const right = this.cursors.D.isDown || this.cursors.RIGHT.isDown;
            const up = this.cursors.W.isDown || this.cursors.UP.isDown;
            const down = this.cursors.S.isDown || this.cursors.DOWN.isDown;
            stored_actions.push(
                {
                    x: dude.sprite.x,
                    y: dude.sprite.y,
                    fire: this.input.activePointer.isDown && this.time.now > nextFire,
                    mousex: this.input.mousePointer.x+this.cameras.main._scrollX,
                    mousey: this.input.mousePointer.y+this.cameras.main._scrollY,
                    animation: dude.sprite.anims.currentAnim.key
                }
            )
            if(this.cursors.R.isDown)
            {
                dude.sprite.x = MAP_WIDTH/2;
                dude.sprite.y = MAP_HEIGHT/2;
                for(const ghost of ghosts)
                {
                    ghost.sprite.destroy();
                }
                ghosts = [];
                stored_actions = [];
                restartTimeLoop(this, true);
                if(dude.level === 5)
                {
                    this.ui.final_boss_hp_bg.scaleX = 1;
                } 
            }
            if(left === right)
            {
                if(dude.xvel > 0)
                    dude.xvel = Math.max(0, dude.xvel - RUN_DECEL);
                else
                    dude.xvel = Math.min(0, dude.xvel + RUN_DECEL);
            
                dude.sprite.x += dude.xvel;
            }

            if(up === down)
            {
                if(dude.yvel > 0)
                    dude.yvel = Math.max(0, dude.yvel - RUN_DECEL);
                else
                    dude.yvel = Math.min(0, dude.yvel + RUN_DECEL);

                dude.sprite.y += dude.yvel;
            }

            if(left === right && up === down && !(dude.sprite.anims.isPlaying && dude.sprite.anims.currentAnim.key === 'fire'))
            {
                dude.sprite.anims.play("idle", true);
            }

            if (left)
            {
                dude.xvel = Math.max(-MAX_SPEED, dude.xvel - RUN_ACCEL);
                dude.sprite.x += dude.xvel;  
            }
            else if (right)
            {
                dude.xvel = Math.min(MAX_SPEED, dude.xvel + RUN_ACCEL);
                dude.sprite.x += dude.xvel;
            }
        
            if(up)
            {
                dude.yvel = Math.max(-MAX_SPEED, dude.yvel - RUN_ACCEL);
                dude.sprite.y += dude.yvel;
            }
            else if (down)
            {
                dude.yvel = Math.min(MAX_SPEED, dude.yvel + RUN_ACCEL);
                dude.sprite.y += dude.yvel;
            }


            if((down || up || right || left) && !(dude.sprite.anims.isPlaying && dude.sprite.anims.currentAnim.key === 'fire'))
            {
                dude.sprite.anims.play("run", true);
            }

            if(dude.sprite.x - dude.width/2 - 40 < 0)
            {
                dude.sprite.x = dude.width/2 + 40;
            }
            if(dude.sprite.x + dude.width/2 - 10 > MAP_WIDTH)
            {
                dude.sprite.x = MAP_WIDTH - dude.width/2 + 10;
            }

            if(dude.sprite.y - dude.height/2 - 30 < 0)
            {
                dude.sprite.y = dude.height/2 + 30;
            }
            if(dude.sprite.y + dude.height/2 - 10 > MAP_HEIGHT)
            {
                dude.sprite.y = MAP_HEIGHT - dude.height/2 + 10;
            }

            if(this.input.mousePointer.x + this.cameras.main._scrollX < dude.sprite.x)
            {
                dude.sprite.flipX = true;
            }
            else
            {
                dude.sprite.flipX = false;
            }

            if (this.input.activePointer.isDown)
            {
                fire(this, this.input.mousePointer.x+this.cameras.main._scrollX, this.input.mousePointer.y+this.cameras.main._scrollY, dude.sprite.x, dude.sprite.y, true);
            }

            move_bullets(this);
            move_baddies(this);
            move_ghosts(this);
            //620
            if(stored_actions.length === 620)
            {
                timer--;
                this.ui.text_timer.setText(timer + " SECONDS REMAIN");
                restartTimeLoop(this, false);  
            }
        }

    }
});

function addSecond()
{
    if(scene_playing === false)
    {
        
        // if(timer === 0)
        // {
        //     // this.ui.text_timer.setText(timer + " SECONDS REMAIN");
        //     // restartTimeLoop(this, false);     
        // }
        if(timer > 1)
        {
            timer--;
            this.ui.text_timer.setText(timer + " SECONDS REMAIN");
        }
    }
}

function fire(game, mousex, mousey, spritex, spritey, reload)
{
	if(game.time.now > nextFire || reload === false)
	{
        if(reload === true)
        {
            game.sound.play("magic_missle", {volume: 0.2});
            nextFire = game.time.now + fireRate;
            dude.sprite.anims.play("fire");
        }
        else
        {
            game.sound.play("magic_missle", {volume: 0.1});
        }
        
        const xvelocity = (mousex - spritex + 15);
        const yvelocity = (mousey - spritey + 15);
        const vector_length = Math.sqrt(xvelocity**2 + yvelocity**2);
        bullets.push({   
            sprite: game.add.sprite(spritex + (xvelocity/vector_length)*80, spritey + (yvelocity/vector_length)*80, 'bullet'),
            xvel: (xvelocity/vector_length) * bulletSpeed,
            yvel: (yvelocity/vector_length) * bulletSpeed,
            damage: 1,
            life: 100,
            delete: false
        })
        game.emitter_shoot.explode(40, spritex + (xvelocity/vector_length)*60, spritey + (yvelocity/vector_length)*60);
    }
}

function spawn_enemy(game, spawn)
{
    const baddie = BADDIES[spawn.info]
    baddies.push({   
        sprite: game.add.sprite(spawn.x, spawn.y),
        xvel: spawn.xvel,
        yvel: spawn.yvel,
        width: baddie.width,
        height: baddie.height,
        damage: baddie.damage,
        hp: baddie.hp,
        delete: false
    })

    baddies[baddies.length-1].sprite.anims.play(baddie.name).setDisplaySize(baddie.width, baddie.height);
}

function move_bullets(game)
{
	for(const bullet of bullets)
	{
		if(bullet.life === 0)
		{
			bullet.delete = true;
			bullet.sprite.destroy();
		}
		else
		{
            game.emitter_smoke_trail.explode(10, bullet.sprite.x, bullet.sprite.y);
			bullet.sprite.x += bullet.xvel;
			bullet.sprite.y += bullet.yvel;
			bullet.life--;

			//check for collsion on baddies
			for(const baddie of baddies)
			{
				if(Math.abs(bullet.sprite.x - baddie.sprite.x) < baddie.width/2 && Math.abs(bullet.sprite.y - baddie.sprite.y) < baddie.height/2)
				{
                    game.sound.play("baddie_hit", {volume: 0.5});
                    game.emitter_blood.explode(5, bullet.sprite.x, bullet.sprite.y);
					baddie.hp -= bullet.damage;
                    if(dude.level === 5 && game.ui.final_boss_hp_bg !== undefined)
                    {  
                        game.ui.final_boss_hp_bg.scaleX = baddie.hp/50;
                        bullet.life = 100;
                        bullet.xvel = -bullet.xvel;
                        bullet.yvel = -bullet.yvel;
                        refelect_bullets();
                    }
                    else
                    {
                        bullet.delete = true;
                        bullet.sprite.destroy();
                    }

					if(baddie.hp <= 0)
					{
						baddie.delete = true;
						baddie.sprite.destroy();
					}
                    else
                    {
                        game.tweens.addCounter({
                            duration: 100,
                            onUpdate: function()
                            {
                                baddie.sprite.setTintFill(0xFFFFFF);
                            },
                            onComplete: function()
                            {
                                baddie.sprite.clearTint();
                            }
                        });
                    }
				}
			}
            //check for collsion on player
            if(Math.abs(bullet.sprite.x - dude.sprite.x) < dude.width/2 && Math.abs(bullet.sprite.y - dude.sprite.y) < dude.height/2)
            {
                playerDamage(game, bullet.damage);
            }
            //check collsion on ghosts
            for(const ghost of ghosts)
            {
                if(Math.abs(bullet.sprite.x - ghost.sprite.x) < dude.width/2 && Math.abs(bullet.sprite.y - ghost.sprite.y) < dude.height/2 && nextInvince < game.time.now)
                {
                    playerDamage(game, bullet.damage);
                    game.tweens.addCounter({
                        duration: 100,
                        onUpdate: function()
                        {
                            ghost.sprite.setTintFill(0xFFFFFF);
                        },
                        onComplete: function()
                        {
                            ghost.sprite.clearTint();
                            ghost.sprite.tint = 0xa5adb5;
                        }
                    });
                }
            }
		}
	}
	//remove deleted bullets from array
	for(let i = 0; i < bullets.length; i++)
	{
		if(bullets[i].delete === true)
		{
			bullets.splice(i, 1);
		}
	}
}

function move_baddies(game)
{
    for (const baddie of baddies) 
    {
        baddie.sprite.x += baddie.xvel;
        baddie.sprite.y += baddie.yvel;

        //check if player hit
        if (Math.abs(baddie.sprite.x - dude.sprite.x) < dude.width/2 && Math.abs(baddie.sprite.y - dude.sprite.y) < dude.height/2)
        {
            playerDamage(game, baddie.damage);
        }

        if(dude.level === 5)
        {
            if (Math.abs(baddie.sprite.x - dude.sprite.x) < baddie.width/2 && Math.abs(baddie.sprite.y - dude.sprite.y) < baddie.height/2)
            {
                playerDamage(game, baddie.damage);
            }
        }
        //check if ghost hit
        for(const ghost of ghosts)
        {
            if(Math.abs(baddie.sprite.x - ghost.sprite.x) < dude.width/2 && Math.abs(baddie.sprite.y - ghost.sprite.y) < dude.height/2 && nextInvince < game.time.now)
            {
                playerDamage(game, baddie.damage);
                game.tweens.addCounter({
                    duration: 100,
                    onUpdate: function()
                    {
                        ghost.sprite.setTintFill(0xFFFFFF);
                    },
                    onComplete: function()
                    {
                        ghost.sprite.clearTint();
                        ghost.sprite.tint = 0xa5adb5;
                    }
                });
            }
        }
    }

    //remove deleted baddies from array
    for (var i = 0; i < baddies.length; i++) 
    {
        if (baddies[i].delete === true)
        {
            baddies.splice(i, 1);
            if(baddies.length === 0)
            {
                levelComplete(game);
            }
        }
    }
    game.ui.baddies_left.setText("Enemies Remaining " + baddies.length);
}

function move_ghosts(game)
{  
    for(var i = 0; i < ghosts.length; i++)
    {
        ghosts[i].sprite.x = ghosts[i].actions[0].x;
        ghosts[i].sprite.y = ghosts[i].actions[0].y;
        if(ghosts[i].actions[0].fire)
        {
            fire(game, ghosts[i].actions[0].mousex, ghosts[i].actions[0].mousey, ghosts[i].actions[0].x, ghosts[i].actions[0].y, false);
        }
        if(ghosts[i].actions[0].mousex < ghosts[i].actions[0].x)
        {
            ghosts[i].sprite.flipX = true;
        }
        else
        {
            ghosts[i].sprite.flipX = false;
        }

        if(ghosts[i].actions[0].animation !== ghosts[i].sprite.anims.currentAnim.key)
        {
            ghosts[i].sprite.play(ghosts[i].actions[0].animation);
        }

        ghosts[i].actions.push(ghosts[i].actions.shift());
    }
}

function playerDamage(game, damage)
{
    //if not invincable from being hit 
    if (nextInvince < game.time.now)
    {
        game.sound.play("player_hit", {volume: 1.0});
        dude.hp_current -= damage;
        game.ui.health_display.setText("Health: " + dude.hp_current);
        game.ui.bar.scaleX = dude.hp_current/dude.hp_max;
        if(dude.hp_current <= 0)
        {
            dude.hp_current = 0;
            scene_playing = true;
            second_count.paused  = true;
            const game_over_text = game.add.text(dude.sprite.x, dude.sprite.y, "", {fontFamily: FONT_TITLE, color: "white", fontSize: "80px"}).setOrigin(0.5).setDepth(2);;
            game.emitter_blood.explode(80, dude.sprite.x, dude.sprite.y);
            dude.sprite.anims.play("death");
            game.tweens.addCounter({
                from: 0,
                to: 1,
                duration: 1500,
                onUpdate: function(tween)
                {
                    game.cameras.main.setZoom(1 + tween.getValue()*2);
                }
            });
            setTimeout(function(){
                game_over_text.setText("");
                game.cameras.main.setZoom(1)
                dude.sprite.x = MAP_WIDTH/2;
                dude.sprite.y = MAP_HEIGHT/2;
                scene_playing = false;
                second_count.paused  = false;
                for(const ghost of ghosts)
                {
                    ghost.sprite.destroy();
                }
                ghosts = [];
                stored_actions = [];
                restartTimeLoop(game, true)
            },2000);

        }
        else 
        {
            nextInvince = hitInvince + game.time.now;
            game.tweens.addCounter({
                duration: 100,
                onUpdate: function()
                {
                    dude.sprite.setTintFill(0xFFFFFF);
                },
                onComplete: function()
                {
                    dude.sprite.clearTint();
                }
            });
        }
    }
}

function startLoop(game)
{
    game.blood_particles = game.add.particles("blood");
    game.emitter_blood = game.blood_particles.createEmitter({
        speed: {min: 20, max: 200},
        angle: {min: 200, max: 300},
        alpha: {start: 1, end: 0},
        scale: 3,
        blendMode: "NORMAL",
        on: false,
        lifespan: 1000,
        gravityY: 200
    });
    game.smoke_trail_particles = game.add.particles("time_effect");
    game.emitter_smoke_trail = game.smoke_trail_particles.createEmitter({
        speed: {min: 5, max: 10},
        angle: {min: 0, max: 360},
        alpha: {start: 1, end: 0},
        scale: 1,
        blendMode: "NORMAL",
        on: false,
        lifespan: 1000,
        gravityY: 0
    });
    game.shoot_particles = game.add.particles("time_effect");
    game.emitter_shoot = game.shoot_particles.createEmitter({
        speed: {min: 5, max: 150},
        angle: {min: 0, max: 360},
        alpha: {start: 1, end: 0},
        scale: 2,
        blendMode: "NORMAL",
        on: false,
        lifespan: 500,
        gravityY: 0
    });
    game.time_effect_particles = game.add.particles("time_effect");
    game.emitter_time_effect = game.time_effect_particles.createEmitter({
        speed: {min: 5, max: 500},
        angle: {min: 0, max: 360},
        alpha: {start: 1, end: 0},
        scale: 3,
        blendMode: "NORMAL",
        on: false,
        lifespan: 1500,
        gravityY: 0
    });
}

function refelect_bullets()
{
    for(const bullet of bullets)
    {
        for(const baddie of baddies)
        {
            if(Math.abs(bullet.sprite.x - baddie.sprite.x) < baddie.width/2 && Math.abs(bullet.sprite.y - baddie.sprite.y) < baddie.height/2)
            {
                bullet.sprite.x += 2*(bullet.xvel);
                bullet.sprite.y += 2*(bullet.yvel);
                refelect_bullets();
            }
        }
    }
}

function restartTimeLoop(game, nextlevel)
{
    if(!nextlevel)
    {
        scene_playing = true;
        second_count.paused  = true;
        game.emitter_time_effect.explode(80, dude.sprite.x, dude.sprite.y);
        game.sound.play("time_travel", {volume: 0.2});

        setTimeout(function(){
            ghosts.push({
                sprite: game.add.sprite(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, 'dude').setDisplaySize(dude.width, dude.height).setDepth(1),
                actions: stored_actions.slice()
            });
            ghost_count ++;
            ghosts[ghosts.length-1].sprite.tint = 0xa5adb5;
            ghosts[ghosts.length-1].sprite.play("idle");
            scene_playing = false;
            second_count.paused  = false;
            game.time.addEvent(second_count);
            second_count.paused  = false;
            restartTimeLoop(game, true);
        },1000);
    }
    else
    {
        timer = time_limit;
        game.ui.text_timer.setText(timer + " SECONDS REMAIN");
        dude.hp_current = dude.hp_max;
        game.ui.bar.scaleX = dude.hp_current/dude.hp_max;
        game.ui.health_display.setText("Health: " + dude.hp_current);
        // off set to side
        dude.sprite.x = MAP_WIDTH/2;
        dude.sprite.y = MAP_HEIGHT/2;
        stored_actions = [];
        
        //remove bullets
        game.blood_particles.destroy();
        game.smoke_trail_particles.destroy();
        game.time_effect_particles.destroy();
        for(const bullet of bullets)
        {
            bullet.sprite.destroy();
        }
        if(dude.level === 5 && game.ui.final_boss_hp_bg !== undefined)
        {
            game.ui.final_boss_hp_bg.scaleX = 1;
        } 
        bullets = [];

        //remove baddies
        for (var i = 0; i < baddies.length; i++) 
        {
            baddies[i].sprite.destroy();
        }
        baddies = [];
        //respawn baddies
        for(let i = 0; i < LEVELS[dude.level-1].spawns.length; i++)
        {
            spawn_enemy(game, LEVELS[dude.level-1].spawns[i]);
        }
        game.ui.baddies_left.setText("Enemies Remaining " + baddies.length);
        startLoop(game);
    }
}

function levelComplete(game)
{
    if(dude.level == 5)
    {
        scene_playing = true;
        second_count.paused  = true;
        game.sound.play("level_complete", {volume: 0.5});
        game.emitter_time_effect.explode(300, dude.sprite.x, dude.sprite.y);
        game.emitter_blood.explode(50, 1050, 200);
        game.emitter_blood.explode(50, 1000, 200);
        game.emitter_blood.explode(50, 1100, 200);
        game.emitter_blood.explode(50, 1050, 250);
        game.emitter_blood.explode(50, 1000, 250);
        game.emitter_blood.explode(50, 1100, 250);
        game.emitter_blood.explode(50, 1050, 300);
        game.emitter_blood.explode(50, 1000, 300);
        game.emitter_blood.explode(50, 1100, 300);
        dude.sprite.anims.play("victory");
        const game_win_text = game.add.text(WIDTH_CANVAS/2 , HEIGHT_CANVAS/2, "YOU BEAT THE GAME", {fontFamily: FONT_TITLE, color: "white", fontSize: "60px"}).setOrigin(0.5).setScrollFactor(0).setDepth(4);
        const ghost_count_text = game.add.text(WIDTH_CANVAS/2 , HEIGHT_CANVAS/2 + 60, "YOU TRAVELED BACK IN TIME " + ghost_count + " TIMES", {fontFamily: FONT_TITLE, color: "white", fontSize: "48px"}).setOrigin(0.5).setScrollFactor(0).setDepth(4);
        game.cameras.main.fadeOut(10000, 0, 0, 0);
    }
    else
    {
        scene_playing = true;
        second_count.paused  = true;
        game.sound.play("level_complete", {volume: 0.5});
        const level_done_text = game.add.text(WIDTH_CANVAS/2 , HEIGHT_CANVAS/2, "LEVEL COMPLETE", {fontFamily: FONT_TITLE, color: "white", fontSize: "60px"}).setOrigin(0.5).setScrollFactor(0).setDepth(4);
        game.emitter_time_effect.explode(300, dude.sprite.x, dude.sprite.y);
        setTimeout(function(){
            level_done_text.setText("");
            scene_playing = false;
            second_count.paused  = false;
            dude.sprite.x = MAP_WIDTH/2;
            dude.sprite.y = MAP_HEIGHT/2;
            dude.level ++;
            for(const ghost of ghosts)
            {
                ghost.sprite.destroy();
            }
            ghosts = [];
            stored_actions = [];
            game.ui.text_level.setText("LEVEL: " + dude.level);
            restartTimeLoop(game, true)
        },3000);
    }

}
