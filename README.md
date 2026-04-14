# PrototypeFoAccess

PWA-ready web app that reads the top 5 sales order headers from Dynamics 365 Finance & Operations (D365FO).

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4173`.

## Usage

1. Enter your D365FO base URL (for example `https://<tenant>.operations.dynamics.com`).
2. Enter the target company (`dataAreaId`, for example `usmf`).
3. Paste an OAuth bearer token with access to D365FO OData.
4. Click **Load top 5 headers**.

The app calls `SalesOrderHeadersV2` and shows only header fields.

## Test

```bash
npm test
```
