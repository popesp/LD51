import * as THREE from 'three';
import {bulletMesh, Bullet} from './bullet.js';
import Player from './player.js';
import {WIDTH_CANVAS, HEIGHT_CANVAS} from '../../globals.js';


const FOV = 80;
const DEPTH_NEAR = 0.1;
const DEPTH_FAR = 1000;

const X_SPAWN = 0;
const Z_SPAWN = 25;

const LIGHT_SPACING = 40;
const LIGHT_Y = 30;
const LIGHT_COLOR = 0x604040;
const LIGHT_INTENSITY = 0.8;
const LIGHT_DISTANCE = 80;
const LIGHT_POSITIONS = [
	[-LIGHT_SPACING, LIGHT_Y, LIGHT_SPACING],
	[LIGHT_SPACING, LIGHT_Y, LIGHT_SPACING],
	[-LIGHT_SPACING, LIGHT_Y, -LIGHT_SPACING],
	[LIGHT_SPACING, LIGHT_Y, -LIGHT_SPACING]
];

const PLATFORM_RADIUS = 40;
const PLATFORM_HEIGHT = 1000000;
const PLATFORM_TESSELATION = 128;

const MAX_BULLETS = 100;


export default class SurvivalScene
{
	/**
	 * Create a new scene to run the main gameplay loop.
	 * @param {Game} game The game instance running the scene
	 */
	constructor(game)
	{
		/** @type {Game} */
		this.game = game;

		game.renderer.shadowMap.enabled = true;
		game.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		/** @type {THREE.Scene} */
		const three = this.three = new THREE.Scene();

		/** @type {THREE.PerspectiveCamera} */
		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH_CANVAS/HEIGHT_CANVAS, DEPTH_NEAR, DEPTH_FAR);

		/** @type {Player} */
		this.player = new Player(this, X_SPAWN, Z_SPAWN);

		/** @type {number} */
		this.platform_radius = PLATFORM_RADIUS;

		/** @type {THREE.Mesh} */
		const platform = new THREE.Mesh(new THREE.CylinderGeometry(PLATFORM_RADIUS, PLATFORM_RADIUS, PLATFORM_HEIGHT, PLATFORM_TESSELATION), new THREE.MeshStandardMaterial());
		platform.position.y = -PLATFORM_HEIGHT/2;
		platform.receiveShadow = true;

		/** @type {THREE.InstancedMesh} */
		this.bulletMesh = bulletMesh(MAX_BULLETS);

		/** @type {Bullet[]} */
		this.bullets = new Array(MAX_BULLETS);

		const lights = LIGHT_POSITIONS.map(position =>
		{
			const light = new THREE.PointLight(LIGHT_COLOR, LIGHT_INTENSITY, LIGHT_DISTANCE);
			light.position.set(...position);
			light.castShadow = true;
			return light;
		});

		three.add(platform, this.bulletMesh, ...lights);
	}

	/**
	 * Attempt to spawn a bullet in the scene.
	 * @param {THREE.Vector3} position Initial position of the bullet
	 * @param {THREE.Vector3} direction Initial movement direction of the bullet
	 */
	spawnBullet(position, direction)
	{
		for(let index_bullet = 0; index_bullet < this.bullets.length; ++index_bullet)
			if(!this.bullets[index_bullet]?.alive)
			{
				this.bullets[index_bullet] = new Bullet(this, position, direction);
				break;
			}
	}

	/**
	 * Update the scene.
	 * @param {number} dt Elapsed seconds since last update
	 */
	update(dt)
	{
		this.player.update(dt);

		const dummy = new THREE.Object3D();
		dummy.rotation.order = 'YXZ';

		this.bulletMesh.count = 0;
		const bullets = this.bullets.filter(bullet => Boolean(bullet));
		for(const bullet of bullets)
		{
			bullet.update(dt);
			if(bullet.alive)
			{
				const xz = Math.sqrt(bullet.speed.x**2 + bullet.speed.z**2);

				dummy.position.copy(bullet.position);
				dummy.rotation.x = Math.atan2(-bullet.speed.y, xz);
				dummy.rotation.y = Math.atan2(bullet.speed.x, bullet.speed.z);
				dummy.rotation.z = bullet.spin;

				dummy.updateMatrix();
				this.bulletMesh.setMatrixAt(this.bulletMesh.count++, dummy.matrix);
			}
		}

		this.bulletMesh.instanceMatrix.needsUpdate = true;

		this.game.renderer.render(this.three, this.camera);
	}

	/**
	 * Destroy the scene.
	 */
	destroy()
	{
		this.three.clear();
		this.player.destroy();
		this.bulletMesh.dispose();
	}
}