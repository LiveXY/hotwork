'use strict';

var fs = require('fs');
var path = require('path');

var monDirs = {};
var Loader = module.exports = {};

Loader.watch = function (path, cb, scan) {
	if (path.indexOf('.svn') !== -1 || path.indexOf('.git') !== -1) return;
	if (path.charAt(path.length - 1) !== '/') path += '/';
	if (!!monDirs[path]) return;
	startWatch(path, cb);
	if (scan) cb(Loader.load(path, false, scan, cb), scan);
	var files = fs.readdirSync(path);
	if (files.length === 0) return console.error('目录暂无文件：' + path);
	var fp = void 0, fn = void 0;
	for (var i = 0, l = files.length; i < l; i++) {
		fn = files[i];
		fp = path + fn;
		if (isDir(fp)) Loader.watch(fp, cb);
	}
}
Loader.load = function (mpath, filename, scan, cb) {
	if (!mpath) return console.error('路径不能为空！');
	try {
		mpath = fs.realpathSync(mpath);
	} catch (err) {
		console.error('文件真实路径不存在：', mpath);
	}
	if (!isDir(mpath)) return console.error('文件路径不存在：', mpath);
	return loadPath(mpath, filename, scan, cb);
}

function startWatch(path, cb) {
	if (path.charAt(path.length - 1) !== '/') path += '/';
	if (!!monDirs[path]) return;
	monDirs[path] = true;
	if (!path) return;
	fs.watch(path, function (event, name) {
		if ((event === 'change' || event === 'rename') && name.split('.').pop() === 'js')
			cb(Loader.load(path, name, false, cb));
	});
}
function loadFile(fp, scan) {
	var m = requireUncached(fp, scan);
	if (!m) return;
	return m;
}
function loadPath(path, filename, scan, cb) {
	if (path.indexOf('.svn') !== -1 || path.indexOf('.git') !== -1) return;
	var files = fs.readdirSync(path);
	if (files.length === 0) return console.error('目录暂无文件：' + path);
	if (path.charAt(path.length - 1) !== '/') path += '/';
	var fp = void 0, fn = void 0, m = void 0, res = {};
	for (var i = 0, l = files.length; i < l; i++) {
		fn = files[i];
		fp = path + fn;
		if (!isFile(fp) || !checkFileType(fn, '.js')) {
			if (isDir(fp)) {
				if (!monDirs[fp]) Loader.watch(fp, cb, true);
				if (scan) loadPath(fp, filename, scan, cb);
			}
			continue;
		}
		if (filename && getFileName(fn, 0) != filename) continue;
		m = loadFile(fp, scan);
		if (!m) continue;
		var name = getFileName(fn, '.js'.length);
		res[name] = m;
	}
	return res;
}
function checkFileType(fn, suffix) {
	if (suffix.charAt(0) !== '.') suffix = '.' + suffix;
	if (fn.length <= suffix.length) return false;
	var str = fn.substring(fn.length - suffix.length).toLowerCase();
	suffix = suffix.toLowerCase();
	return str === suffix;
}
function isFile(path) { return fs.existsSync(path) && fs.statSync(path).isFile(); }
function isDir(path) { return fs.existsSync(path) && fs.statSync(path).isDirectory(); }
function getFileName(fp, suffixLength) {
	var fn = path.basename(fp);
	if (fn.length > suffixLength) return fn.substring(0, fn.length - suffixLength);
	return fn;
}
function requireUncached(module, scan) {
	var orgreq = null;
	if (!scan) {
		orgreq = require.cache[require.resolve(module)];
		delete require.cache[require.resolve(module)];
	}
	var req = require(module);
	if (!scan && !!orgreq) require.cache[require.resolve(module)] = orgreq;
	return req;
}