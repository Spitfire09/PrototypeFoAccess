/**
 * Fetches the top 5 Sales Order headers from Business Central via OData v4.
 *
 * @param {string} baseUrl  - e.g. https://api.businesscentral.dynamics.com/v2.0/{tenant}/production
 * @param {string} company  - Company GUID
 * @param {string} bearerToken - OAuth2 bearer token (without "Bearer " prefix)
 * @returns {Promise<Object[]>} Array of sales order header objects
 * @throws {Error} with a descriptive message on HTTP or network errors
 */
export async function fetchTop5SalesOrderHeaders(baseUrl, company, bearerToken) {
  const url =
    `${baseUrl.replace(/\/$/, '')}/api/v2.0/companies(${company})/salesOrders` +
    `?$top=5&$select=number,orderDate,sellToCustomerName,status,currencyCode,totalAmountIncludingTax`;

  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        Accept: 'application/json',
      },
    });
  } catch (networkError) {
    throw new Error(
      `Netværksfejl: Kunne ikke kontakte serveren. Kontrollér Base URL og netværksforbindelsen.\n(${networkError.message})`
    );
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail =
        body?.error?.message ||
        body?.message ||
        JSON.stringify(body);
    } catch {
      detail = await response.text().catch(() => '');
    }

    const hint =
      response.status === 401
        ? ' Ugyldig eller udløbet bearer token.'
        : response.status === 403
        ? ' Adgang nægtet. Kontrollér, at tokenet har de nødvendige rettigheder.'
        : response.status === 404
        ? ' Ressource ikke fundet. Kontrollér Base URL og Company ID.'
        : '';

    throw new Error(
      `HTTP ${response.status} ${response.statusText}.${hint}${detail ? `\nDetaljer: ${detail}` : ''}`
    );
  }

  const data = await response.json();
  return data.value ?? [];
}
