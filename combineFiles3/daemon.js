/*
* @Author: Administrator
* @Date:   2016-09-28 13:23:25
* @Last Modified by:   Administrator
* @Last Modified time: 2016-09-28 15:21:41
* @function:守护进程
*/

'use strict';

const childProcess = require('child_process');

let worker;
/**
 * 生成子进程
 * @param  {[type]} server [description]
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
function spawn(server,config){
	worker = childProcess.spawn('node',[server,config]);
	console.log('server started!');
	worker.on('exit',code=>{
		if(code!==0){
			spawn(server,config);
			console.log('server restarted!');
		}
	})
}

const main=(argv)=>{
	spawn('server.js',argv[0]);
	process.on('SIGTERM',function(){
		worker.kill();//向子进程发信号
		process.exit(0);
	})
}

main(process.argv.slice(2));