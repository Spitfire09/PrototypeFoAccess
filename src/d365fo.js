export function buildSalesOrderHeadersUrl(baseUrl, company) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const escapedCompany = company.replace(/'/g, "''");
  const params = new URLSearchParams({
    '$top': '5',
    '$orderby': 'CreatedDateTime desc',
    '$select': 'SalesOrderNumber,SalesOrderName,OrderingCustomerAccountNumber,InvoiceCustomerAccountNumber,RequestedShippingDate,dataAreaId',
    'cross-company': 'true',
    '$filter': `dataAreaId eq '${escapedCompany}'`
  });

  return `${normalizedBaseUrl}/data/SalesOrderHeadersV2?${params.toString()}`;
}

export async function fetchSalesOrderHeaders({ baseUrl, company, token }) {
  if (!baseUrl || !company) {
    throw new Error('Base URL and company are required.');
  }

  const headers = {
    Accept: 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildSalesOrderHeadersUrl(baseUrl, company), {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`D365FO request failed (${response.status}): ${responseBody || response.statusText}`);
  }

  const payload = await response.json();
  return payload.value ?? [];
}
