import * as THREE from 'three';
import InputManager from './input.js';


const MOUSESPEED = 0.002;
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);

const HEIGHT = 2;
const SPEED = 3;
const ACCTIME = 0.08;
// const PLAYER_JUMP = 3;
const DECEL = -70;
const GRAVITY = 0.01;
const Y_FIREOFFSET = -0.5;

const pitch = new THREE.Quaternion();
const yaw = new THREE.Quaternion();
const direction = new THREE.Vector3();
const temp = new THREE.Vector3();

export default class Player
{
	/**
	 * Create a new player.
	 * @param {SurvivalScene} scene The scene containing the player
	 * @param {number} [x_spawn = 0] Spawn x coordinate
	 * @param {number} [z_spawn = 0] Spawn z coordinate
	 */
	constructor(scene, x_spawn = 0, z_spawn = 0)
	{
		/** @type {SurvivalScene} */
		this.scene = scene;

		/** @type {THREE.Vector3} */
		this.position = new THREE.Vector3(x_spawn, 0, z_spawn);

		/** @type {THREE.Vector3} */
		this.speed = new THREE.Vector3();

		/** @type {THREE.Euler} */
		this.angles = new THREE.Euler();

		/** @type {InputManager} */
		this.input = new InputManager();

		// scene.camera.position.x = x_spawn;
		// scene.camera.position.y = HEIGHT;
		// scene.camera.position.z = z_spawn;

		/** @type {boolean} */
		this.mouselock = false;

		this.input.click(() =>
		{
			if(this.mouselock)
			{
				scene.camera.getWorldDirection(direction);
				temp.copy(scene.camera.position);
				temp.y += Y_FIREOFFSET;

				scene.spawnBullet(temp, direction);
			}
			else
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

			scene.camera.quaternion.multiplyQuaternions(yaw, pitch).normalize();
		});
	}

	/**
	 * Update the player for this timestep.
	 * @param {number} dt Seconds elapsed since last update
	 */
	update(dt)
	{
		const forward = (this.input.getKey('KeyS') ? 1 : 0) - (this.input.getKey('KeyW') ? 1 : 0);
		const right = (this.input.getKey('KeyD') ? 1 : 0) - (this.input.getKey('KeyA') ? 1 : 0);
		direction.set(right, 0.0, forward).normalize();

		this.speed.x += dt*(this.speed.x*DECEL + direction.x*SPEED/ACCTIME);
		this.speed.z += dt*(this.speed.z*DECEL + direction.z*SPEED/ACCTIME);
		this.speed.clampLength(0, SPEED);

		this.speed.y -= dt*GRAVITY;

		temp.copy(this.speed).applyQuaternion(yaw);

		this.position.add(temp);

		const {x, y, z} = this.position;

		if(y < 0 && (x*x + z*z < this.scene.platform_radius**2))
		{
			this.position.y = 0;
			this.speed.y = 0;
		}

		this.scene.camera.position.x = this.position.x;
		this.scene.camera.position.y = this.position.y + HEIGHT;
		this.scene.camera.position.z = this.position.z;
	}

	/**
	 * Destroy the player.
	 */
	destroy()
	{
		this.input.clear();
	}
}