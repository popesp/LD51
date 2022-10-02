import Game from './game.js';
import SurvivalScene from './scenes/survival/survival.js';


document.addEventListener('DOMContentLoaded', () =>
{
	const game = new Game();
	game.switchScene(new SurvivalScene(game));
});