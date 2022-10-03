import SurvivalScene from './survival/survival.js';


export default class GameoverScene
{
	constructor(game)
	{
		this._click = () =>
		{
			game.switchScene(new SurvivalScene(game));
		};

		document.addEventListener('click', this._click);
	}

	start()
	{
		document.exitPointerLock();
	}

	destroy()
	{
		document.removeEventListener('click', this._click);
	}
}