import {WIDTH_CANVAS, HEIGHT_CANVAS} from '../globals.js';


const R_AMBIENT = 1;
const G_AMBIENT = 1;
const B_AMBIENT = 1;

const FOV = 70;
const DEPTH_NEAR = 0.1;
const DEPTH_FAR = 1000;

const X_SPAWN = 0;
const Z_SPAWN = -25;

const SPACING_LIGHTS = 20;
const Y_LIGHTS = 10;

const GRAVITY = 0.75;
const MOVESPEED = 1;

const KEYCODE_UP = 87;
const KEYCODE_LEFT = 65;
const KEYCODE_DOWN = 83;
const KEYCODE_RIGHT = 68;
const KEYCODE_JUMP = 32;

const PLATFORM_RADIUS = 40;
const PLATFORM_HEIGHT = 1000000;
const PLATFORM_TESSELATION = 128;

const PLAYER_HEIGHT = 2;


export default class SurvivalScene
{
	constructor(game)
	{
		this.game = game;

		/** @type {THREE.Scene} */
		const three = this.three = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH_CANVAS/HEIGHT_CANVAS, DEPTH_NEAR, DEPTH_FAR);

		const platform = new THREE.Mesh(new THREE.CylinderGeometry(PLATFORM_RADIUS, PLATFORM_RADIUS, PLATFORM_HEIGHT, PLATFORM_TESSELATION), new THREE.MeshBasicMaterial({color: 0x00ff00}));
		platform.position.y = -PLATFORM_HEIGHT/2;
		three.add(platform);

		this.camera.position.y = PLAYER_HEIGHT;
		this.camera.position.z = 5;
	}

	/**
	 * Update the scene.
	 * @param {number} dt Elapsed seconds since last update
	 */
	update(dt)
	{
		// this.physicsWorld.stepSimulation(dt, 10);
		// this.entityManager.Update(dt);

		// const data = this.data;

		// data.camera.position.x = data.player.position.x;
		// data.camera.position.y = data.player.position.y + PLAYER_HEIGHT;
		// data.camera.position.z = data.player.position.z;
		
		// const forward = data.camera.getTarget().subtract(data.camera.position);
		// forward.y = 0;
		// forward.normalize();

		// const left = BABYLON.Vector3.Cross(forward, new BABYLON.Vector3(0, 1, 0));
		// left.y = 0;
		// left.normalize();
		
		// const f_speed = (data.move.forward ? 1 : 0) - (data.move.back ? 1 : 0);
		// const f_left = (data.move.left ? 1 : 0) - (data.move.right ? 1 : 0);

		// const move = forward.scale(f_speed).add(left.scale(f_left));
		// move.normalize();
		// move.scale(MOVESPEED);

		// data.player.position.x += move.x;
		// data.player.position.y += move.y;
		// data.player.position.z += move.z;

		// data.player.canjump = data.player.position.y === 0;
		this.game.renderer.render(this.three, this.camera);
	}

	destroy()
	{
		this.three.clear();
	}
}





// const babylonScene = this.babylonScene = new BABYLON.Scene(this.engine);
// babylonScene.ambientColor = new BABYLON.Color3(R_AMBIENT, G_AMBIENT, B_AMBIENT);

// const camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(X_SPAWN, PLAYER_HEIGHT, Z_SPAWN), babylonScene);
// camera.setTarget(BABYLON.Vector3.Zero());
// camera.attachControl(this.canvas, true);
// camera.inertia = 0;
// camera.inverseRotationSpeed = 8;
// camera.fov = FOV;

// const platform = BABYLON.Mesh.CreateCylinder('platform', PLATFORM_HEIGHT, PLATFORM_DIAMETER, PLATFORM_DIAMETER, PLATFORM_TESSELATION, 1, babylonScene);
// platform.position.y = -PLATFORM_HEIGHT/2;

// const lights = [
// 	new BABYLON.PointLight('light1', new BABYLON.Vector3(-SPACING_LIGHTS, Y_LIGHTS, SPACING_LIGHTS), babylonScene),
// 	new BABYLON.PointLight('light2', new BABYLON.Vector3(SPACING_LIGHTS, Y_LIGHTS, SPACING_LIGHTS), babylonScene),
// 	new BABYLON.PointLight('light3', new BABYLON.Vector3(-SPACING_LIGHTS, Y_LIGHTS, -SPACING_LIGHTS), babylonScene),
// 	new BABYLON.PointLight('light4', new BABYLON.Vector3(SPACING_LIGHTS, Y_LIGHTS, -SPACING_LIGHTS), babylonScene)
// ];

// for(const light of lights)
// {
// 	light.intensity = 0.25;
// 	light.diffuse = new BABYLON.Color3(0.5, 0.45, 0.45);
// 	light.specular = new BABYLON.Color3(0.5, 0.45, 0.45);
// }

// const data = this.data = {
// 	player: {
// 		position: new BABYLON.Vector3(X_SPAWN, 0, Z_SPAWN),
// 		canjump: false
// 	},
// 	camera,
// 	locked: false,
// 	move: {forward: false, left: false, back: false, right: false, jump: false},
// 	pointerlockchange: () =>
// 	{
// 		data.locked = Boolean(document.mozPointerLockElement ?? document.webkitPointerLockElement ?? document.msPointerLockElement ?? document.pointerLockElement);
// 	},
// 	keydown: event =>
// 	{
// 		switch(event.keyCode)
// 		{
// 			case KEYCODE_UP:
// 				data.move.forward = true;
// 				break;
// 			case KEYCODE_LEFT:
// 				data.move.left = true;
// 				break;
// 			case KEYCODE_DOWN:
// 				data.move.back = true;
// 				break;
// 			case KEYCODE_RIGHT:
// 				data.move.right = true;
// 				break;
// 			case KEYCODE_JUMP:
// 				if(data.player.canjump)
// 					data.move.jump = true;
// 				break;
// 			default:
// 		}
// 	},
// 	keyup: event =>
// 	{
// 		switch(event.keyCode)
// 		{
// 			case KEYCODE_UP:
// 				data.move.forward = false;
// 				break;
// 			case KEYCODE_LEFT:
// 				data.move.left = false;
// 				break;
// 			case KEYCODE_DOWN:
// 				data.move.back = false;
// 				break;
// 			case KEYCODE_RIGHT:
// 				data.move.right = false;
// 				break;
// 			default:
// 		}
// 	}
// };

// window.addEventListener('click', function()
// {
// 	const pickResult = babylonScene.pick(babylonScene.pointerX, babylonScene.pointerY);

// 	if(pickResult.hit)
// 	{
// 		const dir = pickResult.pickedPoint.subtract(babylonScene.activeCamera.position);
// 		dir.normalize();
// 	}
// });

// // Attach events to the document
// document.addEventListener('pointerlockchange', data.pointerlockchange);
// document.addEventListener('mspointerlockchange', data.pointerlockchange);
// document.addEventListener('mozpointerlockchange', data.pointerlockchange);
// document.addEventListener('webkitpointerlockchange', data.pointerlockchange);
// document.addEventListener('keydown', data.keydown);
// document.addEventListener('keyup', data.keyup);

// babylonScene.onPointerDown = function()
// {
// 	// request a lock if we are not already locked
// 	if(!data.locked)
// 	{
// 		game.canvas.requestPointerLock = (game.canvas.requestPointerLock ?? game.canvas.msRequestPointerLock ?? game.canvas.mozRequestPointerLock ?? game.canvas.webkitRequestPointerLock);
// 		game.canvas.requestPointerLock?.();
// 	}
// };