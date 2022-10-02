import * as THREE from 'three';


const COLOR = 0xFFFFFF;


/**
 * Create an instanced mesh responsible for rendering enemies in a scene.
 * @param {THREE.BufferGeometry} geometry Geometry for the enemy
 * @param {number} max Maximum number of renderable enemies
 * @returns {THREE.InstancedMesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>}
 */
export function enemyMesh(geometry, max)
{
	const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshStandardMaterial({color: COLOR}), max);
	mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
	mesh.castShadow = true;

	return mesh;
}

export class Enemy
{
	constructor(scene, position)
	{
		/** @type {SurvivalScene} */
		this.scene = scene;

		/** @type {THREE.Vector3} */
		this.position = new THREE.Vector3().copy(position);

		/** @type {THREE.Vector3} */
		this.speed = new THREE.Vector3();

		/** @type {boolean} */
		this.alive = true;
	}

	/**
	 * Update the enemy for this timestep.
	 * @param {number} dt Seconds elapsed since last update
	 */
	update(dt)
	{
		this.position.addScaledVector(this.speed, dt);
	}
}