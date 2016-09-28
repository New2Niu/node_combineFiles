/*
* @Author: Administrator
* @Date:   2016-09-28 13:23:25
* @Last Modified by:   Administrator
* @Last Modified time: 2016-09-28 13:41:13
* @function:守护进程
*/

'use strict';

const childProcess = require('child_process');

let worker;

function spawn(server,config){
	worker = childProcess.spawn('node',[server,config]);
	worker.on('exit',function(code){
		if(code!==0){
			spawn(server,config);
		}
	})
}

function main(argv){
	spawn('server.js',argv[0]);
	process.on('SIGTERM',function(){
		worker.kill();//向子进程发信号
		process.exit(0);
	})
}

main(process.argv.slice(2));