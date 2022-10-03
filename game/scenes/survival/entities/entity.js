import * as THREE from 'three';


export default class Entity
{
	/**
	 * Create a new entity.
	 * @param {SurivicalScene} scene The scene containing the entity
	 * @param {string} type Type of the entity; used for game logic
	 * @param {THREE.Vector3} position The spawn position for the entity
	 * @param {THREE.InstancedMesh} [mesh] The mesh used to render the entity
	 */
	constructor(scene, type, position, mesh = null)
	{
		/** @type {SurvivalScene} */
		this.scene = scene;

		/** @type {string} */
		this.type = type;

		/** @type {THREE.InstancedMesh|null} */
		this.mesh = mesh;

		/** @type {boolean} */
		this.alive = true;

		/** @type {THREE.Vector3} */
		this.position = new THREE.Vector3().copy(position);

		/** @type {THREE.Euler} */
		this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');

		/** @type {THREE.Vector3} */
		this.speed = new THREE.Vector3();

		/** @type {THREE.Color} */
		this.color = new THREE.Color();
	}

	update(dt)
	{
		this.position.addScaledVector(this.speed, dt);
	}
}