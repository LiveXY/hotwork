'use strict';

var log = require('pomelo-logger').getLogger('hotwork', 'HotSource');
var watcher = require('./watcher');
var extend = require('./extend');

var hotmap = {};
var file_bean_sort = {};

function scanFolder(path) { watcher.watch(path, scanCallBack, true); }

function callback(bean, scan, file) {
	if (!bean.id) return log.error('热更新文件未配置id ->', file);
	if (!bean.func) return log.error('热更新文件未配置func ->', file);
	if (!!file_bean_sort[bean.id] && scan != true) {
		if (file_bean_sort[bean.id] != file && res.beans.length == 1)
			return log.error('ID ->', bean.id, '重复的文件 ->', file, '==', file_bean_sort[bean.id]);
	} else {
		file_bean_sort[bean.id] = file;
	}
	var singleton = bean.hasOwnProperty('scope') && bean.scope == 'singleton';
	if (!!hotmap[bean.id]) {
		if (scan) return;
		if (singleton != !!hotmap[bean.id].singleton)
			return log.error('单例发生改变ID ->', bean.id, '=>', file);
		var protos = null, orgprotos = {};
		var org_func = hotmap[bean.id].func;
		if (!!org_func) {
			orgprotos = org_func.prototype;
		} else if (!!hotmap[bean.id].singleton) {
			orgprotos = hotmap[bean.id].singleton.__proto__;
		} else {
			return;
		}
		protos = bean.func.prototype;
		try {
			if (!!protos) for (var func_name in protos) orgprotos[func_name] = protos[func_name];
			log.warn('文件ID ->', bean.id, '更新成功：', file, singleton, bean.runupdate);
		} catch (e) {
			return log.error('文件ID ->', bean.id, '更新失败：', file, e);
		}
		if (singleton && bean.hasOwnProperty('runupdate')) hotmap[bean.id].singleton[bean.runupdate]();
	} else {
		hotmap[bean.id] = { id: bean.id, func: bean.func };
		if (singleton) hotmap[bean.id].singleton = new bean.func();
	}
}
function scanCallBack(folderres, scan) {
	for (var file in folderres) {
		var res = folderres[file];
		if (typeof res === 'function') {
			//按照function规则来更新 this.$id/this.$scope/this.$runupdate
			var bean = { func: res };
			var tmpobj = new res();
			if (tmpobj.hasOwnProperty('$id')) bean.id = tmpobj.$id;
			if (tmpobj.hasOwnProperty('$scope')) bean.scope = tmpobj.$scope;
			if (tmpobj.hasOwnProperty('$runupdate')) bean.runupdate = tmpobj.$runupdate;
			if (!bean.id) bean.id = file;
			callback(bean, scan, file);
		} else if (res.hasOwnProperty('beans')) {
			//按照beans规则来更新
			for (var i = 0; i < res.beans.length; i++) {
				var bean = res.beans[i];
				callback(bean, scan, file, tmpobj);
			}
		} else {
			//覆盖原有数据 noUpdate不更新/reverse只更新没有的数据
			if (!!hotmap[file]) {
				if (scan) return;
				if (!!res.noUpdate) return log.warn('文件ID ->', file, '跳过更新！');
				if (!!res.reverse) {
					var org_res = hotmap[file].singleton;
					for (var key in res) {
						if (org_res.hasOwnProperty(key)) res[key] = org_res[key];
						else org_res[key] = res[key];
					}
					return;
				}
				if (!hotmap[file].singleton) return log.error('文件无热更新数据：', file);
				extend(true, hotmap[file].singleton, res);
				log.warn('文件ID ->', file, '更新成功！');
			} else {
				hotmap[file] = { id: file, singleton: res };
			}
		}
	}
}

exports.scanFolder = scanFolder;
exports.setHot = function (id, require, file) { file_bean_sort[id] = file; }
exports.getHot = function (id, require, file) {
	if (!hotmap.hasOwnProperty(id)) {
		if (!file) file = id;
		if (!require) return log.error('无热更新ID ->', id, ' => ', file);
		var res = {};
		res[file] = require;
		scanCallBack(res, true);
	}
	if (!hotmap.hasOwnProperty(id)) return log.error('依然无热更新ID ->', id, ' => ', file);
	var hot = hotmap[id];
	if (!!hot.singleton) return hot.singleton;
	return hot.func;
}