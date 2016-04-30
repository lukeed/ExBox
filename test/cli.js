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

// turn on DEBUG messages
test.before(() => {
	execa.sync('rm', ['-rf', HOME]); // start clean slate
	process.env.DEBUG = 'exbox';
	process.env.EXBOXTEMP = TMP;
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

test.serial('exbox.reset: throw before `init`', async t => {
	const out = await t.throws(execa.stdout(cli, ['reset']));
	t.regex(out, /Oops/, '`Oops!` error is thrown');
	t.regex(out, /No need to reset/, 'did not need to reset, no dir exists');
});

test.serial('exbox.init: first', async t => {
	const out = await execa.stdout(cli, ['init']);
	t.is(out, '[DEBUG] initializing ExBox!\nExBox initialized!', 'debugger + success msg');

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
	const out = await t.throws(execa.stdout(cli, ['init']));
	t.regex(out, /Oops/, '`Oops!` error is thrown');
	t.regex(out, /ExBox has already been initialized/, 'already initialized');
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

test.serial('exbox.reset: with `--force` flag', async t => {
	const out = await execa.stdout(cli, ['reset', '-f']);
	t.regex(out, /deleted/, 'config files were deleted.');
	t.regex(out, /ExBox has been reset/, 'successfully reset');

	// cleanup, rerun `init`
	await execa(cli, ['init']);
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
	t.is(out, `[DEBUG] domain: use ssl: false. site: ${site}. dir: ${dir}.`);
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
	t.is(out, `[DEBUG] folder: local: ${local}. dir: ${dir}.`);
});
