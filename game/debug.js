/* eslint-disable no-console */


export const DEBUG = true;

export function log(...params)
{
	if(DEBUG)
		console.log(...params);
}