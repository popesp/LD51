import InputManager from './input.js';


const MOUSESPEED = 0.002;
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);

const PLAYER_HEIGHT = 2;
const PLAYER_SPEED = 3;
const PLAYER_ACCTIME = 0.08;
const PLAYER_JUMP = 3;
const DECEL = -70;
const GRAVITY = 0.01;

const pitch = new THREE.Quaternion();
const yaw = new THREE.Quaternion();
const direction = new THREE.Vector3();
const temp = new THREE.Vector3();


export default class Player
{
	constructor(camera, platform_radius, x_spawn = 0, z_spawn = 0)
	{
		this.camera = camera;
		this.position = new THREE.Vector3(x_spawn, 0, z_spawn);
		camera.position.x = x_spawn;
		camera.position.y = PLAYER_HEIGHT;
		camera.position.z = z_spawn;

		this.speed = new THREE.Vector3();
		this.angles = new THREE.Euler();
		this.platform_radius = platform_radius;

		this.input = new InputManager();

		this.mouselock = false;
		this.input.click(() =>
		{
			if(!this.mouselock)
				document.body.requestPointerLock();
		});

		document.addEventListener('pointerlockchange', () =>
		{
			this.mouselock = Boolean(document.pointerLockElement);
		});

		this.input.mouse(event =>
		{
			if(!this.mouselock)
				return;

			const {movementX: x, movementY: y} = event;
		
			this.angles.y -= x*MOUSESPEED;
			this.angles.x -= y*MOUSESPEED;
	
			this.angles.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.angles.x));
	
			pitch.setFromAxisAngle(AXIS_X, this.angles.x);
			yaw.setFromAxisAngle(AXIS_Y, this.angles.y);

			this.camera.quaternion.multiplyQuaternions(yaw, pitch).normalize();
		});
	}

	update(dt)
	{
		const forward = (this.input.getKey('KeyS') ? 1 : 0) - (this.input.getKey('KeyW') ? 1 : 0);
		const right = (this.input.getKey('KeyD') ? 1 : 0) - (this.input.getKey('KeyA') ? 1 : 0);
		direction.set(right, 0.0, forward).normalize();

		this.speed.x += dt*(this.speed.x*DECEL + direction.x*PLAYER_SPEED/PLAYER_ACCTIME);
		this.speed.z += dt*(this.speed.z*DECEL + direction.z*PLAYER_SPEED/PLAYER_ACCTIME);
		this.speed.clampLength(0, PLAYER_SPEED);

		this.speed.y -= dt*GRAVITY;

		temp.copy(this.speed).applyQuaternion(yaw);

		this.position.add(temp);

		const {x, y, z} = this.position;

		if(y < 0 && (x*x + z*z < this.platform_radius**2))
		{
			this.position.y = 0;
			this.speed.y = 0;
		}

		this.camera.position.x = this.position.x;
		this.camera.position.y = this.position.y + PLAYER_HEIGHT;
		this.camera.position.z = this.position.z;
	}
}