export default class InputManager
{
	constructor()
	{
		this.events = [];
		this.keys = {};

		this.clear();
	}

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

	_add(element, key, callback)
	{
		element.addEventListener(key, callback);
		this.events.push({element, key, callback});
	}

	mouse(callback)
	{
		this._add(document, 'mousemove', callback);
	}

	click(callback)
	{
		this._add(document, 'click', callback);
	}

	getKey(code)
	{
		return Boolean(this.keys[code]);
	}
}