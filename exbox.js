#!/usr/bin/env node
'use strict';

var cli = require('commander');
var readPkg = require('read-pkg');
var notifier = require('update-notifier');

// up to date?
var pkg = readPkg.sync(__dirname);
notifier({pkg: pkg}).notify();

// setup debugger
var debug = require('debug')('exbox');
debug.log = function () {
	arguments[0] = arguments[0].replace(/^(.*?exbox )/, '[DEBUG] ');
	return console.log.apply(console, arguments);
};

cli.version(pkg.version)
	.usage('<command> [args...] [options]')
	.on('--help', function () {
		console.log('  For additional help with any command, run `exbox COMMAND -h`');
		console.log();
	});

cli
	.command('init')
	.description('setup ExBox for the first time')
	.usage(' ') // no options
	.action(function () {
		console.log('inside init!');
	});

cli
	.command('domain <site> <dir>')
	.description('Map a Domain to a VM directory')
	.option('--ssl', '     Enable SSL on this domain')
	.action(function (site, dir, opts) {
		var ssl = opts.ssl || false;
		debug('domain: use ssl: %s. site: %s. dir: %s.', ssl, site, dir);
		//
	}).on('--help', addExamples.bind(null, [
		'$ exbox domain phoenix.dev /home/vagrant/code/phoenix',
		'$ exbox domain hello-world.app /home/vagrant/code/hello-world',
		'$ exbox domain --ssl secure.app /home/vagrant/code/secure',
		'$ exbox domain secure.app /home/vagrant/code/secure --ssl'
	]));

cli.parse(process.argv);

/**
 * Log examples to the Console, with formatting
 * @param {Array} arr
 */
function addExamples(arr) {
	console.log('  Examples: \n');
	arr.forEach(function (el) {
		console.log('    ' + el);
	});
	console.log();
}
