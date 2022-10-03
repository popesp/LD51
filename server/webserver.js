import fs from 'fs';
import path from 'path';
import http from 'http';


const PORT = 80;
const RESCODE_OK = 200;
const RESCODE_NOTFOUND = 404;

const TYPEMAP = {
	'.js': 'application/javascript',
	'.css': 'text/css',
	'.png': 'image/png',
	'.ico': 'image/x-icon',
	'.json': 'application/json'
};


http.createServer((request, response) =>
{
	const filename = `game${request.url === '/' ? '/index.html' : request.url}`;
	const type = TYPEMAP[path.extname(filename)] ?? 'text/html';

	fs.readFile(filename, (error, content) =>
	{
		if(error === null)
		{
			response.writeHead(RESCODE_OK, {'Content-Type': type});
			response.end(content, 'utf-8');
		}
		else
		{
			response.writeHead(RESCODE_NOTFOUND);
			response.end(content, 'utf-8');
		}
	});
}).listen(PORT);