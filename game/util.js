// generate normally distributed coordinate pairs using Box-Muller transform
export function dist_normal_coords(mean, std)
{
	const a = Math.sqrt(-Math.log(Math.random())*2);
	const b = 2*Math.PI*Math.random();

	return {
		x: mean + a*std*Math.cos(b),
		y: mean + a*std*Math.sin(b)
	};
}