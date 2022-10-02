export function Random()
{
}

// default random number generator uses cryptographically random bits to generate numbers
Random.prototype.fraction = function()
{
	return 1;
};

Random.prototype.float = function(min, max)
{
	return min + this.fraction()*(max - min);
};

Random.prototype.int = function(min, max)
{
	return Math.floor(this.float(min, max));
};

// generate an exponentially distributed variate; distribution mean = 1/lambda
Random.prototype.dist_exponential = function(lambda)
{
	return -Math.log(this.fraction())/lambda;
};

// generate a normally distributed variate using Box-Muller transform; mu = mean, sigma = standard deviation
Random.prototype.dist_normal = function(mu, sigma)
{
	return mu + sigma*Math.sqrt(-2*Math.log(this.fraction()))*Math.cos(2*Math.PI*this.fraction());
};

Random.prototype.shuffle = function(list)
{
	for(let i = list.length - 1; i > 0; --i)
	{
		const j = this.int(0, i + 1);

		const tmp = list[i];
		list[i] = list[j];
		list[j] = tmp;
	}
};

Random.prototype.identifier = function(length)
{
	length = length || DEFAULT_LENGTH_IDENTIFIER;
	
	let identifier = '';
	for(let i = 0; i < length; ++i)
		identifier += ALPHABET.charAt(Math.floor(this.fraction()*ALPHABET.length));

	return identifier;
};


// linear congruential generator
function LCG(a, c, m, seed)
{
	this.a = a;
	this.c = c;
	this.m = m;

	this.seed = seed;
	this.reset();
}

LCG.prototype.generate = function(seed)
{
	return (this.a*seed + this.c)%this.m;
};

LCG.prototype.reset = function()
{
	this.next = this.generate(this.seed);
};

LCG.prototype.getnext = function()
{
	const n = this.next;

	this.next = this.generate(this.next);

	return n;
};


const PSEUDORAND_A = 1103515245; // multiplier
const PESUDORAND_C = 12345; // increment
const PSEUDORAND_M = 2147483648; // modulus; 2^31

export function PseudoRandom(seed)
{
	Random.call(this);

	this.lcg = new LCG(PSEUDORAND_A, PESUDORAND_C, PSEUDORAND_M, seed);
}
PseudoRandom.prototype = Object.create(Random.prototype);
Object.defineProperty(PseudoRandom.prototype, 'constructor', {
	value: Random,
	enumerable: false,
	writable: true
});

// pseudo-random number generator uses a linear congruential generator
PseudoRandom.prototype.fraction = function()
{
	return this.lcg.getnext()/this.lcg.m;
};
