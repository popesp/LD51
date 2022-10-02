import {WIDTH_CANVAS, PADDING_CANVAS, HEIGHT_CANVAS, FONT_DEFAULT, FONT_TITLE} from '../globals.js';
import LEVELS from '../data/LEVELS.json' assert { type: "json" };
import BADDIES from '../data/baddies.json' assert { type: "json" };

const WIDTH_START_BUTTON = 200;
const HEIGHT_START_BUTTON = 50;
const Y_START_BUTTON = -70;

// PHYSICS
const RUN_ACCEL = 0.4;
const RUN_DECEL = 1;
const MAX_SPEED = 8;

const dude = {
    xvel: 0,
    yvel: 0,
    width: 80,
    height: 80,
    hp_max: 5,
    hp_current: 5,
    level: 1
}

let bullets = [];
let baddies = [];
let ghosts = [];
let stored_actions = [];
const fireRate = 200;
let nextFire = 0;
let nextSpawn = 1000;
const spawnRate = 1000;
const bulletSpeed = 8;
const hitInvince = 1000;
let timer = 1;
let second_count;
let nextInvince = 0;
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

		this.load.image('bullet', 'assets/sprites/purple_ball.png');
		this.load.image('crabby', 'assets/sprites/baddie.png');
        this.load.image('bug', 'assets/sprites/bug.png');
	},
	create: function()
	{
        this.input.setDefaultCursor('url(assets/sprites/crosshair.png), pointer');
        dude.sprite = this.add.sprite(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, 'dude').setDisplaySize(80, 64).setDepth(1);

        this.cameras.main.startFollow(dude.sprite);
        this.cameras.main.setBounds(0, 0, 2000, 2000);
        this.cameras.main.setZoom(1);
        
        for(let i = 0; i < LEVELS[dude.level-1].spawns.length; i++)
        {
            spawn_enemy(this, LEVELS[dude.level-1].spawns[i]);
        }

        this.cursors = this.input.keyboard.addKeys("UP,LEFT,DOWN,RIGHT,W,A,S,D,R,SPACE");
        this.ui = {
            bar_bg: this.add.graphics().fillStyle(0xcc2418, 1).fillRect(0, -2, 204, 38).setPosition(14, 14),
            bar: this.add.graphics().fillStyle(0xebb134, 1).fillRect(0, 0, 200, 30).setPosition(16, 16),
            stamina_display: this.add.text(52, 18, "Health: " + dude.hp_max, {fontSize: "24px", fill: "#000"}),
            text_level: this.add.text(1000, 18, + timer + "     Level: " + dude.level, {fontSize: "24px", fill: "#ffffff"}),
            baddies_left: this.add.text(500, 18, "Enemies Remaining " + baddies.length, {fontSize: "24px", fill: "#ffffff"})
        };

        for(const key_object in this.ui)
            this.ui[key_object].setScrollFactor(0).setDepth(4);

        second_count = this.time.addEvent({ delay: 1000, callback: addSecond, callbackScope: this, loop: true });
	},
    update: function()
    {
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

        // if (this.time.now > nextSpawn)
        // {
        //     spawn_enemy(this)
        // }
    }
});

function addSecond()
{
    if(timer === 11)
    {
        restartTimeLoop(this, false);  
        this.ui.text_level.setText(timer + "     Level: " + dude.level);    
    }
    else
    {
        timer ++;
        this.ui.text_level.setText(timer + "     Level: " + dude.level);
    }
}

function fire(game, mousex, mousey, spritex, spritey, reload)
{
	if(game.time.now > nextFire || reload === false)
	{
        if(reload === true)
        {
            nextFire = game.time.now + fireRate;
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
    nextSpawn = game.time.now + spawnRate;
    baddies.push({   
        sprite: game.add.sprite(spawn.x, spawn.y, baddie.name),
        xvel: spawn.xvel,
        yvel: spawn.yvel,
        width: baddie.width,
        height: baddie.height,
        damage: baddie.damage,
        hp: baddie.hp,
        delete: false
    })
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
			bullet.sprite.x += bullet.xvel;
			bullet.sprite.y += bullet.yvel;
			bullet.life--;

			//check for collsion on baddies
			for(const baddie of baddies)
			{
				if(Math.abs(bullet.sprite.x - baddie.sprite.x) < baddie.width/2 && Math.abs(bullet.sprite.y - baddie.sprite.y) < baddie.height/2)
				{
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
            game.ui.baddies_left.setText("Enemies Remaining " + baddies.length);
            if(baddies.length === 0)
            {
                levelComplete(game);
            }
        }
    }
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

function restartTimeLoop(game, nextlevel)
{
    timer = 1;
    dude.hp_current = dude.hp_max;
    dude.sprite.x = WIDTH_CANVAS/2;
    dude.sprite.y = HEIGHT_CANVAS/2;

    //spawn ghost
    if(!nextlevel)
    {
        ghosts.push({
            sprite: game.add.sprite(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, 'dude').setDisplaySize(80, 64).setDepth(1),
            actions: stored_actions.slice()
        })
    }
    stored_actions = [];
    
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
}

function playerDamage(game, damage)
{
    //if not invincable from being hit 
    if (nextInvince < game.time.now)
    {
        dude.hp_current -= damage;
        game.ui.stamina_display.setText("Health: " + dude.hp_current);
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

function levelComplete(game)
{
    dude.level ++;
    for(const ghost of ghosts)
    {
        ghost.sprite.destroy();
    }
    for(const bullet of bullets)
    {
        bullet.sprite.destroy();
    }
    bullets = [];
    ghosts = [];
    stored_actions = [];
    restartTimeLoop(game, true)
}


