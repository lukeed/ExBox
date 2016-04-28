import fs from 'fs';
import {resolve} from 'path';
import write from 'temp-write';
import readPkg from 'read-pkg';
import execa from 'execa';
import test from 'ava';

global.Promise = Promise;

const cli = resolve('../exbox.js');
const ver = readPkg.sync('..').version;

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
