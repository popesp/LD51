import {WIDTH_CANVAS, PADDING_CANVAS, HEIGHT_CANVAS, FONT_DEFAULT, FONT_TITLE} from "../globals.js";

const WIDTH_START_BUTTON = 200;
const HEIGHT_START_BUTTON = 50;
const Y_START_BUTTON = -70;


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
	},
	create: function()
	{
		this.music = this.sound.add("theme");
        this.music.loop = true;
        this.music.play({volume: 0.15});

		const title_text = this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*6.66, "I'LL BE BACK", {fontFamily: FONT_TITLE, color: "white", fontSize: "60px"});
		title_text.setOrigin(0.5);

		const start_game_text = this.add.text(0, 0, "Play Game", {fontFamily: FONT_DEFAULT, color: "white", fontSize: "24px"});
		start_game_text.setOrigin(0.5);
		const start_game_container = this.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2+Y_START_BUTTON, [start_game_text]);
		start_game_container.setSize(WIDTH_START_BUTTON, HEIGHT_START_BUTTON);
		start_game_container.setInteractive({useHandCursor: true});

		this.cursors = this.input.keyboard.addKeys("ENTER,SPACE");
		

		start_game_container.on("pointerdown", () =>
		{
			this.sound.play("time_travel", {volume: 0.2});
			this.scene.start("gameplay");
		});
	},
	update: function()
	{
		if(this.cursors.ENTER.isDown || this.cursors.SPACE.isDown)
		{
			this.sound.play("time_travel", {volume: 0.2});
			this.scene.start("gameplay");
		}
	}
});