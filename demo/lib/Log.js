'use strict';

function Log() {
	this.$id = 'Log';
	this.$scope = 'singleton';
	this.$runupdate = 'init';
}
var log = Log.prototype;

log.msg = function() {
	console.log('Log function singleton');
}

log.init = function() {
	console.log('Log init')
}

module.exports = Log;