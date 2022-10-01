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

const PLATFORM_RADIUS = 40;
const PLATFORM_HEIGHT = 1000000;
const PLATFORM_TESSELATION = 128;


export default class SurvivalScene
{
	constructor(game)
	{
		this.game = game;

		game.renderer.shadowMap.enabled = true;
		game.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		/** @type {THREE.Scene} */
		const three = this.three = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH_CANVAS/HEIGHT_CANVAS, DEPTH_NEAR, DEPTH_FAR);

		this.player = new Player(this.camera, PLATFORM_RADIUS, X_SPAWN, Z_SPAWN);

		const platform = new THREE.Mesh(new THREE.CylinderGeometry(PLATFORM_RADIUS, PLATFORM_RADIUS, PLATFORM_HEIGHT, PLATFORM_TESSELATION), new THREE.MeshStandardMaterial());
		platform.position.y = -PLATFORM_HEIGHT/2;
		platform.receiveShadow = true;
		three.add(platform);

		this.bulletMesh = bulletMesh();
		three.add(this.bulletMesh);
		this.bullets = [new Bullet()];

		const lights = [
			new THREE.PointLight(LIGHT_COLOR, LIGHT_INTENSITY, LIGHT_DISTANCE),
			new THREE.PointLight(LIGHT_COLOR, LIGHT_INTENSITY, LIGHT_DISTANCE),
			new THREE.PointLight(LIGHT_COLOR, LIGHT_INTENSITY, LIGHT_DISTANCE),
			new THREE.PointLight(LIGHT_COLOR, LIGHT_INTENSITY, LIGHT_DISTANCE)
		];

		lights[0].position.set(-LIGHT_SPACING, LIGHT_Y, LIGHT_SPACING);
		lights[1].position.set(LIGHT_SPACING, LIGHT_Y, LIGHT_SPACING);
		lights[2].position.set(-LIGHT_SPACING, LIGHT_Y, -LIGHT_SPACING);
		lights[3].position.set(LIGHT_SPACING, LIGHT_Y, -LIGHT_SPACING);

		for(const light of lights)
		{
			light.castShadow = true;
			three.add(light);
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

		this.bullets.forEach((bullet, index) =>
		{
			bullet.update(dt);

			const xz = Math.sqrt(bullet.speed.x**2 + bullet.speed.z**2);

			dummy.position.copy(bullet.position);
			dummy.rotation.x = Math.atan(-bullet.speed.y/xz);
			dummy.rotation.y = Math.atan(bullet.speed.x/bullet.speed.z);
			dummy.rotation.z = bullet.spin;

			dummy.updateMatrix();
			this.bulletMesh.setMatrixAt(index, dummy.matrix);
		});

		this.bulletMesh.instanceMatrix.needsUpdate = true;

		this.game.renderer.render(this.three, this.camera);
	}

	destroy()
	{
		this.three.clear();
	}
}