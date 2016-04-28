import fs from 'fs';
import {resolve} from 'path';
import write from 'temp-write';
import readPkg from 'read-pkg';
import execa from 'execa';
import test from 'ava';

global.Promise = Promise;
const cli = resolve('../exbox.js');

test('dummy test', async t => {
	const filepath = await write('console.log(0)\n', 'x.js');
	t.is(fs.readFileSync(filepath, 'utf8').trim(), 'console.log(0)');
});

test('display current CLI version', async t => {
	const out = await execa.stdout(cli, ['--version']);
	t.is(out, readPkg.sync('..').version);
});
