import Game from './game.js';
import SurvivalScene from './scenes/survival.js';


document.addEventListener('DOMContentLoaded', function()
{
	const game = new Game();
	game.switchScene(new SurvivalScene(game));
});