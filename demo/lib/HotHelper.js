//热更
'use strict';

const hot = require('../../index.js');

module.exports = {
	scan: hot.scan,
	get getStore() { return hot.get('Store', require(__dirname + '/Store')); },
	get getDB() { return hot.get('DB', require(__dirname + '/DB')); },
	get getTools() { return hot.get('Tools', require(__dirname + '/Tools')); },
	get getLog() { return hot.get('Log', require(__dirname + '/Log')); },
	get getBot() { return hot.get('Bot', require(__dirname + '/Bot')); },
	get getCache() { return hot.get('Cache', require(__dirname + '/Cache')); }
};