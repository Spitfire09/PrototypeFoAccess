import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSalesOrderHeadersUrl } from '../src/d365fo.js';

test('buildSalesOrderHeadersUrl requests top 5 SalesOrderHeadersV2 entries', () => {
  const url = buildSalesOrderHeadersUrl('https://contoso.operations.dynamics.com/', 'usmf');
  const decoded = decodeURIComponent(url);
  const parsed = new URL(url);

  assert.match(decoded, /\/data\/SalesOrderHeadersV2\?/);
  assert.match(decoded, /\$top=5/);
  assert.match(decoded, /cross-company=true/);
  assert.match(decoded, /dataAreaId\+eq\+'usmf'/);
  assert.equal(decodeURIComponent(parsed.searchParams.get('$filter')), "dataAreaId eq 'usmf'");
});

test('buildSalesOrderHeadersUrl escapes single quotes in company value', () => {
  const url = buildSalesOrderHeadersUrl('https://contoso.operations.dynamics.com', "u'smf");
  const decoded = decodeURIComponent(url);

  assert.match(decoded, /dataAreaId\+eq\+'u''smf'/);
});
