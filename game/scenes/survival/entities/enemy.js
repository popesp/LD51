import {OBJLoader} from 'objloader';
import * as THREE from 'three';
import Entity from './entity.js';
import ENEMIES from '../../../data/enemies.json' assert {type: 'json'};


const HIT_DURATION = 0.2;
const DEFAULT_RADIUS = 1;
const DEFAULT_LIFE = 1;
const DEFAULT_COLOR = 0xFFFFFF;
const HEX_DAMAGE = 0xF06040;


export default class Enemy extends Entity
{
	/**
	 * Create an enemy.
	 * @param {SurvivalScene} scene The scene containing the enemy
	 * @param {Object} [properties] Enemy properties
	 * @param {THREE.InstancedMesh} [properties.mesh] Instanced mesh used to render
	 * @param {number} [properties.radius] Hit radius
	 * @param {number} [properties.color] Enemy color
	 * @param {number} [properties.life] Maximum life total
	 * @param {THREE.Vector3} position Position of the enemy
	 */
	constructor(scene, position, properties = {})
	{
		super(scene, 'enemy', position, properties.mesh);

		this.properties = properties;

		/** @type {number} */
		this.radius = properties.radius ?? DEFAULT_RADIUS;

		/** @type {number} */
		this.hit_duration = 0;

		/** @type {THREE.Color} */
		this.basecolor = new THREE.Color(properties.color ?? DEFAULT_COLOR);
		this.color.copy(this.basecolor);

		/** @type {THREE.Color} */
		this.color_current = new THREE.Color().copy(this.color);

		/** @type {number} */
		this.life = properties.life ?? DEFAULT_LIFE;
	}

	hit()
	{
		if(!this.hit_duration)
		{
			this.life--;
			this.hit_duration = HIT_DURATION;
		}
	}

	/**
	 * Update the enemy for this timestep.
	 * @param {number} dt Seconds elapsed since last update
	 */
	update(dt)
	{
		this.hit_duration = Math.max(this.hit_duration - dt, 0);
		if(this.hit_duration)
			this.color.set(HEX_DAMAGE);
		else
		{
			if(this.life <= 0)
				this.alive = false;
			this.color.copy(this.basecolor);
		}

		Entity.prototype.update.call(this, dt);
	}
}

/**
 * Initialize the enemy entity type. Creates instanced meshes responsible for rendering enemies in a scene.
 * @param {number} max Maximum number of renderable enemies
 */
Enemy.initialize = function(max)
{
	Enemy.types = Object.fromEntries(Object.entries(ENEMIES).map(([key, properties]) => [key, {...properties, mesh: null}]));

	const loader = new OBJLoader();
	return Promise.all(Object.entries(Enemy.types).map(([key, type]) => loader.loadAsync(`/assets/meshes/${key}.obj`).then(obj =>
	{
		type.mesh = new THREE.InstancedMesh(obj.children[0].geometry, new THREE.MeshStandardMaterial(), max);
		type.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
		type.mesh.castShadow = true;
	})));
};

/**
 * Destroy the enemy entity type.
 */
Enemy.destroy = function()
{
	for(const {mesh} of Object.values(Enemy.types))
		mesh.dispose();
};