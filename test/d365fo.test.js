import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSalesOrderHeadersUrl } from '../src/d365fo.js';

test('buildSalesOrderHeadersUrl requests top 5 SalesOrderHeadersV2 entries', () => {
  const url = buildSalesOrderHeadersUrl('https://contoso.operations.dynamics.com/', 'usmf');
  const parsed = new URL(url);
  const decodedPath = decodeURIComponent(`${parsed.pathname}?${parsed.searchParams.toString()}`);

  assert.match(decodedPath, /\/data\/SalesOrderHeadersV2\?/);
  assert.equal(parsed.searchParams.get('$top'), '5');
  assert.equal(parsed.searchParams.get('cross-company'), 'true');
  assert.equal(decodeURIComponent(parsed.searchParams.get('$filter')), "dataAreaId eq 'usmf'");
});

test('buildSalesOrderHeadersUrl escapes single quotes in company value', () => {
  const url = buildSalesOrderHeadersUrl('https://contoso.operations.dynamics.com', "u'smf");
  const decoded = decodeURIComponent(url);

  assert.match(decoded, /dataAreaId\+eq\+'u''smf'/);
});
