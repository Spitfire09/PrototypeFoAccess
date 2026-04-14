import { fetchTop5SalesOrderHeaders } from './api.js';

const STORAGE_KEY = 'foAccess_config';

const baseUrlInput = document.getElementById('baseUrl');
const companyInput = document.getElementById('company');
const bearerTokenInput = document.getElementById('bearerToken');
const loadBtn = document.getElementById('loadBtn');
const statusMessage = document.getElementById('statusMessage');
const resultsDiv = document.getElementById('results');

// ── Persist & restore config values so they are never lost ──────────────────

function saveConfig() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      baseUrl: baseUrlInput.value,
      company: companyInput.value,
      bearerToken: bearerTokenInput.value,
    })
  );
}

function loadConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const { baseUrl, company, bearerToken } = JSON.parse(stored);
    if (baseUrl) baseUrlInput.value = baseUrl;
    if (company) companyInput.value = company;
    if (bearerToken) bearerTokenInput.value = bearerToken;
  } catch {
    // Corrupt storage – ignore
  }
}

[baseUrlInput, companyInput, bearerTokenInput].forEach((el) =>
  el.addEventListener('input', saveConfig)
);

// ── UI helpers ───────────────────────────────────────────────────────────────

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${isError ? 'error' : 'success'}`;
  statusMessage.hidden = false;
  resultsDiv.hidden = true;
}

function showResults(headers) {
  statusMessage.hidden = true;

  if (headers.length === 0) {
    showStatus('Ingen salgsordrer fundet.');
    return;
  }

  const columns = [
    { key: 'number', label: 'Nummer' },
    { key: 'orderDate', label: 'Ordredato' },
    { key: 'sellToCustomerName', label: 'Kunde' },
    { key: 'status', label: 'Status' },
    { key: 'currencyCode', label: 'Valuta' },
    { key: 'totalAmountIncludingTax', label: 'Beløb inkl. moms' },
  ];

  const thead = `<tr>${columns.map((c) => `<th>${c.label}</th>`).join('')}</tr>`;
  const tbody = headers
    .map(
      (row) =>
        `<tr>${columns
          .map((c) => `<td>${row[c.key] ?? ''}</td>`)
          .join('')}</tr>`
    )
    .join('');

  resultsDiv.innerHTML = `<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
  resultsDiv.hidden = false;
}

// ── Load button handler ──────────────────────────────────────────────────────

loadBtn.addEventListener('click', async () => {
  const baseUrl = baseUrlInput.value.trim();
  const company = companyInput.value.trim();
  const bearerToken = bearerTokenInput.value.trim();

  if (!baseUrl || !company || !bearerToken) {
    showStatus('Udfyld venligst Base URL, Company ID og Bearer Token.', true);
    return;
  }

  loadBtn.disabled = true;
  loadBtn.textContent = 'Henter…';
  statusMessage.hidden = true;
  resultsDiv.hidden = true;

  try {
    const headers = await fetchTop5SalesOrderHeaders(baseUrl, company, bearerToken);
    showResults(headers);
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    loadBtn.disabled = false;
    loadBtn.textContent = 'Load top 5 headers';
  }
});

// ── Initialise ───────────────────────────────────────────────────────────────

loadConfig();
