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
		// TODO
	},
	create: function()
	{
		const title_text = this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*6.66, "2D Shooter", {fontFamily: FONT_TITLE, color: "white", fontSize: "60px"});
		title_text.setOrigin(0.5);

		const start_game_text = this.add.text(0, 0, "Play Game", {fontFamily: FONT_DEFAULT, color: "white", fontSize: "24px"});
		start_game_text.setOrigin(0.5);
		const start_game_container = this.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2+Y_START_BUTTON, [start_game_text]);
		start_game_container.setSize(WIDTH_START_BUTTON, HEIGHT_START_BUTTON);
		start_game_container.setInteractive({useHandCursor: true});

		start_game_container.on("pointerdown", () =>
		{
			this.scene.start("gameplay");
		});
	}
});