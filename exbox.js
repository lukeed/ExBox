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
	.usage('<command> [options] [args...]')
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

		var onFalse = function () {
			// create `.exbox` home directory
			child.exec(['mkdir', '-p', xhome].join(' '), function () {
				// copy files to `.exbox`
				var stubs = path.join(__dirname, 'stubs');
				[xfile, 'after.sh', 'aliases'].forEach(function (file) {
					child.exec(['cp', '-f', path.join(stubs, file), xhome].join(' '));
				});
				console.log('ExBox initialized!');
			});
		};

		ifExists(onFalse, function () {
			return errorMessage([
				'ExBox has already been initialized!',
				'In order to re-initialize, you must delete your `.exbox` directory.',
				'Run `exbox reset` before re-initializing.'
			]);
		});
	});

cli
	.command('edit')
	.description('Edit the `' + xfile + '` file in your default editor.')
	.usage(' ') // no options
	.action(function () {
		ifExists([], function () {
			debug('open `%s` for edits.', xconf);

			// only open if not in debug
			child.exec([process.env.DEBUG ? 'ls' : 'open', xconf].join(' '));
		});
	});

cli
	.command('reset')
	.description('Reset existing ExBox configuration files.')
	.option('-d, --delete', 'Delete files instead of renaming.')
	.action(function (opts) {
		var err = [
			'ExBox hasn\'t been initialized.',
			'No need to reset!'
		];

		ifExists(err, function () {
			if (opts.delete) {
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

		ifExists([], function () {
			writeToConf('folders', {map: local, to: dir});
		});
	}).on('--help', addExamples.bind(null, 'folder', [
		'~/code/project /home/vagrant/code/project',
		'~/code/another/project /home/vagrant/code/project2'
	]));

cli.parse(process.argv);

/**
 * Format & Write a msg to Console
 * @param  {String}  title
 * @param  {Array}   arr
 * @param  {Boolean} padTop    Use a '\n' to start?
 */
function showMessage(title, arr, padTop) {
	padTop = padTop === undefined ? true : padTop;
	title = '  ' + title;

	arr = arr.map(function (el) {
		return '    ' + el;
	});

	console.log(
		(padTop ? [''] : []).concat(title, arr, '').join('\n')
	);
}

/**
 * Log examples to the Console, with formatting
 * @param {String} cmd    The name of the command in question
 * @param {Array} arr     An array of example usages
 */
function addExamples(cmd, arr) {
	arr = arr.map(function (el) {
		return ['$ exbox', cmd, el].join(' ');
	});

	return showMessage('Examples: \n', arr, false);
}

/**
 * Log a Reset Status message to the Console
 * @param  {String} msg
 * @param  {Array}  args
 */
function resetMessage(msg) {
	return showMessage('ExBox Reset:', [
		'Existing config files have been ' + msg,
		'ExBox has been reset!'
	]);
}

/**
 * Log an `Oops!` message to the Console
 * @param  {Array} arr  Array of Strings
 */
function errorMessage(arr) {
	showMessage('Oops!', arr);
	process.exit(1);
}

/**
 * Check if `xconf` file exists. Run callback accordingly.
 * @param  {Function|Array} onFalse   Array = Error Messages
 * @param  {Function}       onTrue
 */
function ifExists(onFalse, onTrue) {
	fs.stat(xconf, function (err, stat) {
		// doesn't exist?
		if (err || !stat.isFile()) {
			if (Array.isArray(onFalse)) {
				// set default `init` error message
				onFalse = onFalse.length ? onFalse : ['ExBox hasn\'t been initialized.', 'Please run `exbox init` first.'];
				return errorMessage(onFalse);
			}
			return onFalse();
		}

		return onTrue();
	});
}

/**
 * Write a Data Object to the `xconf` file
 * @param  {String} key   The data-key name
 * @param  {Object} obj   The data object to add
 */
function writeToConf(key, obj) {
	var msg = capitalize(key).slice(0, -1); // remove trailing 's'

	// read the file
	loadJson(xconf).then(function (data) {
		data[key].push(obj); // add new obj
		// write the changes
		writeJson(xconf, data).then(function () {
			return showMessage(['Added ', msg, '!'].join(''));
		});
	});
}

/**
 * Capitalize a String/word
 * @param  {String} str
 * @return {String}
 */
function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
}
