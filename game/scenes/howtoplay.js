import {HEIGHT_CANVAS, WIDTH_CANVAS, PADDING_CANVAS, FONT_DEFAULT, FONT_TITLE} from "../globals.js";


const WIDTH_BACK_BUTTON = 200;
const HEIGHT_BACK_BUTTON = 50;

export default new Phaser.Class({
	Extends: Phaser.Scene,
	initialize: function()
	{
		Phaser.Scene.call(this, {"key": "how_to_play"});
	},
	create: function()
	{
        this.cameras.main.setBackgroundColor('#464759')
		// TITLE TEXT
		const title_text = this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*2, "HOW TO PLAY", {fontFamily: FONT_TITLE, color: "white", fontSize: "40px"});
		title_text.setOrigin(0.5, 0);

        this.cursors = this.input.keyboard.addKeys("ENTER,SPACE");

		// Text
		// "THE ELDRITCH HORRORS, WAKING FROM THEIR ETERNAL\n\
		// SLUMBER, HAVE BEGUN THEIR ASSAULT ON YOUR \nWORLD... IT IS UP TO YOU TO FIGHT BACK AND \nTRY TO DELAY THE INEVITABLE...\n\
		// \nGameplay:\n\
		const help_text = this.add.text(WIDTH_CANVAS/2, 200,
			"			Every 10 seconds you go back in time 10 seconds\n\
			Use your past selves to defeat all enemies\n\
			If a past self takes damage so do you!\n\
			Friendly fire is on\n\
			You heal when you go back in time, but so do enemies\n\
			Use WASD or arrow keys to move\n\
			Mouse and click to shoot magic",
			{fontFamily: FONT_DEFAULT, color: "white", fontSize: "24px", align: "left", lineSpacing: 20});
		help_text.setOrigin(0.5, 0);

        const start_game_text = this.add.text(WIDTH_CANVAS/2, HEIGHT_CANVAS/2 + 250, "PLAY GAME", {fontFamily: FONT_DEFAULT, color: "white", fontSize: "48px"}).setOrigin(0.5).setDepth(2);
		const start_game_container = this.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2+250);
		start_game_container.setSize(400, 100);
		start_game_container.setInteractive({useHandCursor: true});

        start_game_container.on("pointerdown", () =>
		{
			this.sound.play("time_travel", {volume: 0.2});
			this.scene.start("gameplay");
		});
	},
    update()
    {
        if(this.cursors.ENTER.isDown || this.cursors.SPACE.isDown)
		{
			this.sound.play("time_travel", {volume: 0.2});
			this.scene.start("gameplay");
		}
    }
});