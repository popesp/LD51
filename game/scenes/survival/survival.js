import {OBJLoader} from 'objloader';
import * as THREE from 'three';
import {bulletMesh, Bullet} from './bullet.js';
import {enemyMesh, Enemy} from './enemy.js';
import Player from './player.js';
import {WIDTH_CANVAS, HEIGHT_CANVAS} from '../../globals.js';


const FOV = 80;
const DEPTH_NEAR = 0.1;
const DEPTH_FAR = 1000;

const X_SPAWN = 0;
const Z_SPAWN = 25;

const LIGHT_SPACING = 40;
const LIGHT_Y = 30;
const LIGHT_COLOR = 0xc0c0c0;
const LIGHT_INTENSITY = 2;
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
const PLATFORM_COLOR = 0x604040;

const ENEMY_SPAWN_HEIGHT = 5;
const ENEMY_POSITIONS = [
	[0, ENEMY_SPAWN_HEIGHT, 0]
];

const MAX_BULLETS = 100;
const MAX_ENEMIES = 10;


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
		const platform = new THREE.Mesh(new THREE.CylinderGeometry(PLATFORM_RADIUS, PLATFORM_RADIUS, PLATFORM_HEIGHT, PLATFORM_TESSELATION), new THREE.MeshStandardMaterial({color: PLATFORM_COLOR}));
		platform.position.y = -PLATFORM_HEIGHT/2;
		platform.receiveShadow = true;

		const manager = new THREE.LoadingManager();
		const loader = new OBJLoader(manager);
		loader.load('/assets/meshes/magnimite.obj', obj =>
		{
			this.enemyMesh = enemyMesh(obj.children[0].geometry, MAX_ENEMIES);
			three.add(this.enemyMesh);

			this.enemies.push(...ENEMY_POSITIONS.map(position => new Enemy(this, new THREE.Vector3(...position))));
		});

		/** @type {Enemy[]} */
		this.enemies = [];

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

		if(this.enemyMesh)
		{
			this.enemyMesh.count = 0;
			const enemies = this.enemies.filter(enemy => Boolean(enemy));
			for(const enemy of enemies)
				if(enemy.alive)
				{
					enemy.update(dt);

					dummy.position.copy(enemy.position);
					dummy.rotation.set(0, 0, 0);

					dummy.updateMatrix();
					this.enemyMesh.setMatrixAt(this.enemyMesh.count++, dummy.matrix);
				}

			this.enemyMesh.instanceMatrix.needsUpdate = true;
		}

		this.bulletMesh.count = 0;
		const bullets = this.bullets.filter(bullet => Boolean(bullet));
		for(const bullet of bullets)
			if(bullet.alive)
			{
				bullet.update(dt);
				const xz = Math.sqrt(bullet.speed.x**2 + bullet.speed.z**2);

				dummy.position.copy(bullet.position);
				dummy.rotation.x = Math.atan2(-bullet.speed.y, xz);
				dummy.rotation.y = Math.atan2(bullet.speed.x, bullet.speed.z);
				dummy.rotation.z = bullet.spin;

				dummy.updateMatrix();
				this.bulletMesh.setMatrixAt(this.bulletMesh.count++, dummy.matrix);
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