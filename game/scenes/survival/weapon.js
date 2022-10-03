import * as THREE from 'three';
import {dist_normal_coords} from '../../util.js';


const Y_FIREOFFSET = -0.8;
const DEFAULT_SPREAD = 0;
const DEFAULT_NUM_BULLETS = 1;


const offset = new THREE.Vector3();
const dir = new THREE.Vector3();
const yaxis = new THREE.Vector3(0, 1, 0);

export default class Weapon
{
	/**
	 * Create a new weapon.
	 * @param {SurvivalScene} scene The scene containing the weapon
	 * @param {Object} properties Weapon properties
	 * @param {number} properties.cooldown Weapon fire cooldown
	 * @param {boolean} [properties.can_hold] Whether the trigger can be held
	 * @param {number} [properties.spread] Weapon spread in radians
	 * @param {number} [properties.num_bullets] Bullets fired per shot
	 */
	constructor(scene, properties)
	{
		/** @type {SurvivalScene} */
		this.scene = scene;

		/** @type {number} */
		this.cooldown = properties.cooldown;

		/** @type {boolean} */
		this.can_hold = Boolean(properties.can_hold);

		/** @type {number} */
		this.spread = properties.spread ?? DEFAULT_SPREAD;

		/** @type {number} */
		this.num_bullets = properties.num_bullets ?? DEFAULT_NUM_BULLETS;

		/** @type {number} */
		this.firing = 0;
	}

	/**
	 * Attempt to hold the trigger in the given direction.
	 * @param {THREE.Vector3} direction Hold direction
	 */
	hold(direction)
	{
		if(this.can_hold)
			this.fire(direction);
	}

	/**
	 * Attempt to fire the weapon in the given direction.
	 * @param {THREE.Vector3} direction Fire direction
	 */
	fire(direction)
	{
		if(!this.firing)
		{
			this.firing = this.cooldown;

			offset.copy(this.scene.camera.position);
			offset.y += Y_FIREOFFSET;
			this.bullets(offset, direction);
		}
	}

	/**
	 * Spawn bullet(s) in the given direction.
	 * @param {THREE.Vector3} position Position to spawn bullets
	 * @param {THREE.Vector3} direction Direction to spawn bullets in
	 */
	bullets(position, direction)
	{
		const right = new THREE.Vector3().copy(direction).cross(yaxis).normalize();
		const down = new THREE.Vector3().copy(direction).cross(right).normalize();

		for(let i = 0; i < this.num_bullets; ++i)
		{
			const {x, y} = dist_normal_coords(0, this.spread);
			dir.copy(direction).addScaledVector(right, x);
			dir.addScaledVector(down, y);

			this.scene.spawnBullet(position, dir);
		}
	}

	/**
	 * Update the weapon for this timestep.
	 * @param {number} dt Seconds elapsed since last update
	 */
	update(dt)
	{
		this.firing = Math.max(this.firing - dt, 0);
	}
}