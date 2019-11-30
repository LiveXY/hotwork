'use strict';

var Cache = function() {
	this.$id = 'Cache';
}

var cache = Cache.prototype;

cache.msg = function(i) {
	console.log('Cache function', i)
}

module.exports = Cache;