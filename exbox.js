#!/usr/bin/env node
'use strict';

var path = require('path');
// var osenv = require('osenv');
var cli = require('commander');
var readPkg = require('read-pkg');
var notifier = require('update-notifier');

// var homedir = path.join(osenv.home(), process.env.EXBOXTEMP || '.exbox');
var homedir = path.join(__dirname, process.env.EXBOXTEMP || '.exbox');

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
	}).on('--help', addExamples.bind(null, 'domain', [
		'phoenix.dev /home/vagrant/code/phoenix',
		'hello-world.app /home/vagrant/code/hello-world',
		'--ssl secure.app /home/vagrant/code/secure',
		'secure.app /home/vagrant/code/secure --ssl'
	]));

cli
	.command('folder <local> <dir>')
	.description('Map a local directory to a VM directory')
	.usage('<local> <dir>') // no options
	.action(function (local, dir) {
		debug('folder: local: %s. dir: %s.', local, dir);
	}).on('--help', addExamples.bind(null, 'folder', [
		'~/code/project /home/vagrant/code/project',
		'~/code/another/project /home/vagrant/code/project2'
	]));

cli.parse(process.argv);

/**
 * Log examples to the Console, with formatting
 * @param {String} cmd    The name of the command in question
 * @param {Array} arr     An array of example usages
 */
function addExamples(cmd, arr) {
	console.log('  Examples: \n');
	arr.forEach(function (el) {
		console.log(['    $ exbox', cmd, el].join(' '));
	});
	console.log();
}
