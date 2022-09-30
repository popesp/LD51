/* eslint-disable no-console */


const DEBUG = true;

export function log(...params)
{
	if(DEBUG)
		console.log(...params);
}