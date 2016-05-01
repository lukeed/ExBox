#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var child = require('child_process');
// var osenv = require('osenv');
var cli = require('commander');
var readPkg = require('read-pkg');
var loadJson = require('load-json-file');
var writeJson = require('write-json-file');
var notifier = require('update-notifier');

var xfile = 'ExBox.json';
// var xhome = path.join(osenv.home(), process.env.EXBOXTEMP || '.exbox');
var xhome = path.join(__dirname, process.env.EXBOXTEMP || '.exbox');
var xconf = path.join(xhome, xfile);

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
	.description('Setup ExBox for the first time')
	.usage(' ') // no options
	.action(function () {
		debug('initializing ExBox!');

		// check to see if already initialized
		fs.stat(xconf, function (_, stats) {
			// exists, exit.
			if (stats && stats.isFile()) {
				return errorMessage([
					'ExBox has already been initialized!',
					'In order to re-initialize, you must delete your `.exbox` directory.',
					'Run `exbox reset` before re-initializing.'
				]);
			}

			// create `.exbox` home directory
			child.exec(['mkdir', '-p', xhome].join(' '), function () {
				// copy files to `.exbox`
				var stubs = path.join(__dirname, 'stubs');
				[xfile, 'after.sh', 'aliases'].forEach(function (file) {
					child.exec(['cp', '-f', path.join(stubs, file), xhome].join(' '));
				});
				console.log('ExBox initialized!');
			});
		});
	});

cli
	.command('edit')
	.description('Edit the `' + xfile + '` file in your default editor.')
	.usage(' ') // no options
	.action(function () {
		// check if `xconf` exists
		fs.stat(xconf, function (err, stat) {
			if (err || !stat.isFile()) {
				return errorMessage([
					'ExBox hasn\'t been initialized.',
					'Please run `exbox init` first.'
				]);
			}

			debug('open `%s` for edits.', xconf);

			// only open if not in debug
			child.exec([process.env.DEBUG ? 'ls' : 'open', xconf].join(' '));
		});
	});

cli
	.command('reset')
	.description('Deletes existing ExBox configuration files.')
	.option('-f, --force', 'Do not save old config files.')
	.action(function (opts) {
		// check if `xconf` exists
		fs.stat(xconf, function (err, stat) {
			if (err || !stat.isFile()) {
				return errorMessage([
					'ExBox hasn\'t been initialized.',
					'No need to reset!'
				]);
			}

			if (opts.force) {
				return child.exec(['rm', '-rf', xhome].join(' '), function () {
					resetMessage('deleted');
				});
			}

			var dest = xhome.concat('-old');
			child.exec(['mv', xhome, dest].join(' '), function () {
				resetMessage('moved to `' + dest + '`');
			});
		});
	});

cli
	.command('domain <site> <dir>')
	.description('Map a Domain to a VM directory')
	.option('--ssl', '     Enable SSL on this domain')
	.action(function (site, dir, opts) {
		var ssl = opts.ssl || false;
		debug('domain: use ssl: %s. site: %s. dir: %s.', ssl, site, dir);
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

		// check if `xconf` exists
		fs.stat(xconf, function (err, stat) {
			if (err || !stat.isFile()) {
				return errorMessage([
					'ExBox hasn\'t been initialized.',
					'Please run `exbox init` first.'
				]);
			}

			// read the file
			loadJson(xconf).then(function (data) {
				// add the new folder obj
				data.folders.push({map: local, to: dir});
				// write the changes
				writeJson(xconf, data).then(function () {
					console.log('Folder added!'); // @todo
				});
			});
		});
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

/**
 * Log a Reset Status message to the Console
 * @param  {String} msg
 * @param  {Array}  args
 */
function resetMessage(msg) {
	console.log('\n  ExBox Reset:\n    Existing config files have been %s.', msg);
	console.log('    ExBox has been reset!\n');
}

/**
 * Log an `Oops!` message to the Console
 * @param  {Array} arr  Array of Strings
 */
function errorMessage(arr) {
	arr = arr.map(function (el) {
		return '    ' + el;
	});

	console.log(
		['', '  Oops!'].concat(arr, '').join('\n')
	);

	process.exit(1);
}
