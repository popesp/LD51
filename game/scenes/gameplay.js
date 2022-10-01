import {WIDTH_CANVAS, PADDING_CANVAS, HEIGHT_CANVAS, FONT_DEFAULT, FONT_TITLE} from "../globals.js";

const WIDTH_START_BUTTON = 200;
const HEIGHT_START_BUTTON = 50;
const Y_START_BUTTON = -70;

// PHYSICS
const RUN_ACCEL = 0.4;
const RUN_DECEL = 1;
const MAX_SPEED = 8;

const dude = {
    hp: 5
}
const bullets = [];
const baddies = [];
const fireRate = 200;
let nextFire = 0;
let nextSpawn = 1000;
const spawnRate = 1000;
const bulletSpeed = 8;
const hitInvince = 1000;
let nextInvince = 0;
let player_x_vel = 0;
let player_y_vel = 0;
export default new Phaser.Class({
	Extends: Phaser.Scene,
	initialize: function()
	{
		Phaser.Scene.call(this, {key: 'gameplay'});
	},
	preload: function()
	{
        this.load.spritesheet("dude",
            "assets/sprites/dude3.png",
            {frameWidth: 20, frameHeight: 16}
        );

        this.load.image('bullet', 'assets/sprites/purple_ball.png');
        this.load.image('baddie', 'assets/sprites/baddie.png');
	},
	create: function()
	{
        dude.sprite = this.add.sprite(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, 'dude').setDisplaySize(80, 64).setDepth(1);

        this.cursors = this.input.keyboard.addKeys("UP,LEFT,DOWN,RIGHT,W,A,S,D,R,SPACE");

        this.bullets = [];

	},
    update: function()
    {
        const left = this.cursors.A.isDown || this.cursors.LEFT.isDown;
        const right = this.cursors.D.isDown || this.cursors.RIGHT.isDown;
        const up = this.cursors.W.isDown || this.cursors.UP.isDown;
        const down = this.cursors.S.isDown || this.cursors.DOWN.isDown;
        const action = this.cursors.SPACE.isDown;
        if(left === right)
        {
            if(player_x_vel > 0)
                player_x_vel = Math.max(0, player_x_vel - RUN_DECEL);
            else
                player_x_vel = Math.min(0, player_x_vel + RUN_DECEL);
        
            dude.sprite.x += player_x_vel;
        }

        if(up === down)
        {
            if(player_y_vel > 0)
                player_y_vel = Math.max(0, player_y_vel - RUN_DECEL);
            else
                player_y_vel = Math.min(0, player_y_vel + RUN_DECEL);

            dude.sprite.y += player_y_vel;
        }

        if (left)
        {
            player_x_vel = Math.max(-MAX_SPEED, player_x_vel - RUN_ACCEL);
            dude.sprite.x += player_x_vel;
            dude.sprite.flipX = true;
        }
        else if (right)
        {
            player_x_vel = Math.min(MAX_SPEED, player_x_vel + RUN_ACCEL);
            dude.sprite.x += player_x_vel;
            dude.sprite.flipX = false;
        }
    
        if (up)
        {
            player_y_vel = Math.max(-MAX_SPEED, player_y_vel - RUN_ACCEL);
            dude.sprite.y += player_y_vel;
        }
        else if (down)
        {
            player_y_vel = Math.min(MAX_SPEED, player_y_vel + RUN_ACCEL);
            dude.sprite.y += player_y_vel;
        }

        if (this.input.activePointer.isDown)
        {
            fire(this, this.input.mousePointer.x, this.input.mousePointer.y);
        }

        //bullets
        move_bullets();

        //baddies
        move_baddies(this);

        if (this.time.now > nextSpawn)
        {
            spawn_enemy(this)
        }
    }
});

function fire(game, mousex, mousey)
{    
    if (game.time.now > nextFire)
    {
        nextFire = game.time.now + fireRate;
        
        const xvelocity = (mousex - dude.sprite.x);
        const yvelocity = (mousey - dude.sprite.y);
        const vector_length = Math.sqrt(xvelocity**2 + yvelocity**2);
        bullets.push({   
            sprite: game.add.sprite(dude.sprite.x, dude.sprite.y, 'bullet'),
            xvel: (xvelocity/vector_length) * bulletSpeed,
            yvel: (yvelocity/vector_length) * bulletSpeed,
            damage: 1,
            life: 100,
            delete: false
        })
    }
}

function spawn_enemy(game)
{
    nextSpawn = game.time.now + spawnRate;

    baddies.push({   
        sprite: game.add.sprite(dude.sprite.x + Math.random() * 100, dude.sprite.y + Math.random() * 100, 'baddie'),
        xvel: Math.random(),
        yvel: Math.random(),
        width: 80,
        height: 80,
        damage: 1,
        hp: 1,
        delete: false
    })
}

function move_bullets()
{
    for (const bullet of bullets) 
    {
        if (bullet.life === 0)
        {
            bullet.delete = true;
            bullet.sprite.destroy();
        }
        else
        {
            bullet.sprite.x += bullet.xvel;
            bullet.sprite.y += bullet.yvel;
            bullet.life --;

            //check for collsion
            for (const baddie of baddies) 
            {
                if (Math.abs(bullet.sprite.x - baddie.sprite.x) < baddie.width/2 && Math.abs(bullet.sprite.y - baddie.sprite.y) < baddie.height/2)
                {
                    baddie.hp -= bullet.damage;
                    if (baddie.hp <= 0)
                    {
                        baddie.delete = true;
                        baddie.sprite.destroy();
                    }
                }
            }
        }
    }
    //remove deleted bullets from array
    for (var i = 0; i < bullets.length; i++) {
        if (bullets[i].delete === true)
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
            //if not invincable from being hit 
            if (nextInvince < game.time.now)
            {
                dude.hp -= baddie.damage;
                if(dude.hp <= 0)
                {
                    console.log("GAMEOVER");
                }
                nextInvince += hitInvince;
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

    //remove deleted baddies from array
    for (var i = 0; i < baddies.length; i++) {
        if (baddies[i].delete === true)
        {
            baddies.splice(i, 1);
        }
    }
}