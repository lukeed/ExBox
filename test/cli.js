import fs from 'fs';
// import path from 'path';
import write from 'temp-write';
// import execa from 'execa';
import test from 'ava';

global.Promise = Promise;

test('fix option', async t => {
	const filepath = await write('console.log(0)\n', 'x.js');
	t.is(fs.readFileSync(filepath, 'utf8').trim(), 'console.log(0)');
});
