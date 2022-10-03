/**
 * @typdef KeyState
 * @type {Object}
 * @property {boolean} down Is the key currently down
 * @property {boolean} pressed Was the key recently pressed
 */


export default class InputManager
{
	/**
	 * Create a new input manager.
	 */
	constructor()
	{
		/** @type {Object} */
		this.keys = {};

		this.mouse = {
			down: false,
			pressed: false,
			x: 0,
			y: 0
		};

		this._mousedown = () =>
		{
			this.mouse.down = true;
			this.mouse.pressed = true;
		};

		this._mouseup = () =>
		{
			this.mouse.down = false;
		};

		this._mousemove = event =>
		{
			this.mouse.x = event.movementX;
			this.mouse.y = event.movementY;
		};

		this._keypress = event =>
		{
			const key = this.key(event.code);
			key.down = true;
			key.pressed = true;
		};

		this._keyup = event =>
		{
			const key = this.key(event.code);
			key.down = false;
		};

		document.addEventListener('mousedown', this._mousedown);
		document.addEventListener('mouseup', this._mouseup);
		document.addEventListener('mousemove', this._mousemove);
		document.addEventListener('keypress', this._keypress);
		document.addEventListener('keyup', this._keyup);
	}

	/**
	 * Update pressed state for all inputs.
	 */
	update()
	{
		for(const key of Object.values(this.keys))
			key.pressed = false;
		this.mouse.pressed = false;
		this.mouse.x = 0;
		this.mouse.y = 0;
	}

	/**
	 * Clean up all input listeners.
	 */
	destroy()
	{
		document.removeEventListener('mousedown', this._mousedown);
		document.removeEventListener('mouseup', this._mouseup);
		document.removeEventListener('mousemove', this._mousemove);
		document.removeEventListener('keypress', this._keypress);
		document.removeEventListener('keyup', this._keyup);
	}

	/**
	 * Return the input state for a given key.
	 * @param {string} code Key code
	 * @returns {KeyState} Key input state
	 */
	key(code)
	{
		const key = this.keys[code] ??= {
			down: false,
			pressed: false
		};

		return key;
	}
}