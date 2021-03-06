/* eslint node/no-unsupported-features: 0 */
import fs from 'fs';
import {resolve} from 'path';
// import write from 'temp-write';
import readPkg from 'read-pkg';
import execa from 'execa';
import test from 'ava';

global.Promise = Promise;

const cli = resolve('../exbox.js');
const ver = readPkg.sync('..').version;

const site = 'test.app';
const dir = 'test/dir';
const local = '~/local';

const TMP = '.tmp';
const HOME = resolve(__dirname, '..', TMP);
// const CONF = resolve(TMP, 'ExBox.json');

// turn on DEBUG messages
test.before(async () => {
	await execa('rm', ['-rf', HOME]); // start clean slate
	process.env.DEBUG = 'exbox';
	process.env.EXBOXTEMP = TMP;
});

// run CMD + OPTS for each CMD
const throwBeforeInit = async (t, args) => {
	const out = await t.throws(execa.stdout(cli, args));
	t.regex(out, /Oops/, '`Oops!` error is thrown');
	t.regex(out, /been initialized/, 'has not been initialized');
};

test.serial('throw errors before `init`', async t => {
	t.plan(9);

	const tests = [
		['reset'], ['edit'], ['folder', local, dir]
	];

	for (let args of tests) {
		await throwBeforeInit(t, args);
	}
});

test.serial('exbox.init: first', async t => {
	const out = await execa.stdout(cli, ['init']);
	t.regex(out, /initialized/, 'debugger + success msg');

	t.true(fs.existsSync(HOME), '`homedir` exists');

	const files = fs.readdirSync(HOME);
	t.true(files.length > 1, '`homedir` has files');

	// attempt a second `init`
	execa(cli, ['init']).catch(err => {
		t.throws(err);
		t.is(err.cmd, 'exbox init', 'trying to `init` again will throw');
	});
});

test.serial('exbox.init: throw on repeat', async t => {
	t.plan(3);
	await throwBeforeInit(t, ['init']);
});

test.serial('exbox.reset: after `init`', async t => {
	const out = await execa.stdout(cli, ['reset']);
	t.regex(out, /moved to/, 'config files were moved');
	t.regex(out, /ExBox has been reset/, 'successfully reset');

	const old = HOME.concat('-old');
	const files = fs.readdirSync(old);
	t.true(files.length > 0, 'old files were moved to a new directory');

	// cleanup, delete `old`
	await execa('rm', ['-rf', old]);

	// cleanup, rerun `init`
	await execa(cli, ['init']);
});

test.serial('exbox.reset: with `--delete` flag', async t => {
	const out = await execa.stdout(cli, ['reset', '-d']);
	t.regex(out, /deleted/, 'config files were deleted.');
	t.regex(out, /ExBox has been reset/, 'successfully reset');

	// cleanup, rerun `init`
	await execa(cli, ['init']);
});

test('exbox.version: `--version` ok', async t => {
	const out = await execa.stdout(cli, ['--version']);
	t.is(out, ver, 'works: full `--version`');
});

test('exbox.version: `-V` ok', async t => {
	const out = await execa.stdout(cli, ['-V']);
	t.is(out, ver);
});

test('exbox.version: `-v` throws', async t => {
	t.throws(execa.stdout(cli, ['-v']));
});

test('exbox.help: `-h` ok', async t => {
	const out = await execa.stdout(cli, ['-h']);
	t.regex(out, /Usage: exbox <command>/);
});

test('exbox.help: `--help` ok', async t => {
	const out = await execa.stdout(cli, ['--help']);
	t.regex(out, /Usage: exbox <command>/);
});

test('exbox.help: `-H` throws', async t => {
	t.throws(execa.stdout(cli, ['-H']));
});

test('exbox.help: `init --help` ok', async t => {
	const out = await execa.stdout(cli, ['init', '--help']);
	t.regex(out, /Usage: init/);
});

test('exbox.help: `domain --help` ok', async t => {
	const out = await execa.stdout(cli, ['domain', '--help']);
	t.regex(out, /Examples:/);
});

test('exbox.edit: debugger', async t => {
	const out = await execa.stdout(cli, ['edit']);
	t.regex(out, /DEBUG/, 'shows `open` debug message');
});

test('exbox.domain: requires `site`', async t => {
	const err = await t.throws(execa.stdout(cli, ['domain']));
	t.regex(err.message, /error: missing required argument/);
});

test('exbox.domain: requires `dir`', async t => {
	const err = await t.throws(execa.stdout(cli, ['domain', site]));
	t.regex(err.message, /error: missing required argument/);
});

test('exbox.domain: debugger', async t => {
	const out = await execa.stdout(cli, ['domain', site, dir]);
	t.regex(out, /DEBUG/, 'enter the `domain` action');
});

test('exbox.folder: requires `local`', async t => {
	const err = await t.throws(execa.stdout(cli, ['folder']));
	t.regex(err.message, /error: missing required argument/);
});

test('exbox.folder: requires `dir`', async t => {
	const err = await t.throws(execa.stdout(cli, ['folder', local]));
	t.regex(err.message, /error: missing required argument/);
});

test('exbox.folder: debugger', async t => {
	const out = await execa.stdout(cli, ['folder', local, dir]);
	t.regex(out, /DEBUG/, 'shows `folder` debug message');
});
