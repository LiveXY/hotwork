'use strict';

var DB = function() { };
var db = DB.prototype;

db.msg = function(i) {
	console.log('DB beans ', i)
}

module.exports = { beans: [{ id: 'DB', func: DB }] };