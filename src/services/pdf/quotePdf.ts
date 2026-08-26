import { printToFileAsync } from 'expo-print';
import * as Sharing from 'expo-sharing';
import { colors } from '../../constants/colors';
import { strings } from '../../constants/strings';
import type { Quote } from '../../types';

const LETTER_WIDTH = 612;
const LETTER_HEIGHT = 792;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function buildQuoteHtml(quote: Quote, exchangeRate: number): string {
  const rows = quote.items
    .map((item) => {
      const subtotalVES = item.subtotalUSD * exchangeRate;
      return `
        <tr>
          <td class="service">${escapeHtml(item.serviceName)}</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatCurrency(item.priceUSD)}</td>
          <td class="num">${formatCurrency(item.subtotalUSD)}</td>
          <td class="num muted">${subtotalVES.toFixed(2)} Bs.</td>
        </tr>`;
    })
    .join('');

  const totalVES = quote.totalUSD * exchangeRate;
  const quoteNumber = quote.id.slice(0, 8).toUpperCase();

  const clientSection = quote.clientName
    ? `
      <div class="client">
        <div class="label">Cliente</div>
        <div class="value">${escapeHtml(quote.clientName)}</div>
      </div>`
    : '';

  const notesSection = quote.notes
    ? `
      <div class="notes">
        <div class="label">Notas</div>
        <div class="value">${escapeHtml(quote.notes)}</div>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Cotización ${quoteNumber}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: ${colors.text};
        background: ${colors.surface};
        font-size: 13px;
        line-height: 1.5;
        padding: 40px 48px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 3px solid ${colors.primary};
        padding-bottom: 16px;
        margin-bottom: 28px;
      }
      .brand { font-size: 26px; font-weight: 800; color: ${colors.primary}; letter-spacing: -0.5px; }
      .doc-type {
        font-size: 12px;
        font-weight: 700;
        color: ${colors.textSecondary};
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-top: 2px;
      }
      .header-right { text-align: right; }
      .meta { font-size: 12px; color: ${colors.textSecondary}; }
      .meta strong { color: ${colors.text}; font-weight: 600; }
      .client {
        background: ${colors.background};
        border: 1px solid ${colors.border};
        border-radius: 8px;
        padding: 14px 18px;
        margin-bottom: 24px;
      }
      .label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: ${colors.textSecondary};
        margin-bottom: 2px;
      }
      .value { font-size: 15px; font-weight: 600; color: ${colors.text}; }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
      }
      th {
        text-align: left;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: ${colors.textSecondary};
        border-bottom: 2px solid ${colors.border};
        padding: 8px 10px;
      }
      th.num, td.num { text-align: right; }
      td {
        border-bottom: 1px solid ${colors.border};
        padding: 10px;
        font-size: 13px;
        color: ${colors.text};
      }
      td.service { font-weight: 500; }
      td.muted { color: ${colors.textSecondary}; font-size: 12px; }
      tbody tr:last-child td { border-bottom: none; }
      .totals {
        background: ${colors.background};
        border: 1px solid ${colors.border};
        border-radius: 8px;
        padding: 16px 18px;
        margin-bottom: 8px;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
      }
      .total-row + .total-row { border-top: 1px solid ${colors.border}; margin-top: 6px; padding-top: 8px; }
      .total-label { font-size: 14px; color: ${colors.textSecondary}; }
      .total-amount { font-size: 16px; font-weight: 700; color: ${colors.text}; }
      .total-row.primary .total-label,
      .total-row.primary .total-amount { color: ${colors.primary}; font-weight: 800; }
      .rate {
        font-size: 11px;
        color: ${colors.textSecondary};
        margin-bottom: 20px;
      }
      .notes { margin-bottom: 20px; }
      .notes .value { font-size: 13px; font-weight: 400; font-style: italic; color: ${colors.textSecondary}; }
      .footer {
        border-top: 1px solid ${colors.border};
        padding-top: 14px;
        text-align: center;
        font-size: 11px;
        color: ${colors.textSecondary};
        margin-top: 32px;
      }
      .footer strong { color: ${colors.primary}; font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="brand">${escapeHtml(strings.appName)}</div>
        <div class="doc-type">Cotización</div>
      </div>
      <div class="header-right">
        <div class="meta">N.º <strong>${quoteNumber}</strong></div>
        <div class="meta">Fecha <strong>${formatDate(quote.createdAt)}</strong></div>
      </div>
    </div>

    ${clientSection}

    <table>
      <thead>
        <tr>
          <th>Servicio</th>
          <th class="num">Cant.</th>
          <th class="num">Precio</th>
          <th class="num">Subtotal USD</th>
          <th class="num">Subtotal Bs.</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span class="total-label">Total USD</span>
        <span class="total-amount">${formatCurrency(quote.totalUSD)}</span>
      </div>
      <div class="total-row primary">
        <span class="total-label">Total Bs.</span>
        <span class="total-amount">${totalVES.toFixed(2)} Bs.</span>
      </div>
    </div>

    <div class="rate">
      Tasa BCV: 1 USD = ${exchangeRate.toFixed(2)} Bs.${quote.exchangeRateDate ? ` · ${formatDate(quote.exchangeRateDate)}` : ''}
    </div>

    ${notesSection}

    <div class="footer">
      Generado por <strong>${escapeHtml(strings.appName)}</strong>
    </div>
  </body>
</html>`;
}

export async function generateQuotePdf(quote: Quote, exchangeRate: number): Promise<string> {
  const html = buildQuoteHtml(quote, exchangeRate);
  const { uri } = await printToFileAsync({
    html,
    width: LETTER_WIDTH,
    height: LETTER_HEIGHT,
  });
  return uri;
}

export async function shareQuotePdf(quote: Quote): Promise<void> {
  const uri = await generateQuotePdf(quote, quote.exchangeRate);
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Compartir no está disponible en este dispositivo');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Compartir Cotización',
  });
}
