import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ── Minimal fetch mock ────────────────────────────────────────────────────────

function makeFetch(status, body) {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : status === 401 ? 'Unauthorized' : 'Error',
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
}

// We import the module under test after patching global.fetch
async function importApi(fetchImpl) {
  // Node test runner does not support module-level mocks easily,
  // so we patch globalThis.fetch and use a dynamic import with a cache-bust.
  globalThis.fetch = fetchImpl;
  // Re-import each time so the module picks up the new fetch
  const mod = await import(`../src/api.js?t=${Date.now()}`);
  return mod.fetchTop5SalesOrderHeaders;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('fetchTop5SalesOrderHeaders', () => {
  const BASE = 'https://bc.example.com/v2.0/tenant/production';
  const COMPANY = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const TOKEN = 'mytoken';

  it('returns sales order array on 200', async () => {
    const orders = [{ number: 'SO-001', sellToCustomerName: 'ACME' }];
    const fn = await importApi(makeFetch(200, { value: orders }));

    const result = await fn(BASE, COMPANY, TOKEN);
    assert.deepEqual(result, orders);
  });

  it('returns empty array when value is missing', async () => {
    const fn = await importApi(makeFetch(200, {}));
    const result = await fn(BASE, COMPANY, TOKEN);
    assert.deepEqual(result, []);
  });

  it('throws with 401 hint for invalid bearer token', async () => {
    const fn = await importApi(
      makeFetch(401, { error: { message: 'Invalid token' } })
    );

    await assert.rejects(
      () => fn(BASE, COMPANY, TOKEN),
      (err) => {
        assert.ok(err.message.includes('401'), 'Should contain status code 401');
        assert.ok(
          err.message.toLowerCase().includes('token') ||
            err.message.toLowerCase().includes('bearer'),
          'Should mention token/bearer'
        );
        return true;
      }
    );
  });

  it('throws with 404 hint for wrong company/url', async () => {
    const fn = await importApi(makeFetch(404, { error: { message: 'Not found' } }));

    await assert.rejects(
      () => fn(BASE, COMPANY, TOKEN),
      (err) => {
        assert.ok(err.message.includes('404'));
        return true;
      }
    );
  });

  it('throws on network error', async () => {
    const fn = await importApi(async () => {
      throw new TypeError('Failed to fetch');
    });

    await assert.rejects(
      () => fn(BASE, COMPANY, TOKEN),
      (err) => {
        assert.ok(err.message.toLowerCase().includes('netværk') || err.message.toLowerCase().includes('server'));
        return true;
      }
    );
  });

  it('builds correct URL with trailing-slash-stripped base', async () => {
    let capturedUrl = '';
    globalThis.fetch = async (url, _opts) => {
      capturedUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => ({ value: [] }),
      };
    };
    const { fetchTop5SalesOrderHeaders: fn } = await import(
      `../src/api.js?t=${Date.now()}`
    );

    await fn(BASE + '/', COMPANY, TOKEN);
    assert.ok(!capturedUrl.includes('//api/'), 'Should strip trailing slash from base URL');
    assert.ok(capturedUrl.includes(`/companies(${COMPANY})/salesOrders`));
    assert.ok(capturedUrl.includes('$top=5'));
  });
});
