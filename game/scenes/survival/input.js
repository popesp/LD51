/**
 * @typedef Event
 * @type {Object}
 * @property {HTMLElement} element
 * @property {string} key
 * @property {() => void} callback
 */

export default class InputManager
{
	/**
	 * Create a new input manager.
	 */
	constructor()
	{
		/** @type {Event[]} */
		this.events = [];

		/** @type {Object} */
		this.keys = {};

		this.clear();
	}

	/**
	 * Clear all events and reset key down listeners.
	 */
	clear()
	{
		for(const event of this.events)
			event.element.removeEventListener(event.key, event.callback);

		this.events = [];
		this._add(document, 'keydown', event =>
		{
			this.keys[event.code] = true;
		});
		this._add(document, 'keyup', event =>
		{
			this.keys[event.code] = false;
		});
	}

	/**
	 * Add an event listener.
	 * @param {HTMLElement} element Element to listen to
	 * @param {string} key Event type
	 * @param {EventListenerOrEventListenerObject} callback Listener callback
	 */
	_add(element, key, callback)
	{
		element.addEventListener(key, callback);
		this.events.push({element, key, callback});
	}

	/**
	 * Add a mouse move listener.
	 * @param {(event:MouseEvent) => void} callback Callback fired whenever the mouse is moved
	 */
	mouse(callback)
	{
		this._add(document, 'mousemove', callback);
	}

	/**
	 * Add a mouse click listener.
	 * @param {(event:MouseEvent) => void} callback Callback fired whenever the mouse is clicked
	 */
	click(callback)
	{
		this._add(document, 'click', callback);
	}

	/**
	 * Get the pressed status of a given key.
	 * @param {string} code Key code to query
	 * @returns {boolean} True if the key is pressed, false otherwise
	 */
	getKey(code)
	{
		return Boolean(this.keys[code]);
	}
}