export default class InputManager
{
	constructor()
	{
		this.events = [];
	}

	clear()
	{
		for(const event of this.events)
			event.element.removeEventListener(event.key, event.callback);

		this.events = [];
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
}