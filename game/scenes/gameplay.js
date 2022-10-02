import {WIDTH_CANVAS, PADDING_CANVAS, HEIGHT_CANVAS, FONT_DEFAULT, FONT_TITLE} from '../globals.js';
import LEVELS from '../data/LEVELS.json' assert { type: "json" };
import BADDIES from '../data/baddies.json' assert { type: "json" };
import {PseudoRandom} from '../random.js';


const MAP_WIDTH = 1500;
const MAP_HEIGHT = 1000;
// PHYSICS
const RUN_ACCEL = 0.2;
const RUN_DECEL = 1;
const MAX_SPEED = 5;

const dude = {
    xvel: 0,
    yvel: 0,
    width: 80,
    height: 64,
    hp_max: 5,
    hp_current: 5,
    level: 1
}

let bullets = [];
let baddies = [];
let ghosts = [];
let stored_actions = [];
const fireRate = 400;
let nextFire = 0;
const spawnRate = 1000;
const bulletSpeed = 12;
const hitInvince = 1000;
let timer = 1;
let second_count;
let nextInvince = 0;
let animation_playing = false;

const random = new PseudoRandom(69);
export default new Phaser.Class({
	Extends: Phaser.Scene,
	initialize: function()
	{
		Phaser.Scene.call(this, {key: 'gameplay'});
	},
	preload: function()
	{
		this.load.spritesheet('dude',
			'assets/sprites/dude3.png',
			{frameWidth: 20, frameHeight: 16});

		// this.load.image('bullet', 'assets/sprites/purple_ball.png');
        this.load.image('bullet', 'assets/sprites/rifle_bullet.png');
        this.load.image('smoke_trail', 'assets/sprites/smoke_trail.png');
        this.load.image('blood', 'assets/sprites/blood.png');
        this.load.image('time_effect', 'assets/sprites/time_effect.png')

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
        this.load.audio("sniper", "assets/soundfx/sniper.mp3");
	},
	create: function()
	{
        //load sounds
        this.sound.add("sniper");

        //load anims
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
        dude.sprite = this.add.sprite(MAP_WIDTH/2, MAP_HEIGHT/2, 'dude').setDisplaySize(dude.width, dude.height).setDepth(1);

        this.cameras.main.startFollow(dude.sprite);
        this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.cameras.main.setZoom(1);
        
        for(let i = 0; i < LEVELS[dude.level-1].spawns.length; i++)
        {
            spawn_enemy(this, LEVELS[dude.level-1].spawns[i]);
        }

        this.cursors = this.input.keyboard.addKeys("UP,LEFT,DOWN,RIGHT,W,A,S,D,R,SPACE");
        this.ui = {
            bar_bg: this.add.graphics().fillStyle(0xcc2418, 1).fillRect(0, -2, 204, 38).setPosition(14, 14),
            bar: this.add.graphics().fillStyle(0xebb134, 1).fillRect(0, 0, 200, 30).setPosition(16, 16),
            health_display: this.add.text(52, 18, "Health: " + dude.hp_max, {fontSize: "24px", fill: "#000"}),
            text_level: this.add.text(1000, 18, + timer + "     Level: " + dude.level, {fontSize: "24px", fill: "#ffffff"}),
            baddies_left: this.add.text(500, 18, "Enemies Remaining " + baddies.length, {fontSize: "24px", fill: "#ffffff"})
        };

        for(const key_object in this.ui)
            this.ui[key_object].setScrollFactor(0).setDepth(4);

        second_count = this.time.addEvent({ delay: 1000, callback: addSecond, callbackScope: this, loop: true });

        startLoop(this);
	},
    update: function()
    {   
        if(animation_playing === false)
        {
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
                    time: this.time.now
                }
            )
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

            if(dude.sprite.x - dude.width/2 < 0)
            {
                dude.sprite.x = dude.width/2;
            }
            if(dude.sprite.x + dude.width/2 > MAP_WIDTH)
            {
                dude.sprite.x = MAP_WIDTH - dude.width/2;
            }

            if(dude.sprite.y - dude.height/2 - 50 < 0)
            {
                dude.sprite.y = dude.height/2 + 50;
            }
            if(dude.sprite.y + dude.height/2 > MAP_HEIGHT)
            {
                dude.sprite.y = MAP_HEIGHT - dude.height/2;
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
        }

    }
});

