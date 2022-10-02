const BULLET_WIDTH = 0.2;
const BULLET_LENGTH_TIP = 0.6;
const BULLET_LENGTH_BACK = 0.2;
const BULLET_COLOR = 0xa06030;
const BULLET_COUNT = 5;
const NUM_ATTRIBUTES_PER_POSITION = 3;

const BULLET_SPIN = 0.12;
const BULLET_GRAVITY = 0.001;
const BULLET_SPEED = 2;

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

export function bulletMesh()
{
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(VERTS, NUM_ATTRIBUTES_PER_POSITION));

	const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial({color: BULLET_COLOR}), BULLET_COUNT);
	mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
	mesh.castShadow = true;

	return mesh;
}


export class Bullet
{
	constructor(direction)
	{
		this.position = new THREE.Vector3(0, 2, 0);
		this.speed = new THREE.Vector3().copy(direction).multiplyScalar(BULLET_SPEED);
		this.spin = 0;
	}

	update(dt)
	{
		this.spin = (this.spin + BULLET_SPIN)%(2*Math.PI);
		this.speed.y -= BULLET_GRAVITY;
		this.position.add(this.speed);
	}
}