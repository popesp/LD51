import * as THREE from 'three';
import Entity from './entity.js';


const WIDTH = 0.2;
const LENGTH_TIP = 0.6;
const LENGTH_BACK = 0.2;
const COLOR = 0xa06030;
const NUM_ATTRIBUTES_PER_POSITION = 3;

const SPIN = 1;
const SPEED = 50;
const LIFETIME = 2;

const VERTS = new Float32Array([
	0, 0, LENGTH_TIP,
	WIDTH, WIDTH, 0,
	-WIDTH, WIDTH, 0,

	0, 0, LENGTH_TIP,
	WIDTH, -WIDTH, 0,
	WIDTH, WIDTH, 0,

	0, 0, LENGTH_TIP,
	-WIDTH, -WIDTH, 0,
	WIDTH, -WIDTH, 0,

	0, 0, LENGTH_TIP,
	-WIDTH, WIDTH, 0,
	-WIDTH, -WIDTH, 0,

	0, 0, -LENGTH_BACK,
	-WIDTH, WIDTH, 0,
	WIDTH, WIDTH, 0,

	0, 0, -LENGTH_BACK,
	-WIDTH, -WIDTH, 0,
	-WIDTH, WIDTH, 0,

	0, 0, -LENGTH_BACK,
	WIDTH, -WIDTH, 0,
	-WIDTH, -WIDTH, 0,

	0, 0, -LENGTH_BACK,
	WIDTH, WIDTH, 0,
	WIDTH, -WIDTH, 0
]);

export default class Bullet extends Entity
{
	/**
	 * Create a bullet.
	 * @param {SurvivalScene} scene The scene containing the bullet
	 * @param {THREE.Vector3} position Starting position for the bullet
	 * @param {THREE.Vector3} direction Starting direction for the bullet
	 */
	constructor(scene, position, direction)
	{
		super(scene, 'bullet', position, Bullet.mesh);

		this.speed.copy(direction).normalize().multiplyScalar(SPEED);

		/** @type {number} */
		this.spin = Math.random()*Math.PI*2;

		/** @type {number} */
		this.age = 0;
	}

	/**
	 * Update the bullet for this timestep.
	 * @param {number} dt Seconds elapsed since last update
	 */
	update(dt)
	{
		this.age += dt;
		if(this.age > LIFETIME)
			this.alive = false;

		this.spin = (this.spin + dt*SPIN)%(2*Math.PI);

		Entity.prototype.update.call(this, dt);

		this.rotation.x = Math.atan2(-this.speed.y, Math.sqrt(this.speed.x**2 + this.speed.z**2));
		this.rotation.y = Math.atan2(this.speed.x, this.speed.z);
		this.rotation.z = this.spin;

		const {x, y, z} = this.position;
		if(y < 0 && (x*x + z*z < this.scene.platform_radius**2))
			this.alive = false;

		for(const enemy of this.scene.getEnemies())
			if(this.position.distanceToSquared(enemy.position) < enemy.radius)
			{
				this.alive = false;
				enemy.hit();
			}
	}
}

/**
 * Initialize the bullet entity type. Creates an instanced mesh responsible for rendering bullets in a scene.
 * @param {number} max Maximum number of renderable bullets
 */
Bullet.initialize = function(max)
{
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(VERTS, NUM_ATTRIBUTES_PER_POSITION));

	Bullet.mesh = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial({color: COLOR}), max);
	Bullet.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
	Bullet.mesh.castShadow = true;
};

/**
 * Destroy the bullet entity type.
 */
Bullet.destroy = function()
{
	Bullet.mesh.dispose();
};