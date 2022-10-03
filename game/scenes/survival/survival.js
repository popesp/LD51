import Stats from 'stats';
import * as THREE from 'three';
import Bullet from './entities/bullet.js';
import Enemy from './entities/enemy.js';
import Player from './entities/player.js';
import GameoverScene from '../gameover.js';
import {DEBUG} from '../../debug.js';
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

const PLATFORM_RADIUS = 80;
const PLATFORM_HEIGHT = 1000000;
const PLATFORM_TESSELATION = 128;
const PLATFORM_COLOR = 0x604040;

const ENEMY_SPAWN_HEIGHT = 5;
const ENEMY_SPAWNS = [
	{type: 'sphere', position: [0, ENEMY_SPAWN_HEIGHT, 0]},
	{type: 'floater', position: [20, ENEMY_SPAWN_HEIGHT, -20]},
	{type: 'conehead', position: [-40, ENEMY_SPAWN_HEIGHT, 30]}
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

		/** @type {THREE.Scene} */
		const three = this.three = new THREE.Scene();

		/** @type {THREE.PerspectiveCamera} */
		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH_CANVAS/HEIGHT_CANVAS, DEPTH_NEAR, DEPTH_FAR);

		/** @type {THREE.AudioListener} */
		this.listener = new THREE.AudioListener();
		this.camera.add(this.listener);

		/** @type {Player} */
		this.player = new Player(this, X_SPAWN, Z_SPAWN);

		/** @type {number} */
		this.platform_radius = PLATFORM_RADIUS;

		/** @type {THREE.Mesh} */
		const platform = new THREE.Mesh(new THREE.CylinderGeometry(PLATFORM_RADIUS, PLATFORM_RADIUS, PLATFORM_HEIGHT, PLATFORM_TESSELATION), new THREE.MeshStandardMaterial({color: PLATFORM_COLOR}));
		platform.position.y = -PLATFORM_HEIGHT/2;
		platform.receiveShadow = true;

		/** @type {Entity[]} */
		this.entities = [this.player];

		const lights = LIGHT_POSITIONS.map(position =>
		{
			const light = new THREE.PointLight(LIGHT_COLOR, LIGHT_INTENSITY, LIGHT_DISTANCE);
			light.position.set(...position);
			light.castShadow = true;
			return light;
		});

		three.add(platform, ...lights);
	}

	initialize()
	{
		return Promise.all([
			Bullet.initialize(MAX_BULLETS),
			Enemy.initialize(MAX_ENEMIES),
			Player.initialize(this.listener)
		]).then(() =>
		{
			for(const mesh of [Bullet.mesh, ...Object.values(Enemy.types).map(type => type.mesh)])
			{
				mesh.count = 0;
				this.three.add(mesh);
			}
		});
	}

	start()
	{
		this.game.renderer.shadowMap.enabled = true;
		this.game.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		if(DEBUG)
		{
			/** @type {Stats} */
			this.stats = new Stats();
			document.body.appendChild(this.stats.dom);
		}

		document.getElementById('crosshair').className = '';
		document.body.requestPointerLock();

		for(const {type, position: [x, y, z]} of ENEMY_SPAWNS)
			this.spawnEnemy(new THREE.Vector3(x, y, z), type);
	}

	spawnEntity(entity)
	{
		for(let index_entity = 0; index_entity < this.entities.length; ++index_entity)
			if(!this.entities[index_entity].alive)
			{
				this.entities[index_entity] = entity;
				return;
			}
		
		this.entities.push(entity);
	}

	/**
	 * Attempt to spawn a bullet in the scene.
	 * @param {THREE.Vector3} position Initial position of the bullet
	 * @param {THREE.Vector3} direction Initial movement direction of the bullet
	 */
	spawnBullet(position, direction)
	{
		this.spawnEntity(new Bullet(this, position, direction));
	}

	/**
	 * Attempt to spawn an enemy in the scene.
	 * @param {THREE.Vector3} position Initial position of the enemy
	 */
	spawnEnemy(position, type)
	{
		this.spawnEntity(new Enemy(this, position, Enemy.types[type]));
	}

	/**
	 * Get a list of living enemies in the scene.
	 * @returns {Enemy[]} List of enemies
	 */
	getEnemies()
	{
		return this.entities.filter(entity => entity.type === 'enemy' && entity.alive);
	}

	/**
	 * Update the scene.
	 * @param {number} dt Elapsed seconds since last update
	 */
	update(dt)
	{
		if(DEBUG)
			this.stats.update();

		const dummy = new THREE.Object3D();
		dummy.rotation.order = 'YXZ';

		// reset all unique mesh counts
		for(const mesh of Array.from(new Set(this.entities.map(entity => entity.mesh).filter(m => Boolean(m)))))
			mesh.count = 0;

		for(const entity of this.entities)
			if(entity.alive)
			{
				entity.update(dt);

				if(entity.mesh)
				{
					dummy.position.copy(entity.position);
					dummy.rotation.copy(entity.rotation);
					dummy.updateMatrix();

					const index = entity.mesh.count++;
					entity.mesh.setMatrixAt(index, dummy.matrix);
					entity.mesh.setColorAt(index, entity.color);

					entity.mesh.instanceMatrix.needsUpdate = true;
					entity.mesh.instanceColor.needsUpdate = true;
				}
			}

		if(!this.player.alive)
			this.game.switchScene(new GameoverScene(this.game));

		this.game.renderer.render(this.three, this.camera);
	}

	/**
	 * Destroy the scene.
	 */
	destroy()
	{
		this.three.clear();
		this.player.destroy();

		if(DEBUG)
			this.stats.dom.remove();

		Bullet.destroy();
		Enemy.destroy();

		document.getElementById('crosshair').className = 'hidden';
	}
}