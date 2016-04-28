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
		const ssl = opts.ssl || false;
		debug('domain: use ssl: %s. site: %s. dir: %s.', ssl, site, dir);

		//
	}).on('--help', function () {
		console.log('  Examples:');
		console.log();
		console.log('    $ exbox domain phoenix.dev /home/vagrant/code/phoenix');
		console.log('    $ exbox domain hello-world.app /home/vagrant/code/hello-world');
		console.log('    $ exbox domain --ssl secure.app /home/vagrant/code/secure');
		console.log('    $ exbox domain secure.app /home/vagrant/code/secure --ssl');
		console.log();
	});

cli.parse(process.argv);
