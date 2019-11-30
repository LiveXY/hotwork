//机器人处理
'use strict';

var hot = require('./HotHelper');
var tools = hot.getTools;
var log = hot.getLog;
var Cache = hot.getCache;
var DB = hot.getDB;

var db1 = new DB();
var db2 = new DB();
var cache1 = new Cache();
var cache2 = new Cache();

var users = hot.getStore.users;
var chat = hot.getStore.chat;

function Bot() {}
var bot = Bot.prototype;
var index = 0;

bot.start = () => {
	setInterval(function() { bot.test(); }, 1000*5);
	bot.test();
};

bot.test = function() {
	index++;

	tools.msg(); //替换数据

	log.msg();
	cache1.msg(1);
	cache2.msg(2);

	bot.msg();
	db1.msg(1);
	db2.msg(2);
	users[index] = true;
	console.log(index, users);
	chat.msg();
}

bot.msg = function() {
	console.log('Bot beans singleton');
}
bot.init = function() {
	console.log('Bot init');
}

module.exports = { beans: [{ id: 'Bot', func: Bot, scope: 'singleton', runupdate: 'init' }] };