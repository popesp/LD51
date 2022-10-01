import InputManager from './input.js';


export default class Player
{
	constructor(camera, x_spawn = 0, z_spawn = 0)
	{
		this.camera = camera;
		this.position = {x: x_spawn, y: 0, z: z_spawn};

		this.input = new InputManager();

		this.input.mouse(function(event)
		{
			const {movementX: x, movementY: y} = event;
		
			this.angles.y -= movementX * this.mouseSpeed;
			this.angles.x -= movementY * this.mouseSpeed;
	
			this.angles.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.angles.x));
	
			this.UpdateRotation();
		});
	}

	update(dt)
	{

	}
}