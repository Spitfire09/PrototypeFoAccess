import { fetchSalesOrderHeaders } from './d365fo.js';

const form = document.querySelector('#sales-order-form');
const resultBody = document.querySelector('#sales-orders-body');
const statusText = document.querySelector('#status-text');

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle('error', isError);
}

function renderRows(rows) {
  resultBody.innerHTML = '';

  if (!rows.length) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6">No sales orders found.</td>';
    resultBody.appendChild(row);
    return;
  }

  for (const item of rows) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.SalesOrderNumber ?? ''}</td>
      <td>${item.SalesOrderName ?? ''}</td>
      <td>${item.OrderingCustomerAccountNumber ?? ''}</td>
      <td>${item.InvoiceCustomerAccountNumber ?? ''}</td>
      <td>${item.RequestedShippingDate ?? ''}</td>
      <td>${item.dataAreaId ?? ''}</td>
    `;
    resultBody.appendChild(row);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const baseUrl = String(formData.get('baseUrl') || '').trim();
  const company = String(formData.get('company') || '').trim();
  const token = String(formData.get('token') || '').trim();

  try {
    setStatus('Loading sales orders...');
    const rows = await fetchSalesOrderHeaders({ baseUrl, company, token });
    renderRows(rows);
    setStatus(`Loaded ${rows.length} sales order header(s).`);
  } catch (error) {
    renderRows([]);
    setStatus(error instanceof Error ? error.message : 'Unexpected error while loading sales orders.', true);
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch((error) => {
    setStatus(`Service worker registration failed: ${error.message}`, true);
  });
}
