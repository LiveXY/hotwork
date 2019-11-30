'use strict';

var hot = require('./lib/HotHelper');
var bot = hot.getBot;

hot.scan('./lib');
bot.start();
