/*
* @Author: LiuLei
* @Date:   2016-09-28 10:23:26
* @Last Modified by:   Administrator
* @Last Modified time: 2016-09-28 12:03:21
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

/**
 * 文件合并
 * @param  {Array}   pathnames 合并文件路径
 * @param  {Function} callback  回调函数
 * @return {[type]}             [description]
 */
function combineFiles(pathnames,callback){
	let output=[];
	(function next(i,length){
		if(i<length){
			fs.readFile(pathnames[i],function(err,data){
				if(err){
					callback(err);
				}else{
					output.push(data);
					next(i+1,length);
				}
			})
		}else{
			callback(null,Buffer.concat(output));
		}
	})(0,pathnames.length)
}

function parseUrl(root,url){

	if(url.indexOf('??')===-1){
		url.replace('/','/??');
	}

	let parts = url.split('??');
	let	base = parts[0];
	if(parts[1]===undefined) return undefined;
	let	pathnames = parts[1].split(',').map(function(item){
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

	http.createServer(function(req,res){
		console.log(req.url)
		let urlInfo = parseUrl(root,req.url);//req.url不带协议和域名
		if(urlInfo!==undefined){
			combineFiles(urlInfo.pathnames,function(err,data){
				if(err){
					res.writeHead(404);
					res.end(err.message);
				}else{
					res.writeHead(200,{'Content-Type':urlInfo.mime});
					res.end(data);
				}
			})
		}
		
	}).listen(port);
	console.log('server started port:',port);
}

main(process.argv.slice(2));