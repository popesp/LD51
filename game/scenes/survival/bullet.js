import * as THREE from 'three';


const BULLET_WIDTH = 0.2;
const BULLET_LENGTH_TIP = 0.6;
const BULLET_LENGTH_BACK = 0.2;
const BULLET_COLOR = 0xa06030;
const NUM_ATTRIBUTES_PER_POSITION = 3;

const BULLET_SPIN = 1;
const BULLET_GRAVITY = 1;
const BULLET_SPEED = 50;
const BULLET_LIFETIME = 2;

const VERTS = new Float32Array([
	0, 0, BULLET_LENGTH_TIP,
	BULLET_WIDTH, BULLET_WIDTH, 0,
	-BULLET_WIDTH, BULLET_WIDTH, 0,

	0, 0, BULLET_LENGTH_TIP,
	BULLET_WIDTH, -BULLET_WIDTH, 0,
	BULLET_WIDTH, BULLET_WIDTH, 0,

	0, 0, BULLET_LENGTH_TIP,
	-BULLET_WIDTH, -BULLET_WIDTH, 0,
	BULLET_WIDTH, -BULLET_WIDTH, 0,

	0, 0, BULLET_LENGTH_TIP,
	-BULLET_WIDTH, BULLET_WIDTH, 0,
	-BULLET_WIDTH, -BULLET_WIDTH, 0,

	0, 0, -BULLET_LENGTH_BACK,
	-BULLET_WIDTH, BULLET_WIDTH, 0,
	BULLET_WIDTH, BULLET_WIDTH, 0,

	0, 0, -BULLET_LENGTH_BACK,
	-BULLET_WIDTH, -BULLET_WIDTH, 0,
	-BULLET_WIDTH, BULLET_WIDTH, 0,

	0, 0, -BULLET_LENGTH_BACK,
	BULLET_WIDTH, -BULLET_WIDTH, 0,
	-BULLET_WIDTH, -BULLET_WIDTH, 0,

	0, 0, -BULLET_LENGTH_BACK,
	BULLET_WIDTH, BULLET_WIDTH, 0,
	BULLET_WIDTH, -BULLET_WIDTH, 0
]);

/**
 * Create an instanced mesh responsible for rendering bullets in a scene.
 * @param {number} max Maximum number of renderable bullets
 * @returns {THREE.InstancedMesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>}
 */
export function bulletMesh(max)
{
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(VERTS, NUM_ATTRIBUTES_PER_POSITION));

	const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial({color: BULLET_COLOR}), max);
	mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
	mesh.castShadow = true;

	return mesh;
}

export class Bullet
{
	/**
	 * Create a bullet.
	 * @param {SurvivalScene} scene The scene containing the bullet
	 * @param {THREE.Vector3} position Starting position for the bullet
	 * @param {THREE.Vector3} direction Starting direction for the bullet
	 */
	constructor(scene, position, direction)
	{
		/** @type {SurvivalScene} */
		this.scene = scene;

		/** @type {THREE.Vector3} */
		this.position = new THREE.Vector3().copy(position);

		/** @type {THREE.Vector3} */
		this.speed = new THREE.Vector3().copy(direction).normalize().multiplyScalar(BULLET_SPEED);

		/** @type {number} */
		this.spin = Math.random()*Math.PI*2;

		/** @type {boolean} */
		this.alive = true;

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
		if(this.age > BULLET_LIFETIME)
			this.alive = false;

		this.spin = (this.spin + dt*BULLET_SPIN)%(2*Math.PI);
		this.speed.y -= dt*BULLET_GRAVITY;

		this.position.addScaledVector(this.speed, dt);

		const {x, y, z} = this.position;
		if(y < 0 && (x*x + z*z < this.scene.platform_radius**2))
			this.alive = false;
	}
}