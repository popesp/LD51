import * as THREE from 'three';
import {WIDTH_CANVAS, HEIGHT_CANVAS} from './globals.js';


const SECONDS_PER_MS = 0.001;
const DT_MIN = 0.033333333333;
const PIXELSIZE = 4;


export default class Game
{
	/**
	 * Create a new game instance.
	 * @param {HTMLCanvasElement} canvas Canvas DOM element
	 */
	constructor()
	{
		/** @type {THREE.WebGLRenderer} */
		this.renderer = new THREE.WebGLRenderer({antialias: false});
		this.renderer.setPixelRatio(window.devicePixelRatio/PIXELSIZE);
		document.body.appendChild(this.renderer.domElement);
		window.addEventListener('resize', () => this.resize());
		this.resize();

		/** @type {Scene|null} The active scene */
		this.scene_active = null;

		/** @type {number|null} */
		this.t_last = null;

		/**
		 * Frame handler.
		 * @param {number} t Current time
		 */
		this.step = t =>
		{
			if(!this.t_last)
				this.t_last = t;

			const dt = Math.min(DT_MIN, SECONDS_PER_MS*(t - this.t_last));
			this.scene_active?.update?.(dt);

			this.t_last = t;
			this.id_frame = requestAnimationFrame(this.step);
		};

		/** @type {number} */
		this.id_frame = requestAnimationFrame(this.step);
	}

	/**
	 * Resize the game to fit in the window.
	*/
	resize()
	{
		let w = window.innerWidth;
		let h = window.innerHeight;

		const r = HEIGHT_CANVAS/WIDTH_CANVAS;

		if(w*r > window.innerHeight)
			w = Math.min(w, Math.ceil(h/r), WIDTH_CANVAS);
		h = Math.floor(w*r);

		this.renderer.domElement.style.top = `${Math.floor((window.innerHeight - h)/2)}px`;
		this.renderer.domElement.style.left = `${Math.floor((window.innerWidth - w)/2)}px`;
		this.renderer.setSize(w, h);
	}

	/**
	 * Switch the currently active scene.
	 * @param {Scene} scene The scene to switch to
	 */
	switchScene(scene)
	{
		this.scene_active?.destroy?.();
		this.scene_active = null;

		const ready = scene.initialize?.() ?? Promise.resolve();
		ready.then(() =>
		{
			scene.start?.();
			this.scene_active = scene;
		});
	}
}