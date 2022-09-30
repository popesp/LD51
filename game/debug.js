/* eslint-disable no-console */


const DEBUG = false;

export function log(...params)
{
	if(DEBUG)
		console.log(...params);
}