function addSecond()
{
    if(animation_playing === false)
    {
        if(timer === 4)
        {
            restartTimeLoop(this, false);     
        }
        else
        {
            this.ui.text_level.setText(timer + "     Level: " + dude.level);
            timer ++;
        }
    }
}

function fire(game, mousex, mousey, spritex, spritey, reload)
{
	if(game.time.now > nextFire || reload === false)
	{
        if(reload === true)
        {
            // game.sound.play("sniper", {volume: 0.05});
            nextFire = game.time.now + fireRate;
        }
        else
        {
            // game.sound.play("sniper", {volume: 0.02});
        }
        
        const xvelocity = (mousex - spritex + 15);
        const yvelocity = (mousey - spritey + 15);
        // const angle = Math.atan2(yvelocity, xvelocity);
        const vector_length = Math.sqrt(xvelocity**2 + yvelocity**2);
        bullets.push({   
            sprite: game.add.sprite(spritex + (xvelocity/vector_length)*50, spritey + (yvelocity/vector_length)*50, 'bullet'),
            xvel: (xvelocity/vector_length) * bulletSpeed,
            yvel: (yvelocity/vector_length) * bulletSpeed,
            damage: 1,
            life: 100,
            delete: false
        })
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
                    game.emitter_blood.explode(5, bullet.sprite.x, bullet.sprite.y);
					baddie.hp -= bullet.damage;
                    bullet.delete = true;
                    bullet.sprite.destroy();
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
        if (Math.abs(dude.sprite.x - baddie.sprite.x) < baddie.width/2 && Math.abs(dude.sprite.y - baddie.sprite.y) < baddie.height/2)
        {
            playerDamage(game, baddie.damage);
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

        ghosts[i].actions.push(ghosts[i].actions.shift());
    }
}

function playerDamage(game, damage)
{
    //if not invincable from being hit 
    if (nextInvince < game.time.now)
    {
        dude.hp_current -= damage;
        game.ui.health_display.setText("Health: " + dude.hp_current);
        game.ui.bar.scaleX = dude.hp_current/dude.hp_max;
        if(dude.hp_current <= 0)
        {
            console.log("GAMEOVER");
        }
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
    game.smoke_trail_particles = game.add.particles("smoke_trail");
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

function restartTimeLoop(game, nextlevel)
{
    if(!nextlevel)
    {
        animation_playing = true;
        second_count.paused  = true;
        game.emitter_time_effect.explode(80, dude.sprite.x, dude.sprite.y);

        setTimeout(function(){
            ghosts.push({
                sprite: game.add.sprite(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, 'dude').setDisplaySize(80, 64).setDepth(1),
                actions: stored_actions.slice()
            })
            animation_playing = false;
            second_count.paused  = false;
            restartTimeLoop(game, true);
        },1000);
    }
    else
    {
        timer = 1;
        game.ui.text_level.setText(timer + "     Level: " + dude.level);
        dude.hp_current = dude.hp_max;
        game.ui.bar.scaleX = dude.hp_current/dude.hp_max;
        game.ui.health_display.setText("Health: " + dude.hp_current);
        dude.sprite.x = MAP_WIDTH/2 - ((ghosts.length+1) * dude.width);
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
    animation_playing = true;
    second_count.paused  = true;
    const level_done_text = game.add.text(WIDTH_CANVAS/2 , HEIGHT_CANVAS/2, "LEVEL COMPLETE", {fontFamily: FONT_TITLE, color: "white", fontSize: "60px"}).setOrigin(0.5);
    game.emitter_time_effect.explode(300, dude.sprite.x, dude.sprite.y);
    setTimeout(function(){
        level_done_text.setText("");
        second_count.paused  = false;
        animation_playing = false;
        
        dude.level ++;
        for(const ghost of ghosts)
        {
            ghost.sprite.destroy();
        }
        ghosts = [];
        stored_actions = [];
        restartTimeLoop(game, true)
    },3000);
}
