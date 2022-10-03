import * as THREE from 'three';
import Entity from './entity.js';
import InputManager from '../input.js';
import SurvivalScene from '../survival.js';
import Weapon from '../weapon.js';
import WEAPONS from '../../../data/weapons.json' assert {type: 'json'};
import SOUNDS from '../../../data/sounds.json' assert {type: 'json'};
import {DEBUG} from '../../../debug.js';


const MOUSESPEED = 0.003;
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);

const HEIGHT = 2;
const WIDTH = 1;

// maximum speed in m/s
const SPEED = 40;

// number of seconds to reach top speed
const ACCTIME = 0.2;

// number of seconds to reach 0 speed
const DECTIME = 0.1;

// initial jump speed in m/s
const PLAYER_JUMP = 10;

// downward speed (in m/s) gained each second
const GRAVITY = 12;

const Y_DEATHPLANE = -25;

const pitch = new THREE.Quaternion();
const yaw = new THREE.Quaternion();
const direction = new THREE.Vector3();

export default class Player extends Entity
{
	/**
	 * Create a new player.
	 * @param {SurvivalScene} scene The scene containing the player
	 * @param {number} [x_spawn] Spawn x coordinate
	 * @param {number} [z_spawn] Spawn z coordinate
	 */
	constructor(scene, x_spawn = 0, z_spawn = 0)
	{
		super(scene, 'player', new THREE.Vector3(x_spawn, HEIGHT/2, z_spawn));

		/** @type {THREE.Vector3} */
		this.facing = new THREE.Vector3();

		/** @type {Weapon} */
		this.weapon = new Weapon(scene, WEAPONS.gatling);

		/** @type {THREE.Euler} */
		this.angles = new THREE.Euler();

		/** @type {InputManager} */
		this.input = new InputManager();

		/** @type {boolean} */
		this.mouselock = false;

		/** @type {boolean} */
		this.canjump = false;

		/** @type {number} */
		this.lasty = this.position.y;

		document.addEventListener('pointerlockchange', () =>
		{
			this.mouselock = Boolean(document.pointerLockElement);
		});
	}

	/**
	 * Update the player for this timestep.
	 * @param {number} dt Seconds elapsed since last update
	 */
	update(dt)
	{
		this.weapon.update(dt);

		// mouse events
		if(this.mouselock)
		{
			if(this.input.mouse.pressed)
				this.weapon.fire(this.facing);
			else if(this.input.mouse.down)
				this.weapon.hold(this.facing);

			const {x: mousex, y: mousey} = this.input.mouse;
	
			this.angles.y -= mousex*MOUSESPEED;
			this.angles.x -= mousey*MOUSESPEED;
	
			this.angles.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.angles.x));
	
			pitch.setFromAxisAngle(AXIS_X, this.angles.x);
			yaw.setFromAxisAngle(AXIS_Y, this.angles.y);

			this.scene.camera.quaternion.multiplyQuaternions(yaw, pitch).normalize();
		}
		else if(this.input.mouse.pressed)
			document.body.requestPointerLock();

		const forward = (this.input.key('KeyS').down ? 1 : 0) - (this.input.key('KeyW').down ? 1 : 0);
		const right = (this.input.key('KeyD').down ? 1 : 0) - (this.input.key('KeyA').down ? 1 : 0);
		direction.set(right, 0, forward).normalize();
		direction.applyQuaternion(yaw);

		if(this.input.key('Space').pressed && this.canjump)
		{
			this.speed.y += PLAYER_JUMP;
			Player.sounds.jump.play();
		}

		if(DEBUG)
		{
			if(this.input.key('KeyR').pressed)
				this.scene.game.switchScene(new SurvivalScene(this.scene.game));

			if(this.input.key('Digit1').pressed)
				this.weapon = new Weapon(this.scene, WEAPONS.pistol);
			if(this.input.key('Digit2').pressed)
				this.weapon = new Weapon(this.scene, WEAPONS.shotgun);
			if(this.input.key('Digit3').pressed)
				this.weapon = new Weapon(this.scene, WEAPONS.gatling);
		}

		const yspeed = this.speed.y;
		this.speed.y = 0;

		this.speed.addScaledVector(direction, dt*SPEED/ACCTIME);
		this.speed.addScaledVector(this.speed, -dt/DECTIME);
		this.speed.clampLength(0, SPEED);
		this.speed.y = yspeed - dt*GRAVITY;

		this.lasty = this.position.y;
		Entity.prototype.update.call(this, dt);

		const {x, y, z} = this.position;
		if(y < HEIGHT/2 && (x*x + z*z < (this.scene.platform_radius + WIDTH/2)**2))
		{
			if(this.lasty >= HEIGHT/2)
			{
				this.position.y = HEIGHT/2;
				this.speed.y = 0;
				this.canjump = true;

				if(this.lasty > HEIGHT/2)
					Player.sounds.land.play();
			}
			else
			{
				const r = this.scene.platform_radius + WIDTH/2;
				const dist = Math.sqrt(this.position.x**2 + this.position.z**2);

				this.position.x = this.position.x*r/dist;
				this.position.z = this.position.z*r/dist;
			}
		}
		else
			this.canjump = false;

		if(y < Y_DEATHPLANE)
			this.alive = false;

		for(const enemy of this.scene.getEnemies())
			if(this.position.distanceToSquared(enemy.position) < enemy.radius)
				this.alive = false;

		this.scene.camera.position.x = this.position.x;
		this.scene.camera.position.y = this.position.y + HEIGHT/2;
		this.scene.camera.position.z = this.position.z;

		this.scene.camera.getWorldDirection(this.facing);

		this.input.update();
	}

	/**
	 * Destroy the player.
	 */
	destroy()
	{
		this.input.destroy();
	}
}

/**
 * Initialize the player entity type.
 * @param {THREE.AudioListener} listener Audio listener
 */
Player.initialize = function(listener)
{
	Player.sounds = Object.fromEntries(Object.entries(SOUNDS).map(([key, {volume}]) =>
	{
		const sound = new THREE.Audio(listener);
		sound.setVolume(volume);
		return [key, sound];
	}));

	const loader = new THREE.AudioLoader();
	return Promise.all(Object.entries(Player.sounds).map(([key, sound]) => loader.loadAsync(`/assets/sfx/${key}.wav`).then(buffer =>
	{
		sound.setBuffer(buffer);
	})));
};