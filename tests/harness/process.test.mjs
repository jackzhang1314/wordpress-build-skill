import test from 'node:test';
import assert from 'node:assert/strict';
import {runWithRetry} from '../../harness/lib/process.mjs';

test('transient command failures are retried with backoff', () => {
  let calls = 0;
  const result = runWithRetry(() => {
    calls += 1;
    if (calls < 3) {
      const error = new Error('connection closed');
      error.status = 255;
      throw error;
    }
    return 'ok';
  }, 'fake', [], {}, {attempts: 3, delayMs: 1});
  assert.equal(result, 'ok');
  assert.equal(calls, 3);
});

test('non-transient failures do not retry', () => {
  let calls = 0;
  assert.throws(() => runWithRetry(() => {
    calls += 1;
    throw new Error('bad arguments');
  }, 'fake', [], {}, {attempts: 3, delayMs: 1}), /bad arguments/);
  assert.equal(calls, 1);
});
