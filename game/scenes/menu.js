import {WIDTH_CANVAS, PADDING_CANVAS, HEIGHT_CANVAS, FONT_DEFAULT, FONT_TITLE} from "../globals.js";

const WIDTH_START_BUTTON = 500;
const HEIGHT_START_BUTTON = 200;
const Y_START_BUTTON = 250;

const dude = {
}
const shot1 = {
	x: -1,
	y: 0,
	xvel: 0,
	yvel: 0
}

const shot2 = {
	x: -1,
	y: 0,
	xvel: 0,
	yvel: 0
}

const shot3 = {
	x: -1,
	y: 0,
	xvel: 0,
	yvel: 0
}

const shot4 = {
	x: -1,
	y: 0,
	xvel: 0,
	yvel: 0
}

const shots = [shot1, shot2, shot3, shot4];

export default new Phaser.Class({
	Extends: Phaser.Scene,
	initialize: function()
	{
		Phaser.Scene.call(this, {key: 'menu'});
	},
	preload: function()
	{
		this.load.audio("time_travel", "assets/soundfx/time_travel.mp3");
		this.load.audio("theme", "assets/soundfx/theme.mp3");
		this.load.image('time_effect', 'assets/sprites/time_effect.png');

		this.load.spritesheet("run",
		"assets/sprites/run.png",
		{frameWidth: 16, frameHeight: 20}
	);
	},
	create: function()
	{
		this.music = this.sound.add("theme");
        this.music.loop = true;
        this.music.play({volume: 0.15});

		this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("run", {start: 0, end: 4}),
            frameRate: 10,
            repeat: -1
        });

		this.cameras.main.setBackgroundColor('#464759')
		const title_text = this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*6.66, "DON'T SHOOT YOURSELF", {fontFamily: FONT_TITLE, color: "white", fontSize: "60px"});
		title_text.setOrigin(0.5).setDepth(2);

		dude.sprite = this.add.sprite(WIDTH_CANVAS/2 - 16, HEIGHT_CANVAS/2, "run").setDisplaySize(256, 320).setDepth(2);
		dude.sprite.play("run", true);

		const credit_text = this.add.text(0, 680, "GAME, ART, AND MUSIC BY: DAN", {fontFamily: FONT_TITLE, fontSize: "15px", fixedWidth: WIDTH_CANVAS, fixedHeight: 32, align: "center"}).setOrigin(0, 0).setDepth(2);

		const start_game_text = this.add.text(WIDTH_CANVAS/2, HEIGHT_CANVAS/2 + Y_START_BUTTON, "PLAY GAME", {fontFamily: FONT_DEFAULT, color: "white", fontSize: "48px"}).setOrigin(0.5).setDepth(2);
		const start_game_container = this.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2+Y_START_BUTTON);
		start_game_container.setSize(WIDTH_START_BUTTON, HEIGHT_START_BUTTON);
		start_game_container.setInteractive({useHandCursor: true});

		this.smoke_trail_particles = this.add.particles("time_effect");
		this.emitter_smoke_trail = this.smoke_trail_particles.createEmitter({
			speed: {min: 5, max: 10},
			angle: {min: 0, max: 360},
			alpha: {start: 1, end: 0},
			scale: 1,
			blendMode: "NORMAL",
			on: false,
			lifespan: 1000,
			gravityY: 0
		});

		this.cursors = this.input.keyboard.addKeys("ENTER,SPACE");


		start_game_container.on("pointerdown", () =>
		{
			this.sound.play("time_travel", {volume: 0.2});
			this.scene.start("how_to_play");
		});
	},
	update: function()
	{
		if(this.cursors.ENTER.isDown || this.cursors.SPACE.isDown)
		{
			this.sound.play("time_travel", {volume: 0.2});
			this.scene.start("how_to_play");
		}


		for(let i = 0; i < shots.length; i++)
		{
			if(shots[i].x < 0 || shots[i].x > WIDTH_CANVAS || shots[i].y < 0 || shots[i].y > HEIGHT_CANVAS)
			{
				shots[i].x = Math.ceil(Math.random() * WIDTH_CANVAS);
				shots[i].y = Math.ceil(Math.random() * HEIGHT_CANVAS);
				shots[i].xvel = (Math.random() * 16)-8;
				shots[i].yvel = (Math.random() * 16)-8;
			}
	
			this.emitter_smoke_trail.explode(40, shots[i].x , shots[i].y);
			shots[i].x = shots[i].x + shots[i].xvel;
			shots[i].y = shots[i].y + shots[i].yvel;

		}

		
	}
});