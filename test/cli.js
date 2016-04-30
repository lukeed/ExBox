/* eslint node/no-unsupported-features: 0 */
import fs from 'fs';
import {resolve} from 'path';
import write from 'temp-write';
import readPkg from 'read-pkg';
import execa from 'execa';
import test from 'ava';

global.Promise = Promise;

const cli = resolve('../exbox.js');
const ver = readPkg.sync('..').version;

const site = 'test.app';
const dir = 'test/dir';
const local = '~/local';

// turn on DEBUG messages
test.before(() => {
	process.env.DEBUG = 'exbox';
	process.env.EXBOXTEMP = 'temp-exbox-home';
});

// cleanup: delete the EXBOXTEMP dir
test.after(() => {
	execa('rm', ['-rf', resolve(__dirname, '..', process.env.EXBOXTEMP)]);
});

test('dummy test', async t => {
	const filepath = await write('console.log(0)\n', 'x.js');
	t.is(fs.readFileSync(filepath, 'utf8').trim(), 'console.log(0)');
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

test('exbox.init: debugger', async t => {
	const out = await execa.stdout(cli, ['init']);
	t.is(out, '[DEBUG] initializing ExBox!');
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
