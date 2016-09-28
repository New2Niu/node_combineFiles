/*
* @Author: LiuLei
* @Date:   2016-09-28 10:23:26
* @Last Modified by:   Administrator
* @Last Modified time: 2016-09-28 15:20:29
* @Function: node合并js，css文件
*/

'use strict';
const fs = require('fs'),
	path = require('path'),
	http = require('http');

//合并的文件类型
const MIME = {
	'.css':'text/css',
	'.js':'application/javascript'
}

function validateFiles(pathnames,callback){
	(function next(i,length){
		if(i<length){
			fs.stat(pathnames[i],(err,stat)=>{
				if(err){
					callback(err);
				}else if(!stat.isFile()){
					callback(new Error());
				}else{
					next(i+1,length);
				}
			})
		}else{
			callback(null,pathnames)
		}
	})(0,pathnames.length);
}

function outputFiles(pathnames,writer){
	(function next(i,length){
		if(i<length){
			let reader = fs.createReadStream(pathnames[i]);
			reader.pipe(writer,{end:false});
			reader.on('end',()=>{
				next(i+1,length);
			})
		}else{
			writer.end();
		}
	})(0,pathnames.length);
}

/**
 * 解析路径
 * @param  {String} root 根目录
 * @param  {String} url  url不包协议和含域名
 * @return {[type]}      [description]
 */
function parseUrl(root,url){

	if(url.indexOf('??')===-1){
		url.replace('/','/??');
	}

	let parts = url.split('??');
	let	base = parts[0];
	if(parts[1]===undefined) return undefined;
	let	pathnames = parts[1].split(',').map(item=>{
			return path.join(root,base,item);
		});
	return{
		mime:MIME[path.extname(pathnames[0])]||'text/plain',
		pathnames:pathnames
	}
}

/**
 * 主函数
 * @param  {Array} argv 输入的参数
 * @return {[type]}      [description]
 */
function main(argv){
	let config = JSON.parse(fs.readFileSync(argv[0],'utf-8')),
		root = config.root || '.',
		port = config.port || '8000';

	let server = http.createServer((req,res)=>{
		console.log(req.url)
		let urlInfo = parseUrl(root,req.url);//req.url不带协议和域名
		if(urlInfo!==undefined){
			validateFiles(urlInfo.pathnames,(err,data)=>{
				if (err) {
					res.writeHead(404);
					res.end(err.message);
				}else{
					res.writeHead(200,{'Content-Type':urlInfo.mime});
					outputFiles(data,res);
				}
			})
		}
		
	}).listen(port);
	process.on('SIGTERM',()=>{
		server.close(()=>{
			process.exit(0);
		})
	})
}

main(process.argv.slice(2));