/**
 * =========================================================================
 * SINGAPORE LEDGER (SG LEDGER) - GOOGLE APPS SCRIPT BACKEND
 * =========================================================================
 * Instructions:
 * 1. In your Google Sheet, click Extensions > Apps Script.
 * 2. Replace all code in Code.gs with this file.
 * 3. Update the TOKEN variable below to your secret password/token.
 * 4. Click Deploy > Manage Deployments > Edit (pencil icon) > New Version > Deploy.
 * 5. Ensure "Who has access" is set to "Anyone".
 * =========================================================================
 */

const SHEET_NAME = 'Expenses';
const TOKEN = 'CHANGE_ME'; // Set your secret token here and in the app Settings

/**
 * Gets or creates the Expenses sheet with required column headers.
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // If 'Expenses' doesn't exist, check if the first sheet can be renamed or create new
    const firstSheet = ss.getSheets()[0];
    if (firstSheet && firstSheet.getLastRow() === 0) {
      firstSheet.setName(SHEET_NAME);
      sheet = firstSheet;
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }

  // Ensure headers exist
  if (sheet.getLastRow() === 0) {
    const headers = ['id', 'date', 'merchant', 'amount', 'category', 'note', 'updated_at'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Normalizes dates from Google Sheets (which can be Date objects) into YYYY-MM-DD strings.
 */
function normalizeDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const s = String(val).trim();
  // Handle ISO string or full date string
  if (s.includes('T')) return s.split('T')[0];
  return s;
}

/**
 * GET Handler - Read all expenses or ping health check
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    if (params.token !== TOKEN) {
      return jsonOut({ error: 'Unauthorized: Invalid token' });
    }

    if (params.action === 'ping') {
      return jsonOut({ ok: true, message: 'SG Ledger Backend is online and authorized!' });
    }

    const sheet = getOrCreateSheet();
    const dataRange = sheet.getDataRange();
    const rows = dataRange.getValues();

    if (rows.length <= 1) {
      return jsonOut({ ok: true, expenses: [] });
    }

    const headers = rows[0].map(h => String(h).trim().toLowerCase());
    const expenses = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue; // Skip empty ID rows

      const obj = {};
      headers.forEach((header, colIndex) => {
        let val = row[colIndex];
        if (header === 'date') {
          val = normalizeDate(val);
        } else if (header === 'amount') {
          val = Number(val) || 0;
        } else {
          val = val !== undefined && val !== null ? String(val) : '';
        }
        obj[header] = val;
      });

      expenses.push(obj);
    }

    return jsonOut({ ok: true, expenses: expenses });
  } catch (err) {
    return jsonOut({ error: 'Server error: ' + err.toString() });
  }
}

/**
 * POST Handler - Add, update, delete, or batch sync expenses
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut({ error: 'No payload received' });
    }

    const body = JSON.parse(e.postData.contents);
    if (body.token !== TOKEN) {
      return jsonOut({ error: 'Unauthorized: Invalid token' });
    }

    const sheet = getOrCreateSheet();
    const action = body.action || 'add';

    // 1. PING / DIAGNOSTIC
    if (action === 'ping') {
      return jsonOut({ ok: true, message: 'Connection successful!' });
    }

    // 2. ADD A SINGLE EXPENSE
    if (action === 'add') {
      const id = String(body.id || (Date.now() + '-' + Math.random().toString(36).slice(2, 7)));
      const date = normalizeDate(body.date || new Date());
      const merchant = String(body.merchant || 'Unknown');
      const amount = Number(body.amount) || 0;
      const category = String(body.category || 'misc');
      const note = String(body.note || '');
      const updatedAt = new Date().toISOString();

      sheet.appendRow([id, date, merchant, amount, category, note, updatedAt]);
      return jsonOut({ ok: true, id: id });
    }

    // 3. UPDATE AN EXISTING EXPENSE
    if (action === 'update') {
      const rows = sheet.getDataRange().getValues();
      const targetId = String(body.id);
      let foundIndex = -1;

      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === targetId) {
          foundIndex = i + 1; // 1-indexed for sheet
          break;
        }
      }

      if (foundIndex === -1) {
        // If not found, append as new
        const id = targetId;
        const date = normalizeDate(body.date || new Date());
        const merchant = String(body.merchant || 'Unknown');
        const amount = Number(body.amount) || 0;
        const category = String(body.category || 'misc');
        const note = String(body.note || '');
        const updatedAt = new Date().toISOString();
        sheet.appendRow([id, date, merchant, amount, category, note, updatedAt]);
        return jsonOut({ ok: true, id: id, updated: false, appended: true });
      }

      const date = normalizeDate(body.date || rows[foundIndex - 1][1]);
      const merchant = body.merchant !== undefined ? String(body.merchant) : rows[foundIndex - 1][2];
      const amount = body.amount !== undefined ? Number(body.amount) : rows[foundIndex - 1][3];
      const category = body.category !== undefined ? String(body.category) : rows[foundIndex - 1][4];
      const note = body.note !== undefined ? String(body.note) : rows[foundIndex - 1][5];
      const updatedAt = new Date().toISOString();

      sheet.getRange(foundIndex, 1, 1, 7).setValues([[targetId, date, merchant, amount, category, note, updatedAt]]);
      return jsonOut({ ok: true, id: targetId, updated: true });
    }

    // 4. DELETE AN EXPENSE
    if (action === 'delete') {
      const rows = sheet.getDataRange().getValues();
      const targetId = String(body.id);
      let deleted = false;

      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === targetId) {
          sheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }

      return jsonOut({ ok: true, deleted: deleted });
    }

    // 5. BATCH SYNC (Add/Update multiple items created offline)
    if (action === 'batch_sync' && Array.isArray(body.items)) {
      const rows = sheet.getDataRange().getValues();
      const idToRowMap = {};
      for (let i = 1; i < rows.length; i++) {
        idToRowMap[String(rows[i][0])] = i + 1;
      }

      const newRows = [];
      const nowIso = new Date().toISOString();

      body.items.forEach(item => {
        const id = String(item.id);
        const date = normalizeDate(item.date || new Date());
        const merchant = String(item.merchant || 'Unknown');
        const amount = Number(item.amount) || 0;
        const category = String(item.category || 'misc');
        const note = String(item.note || '');

        if (idToRowMap[id]) {
          sheet.getRange(idToRowMap[id], 1, 1, 7).setValues([[id, date, merchant, amount, category, note, nowIso]]);
        } else {
          newRows.push([id, date, merchant, amount, category, note, nowIso]);
        }
      });

      if (newRows.length > 0) {
        const startRow = sheet.getLastRow() + 1;
        sheet.getRange(startRow, 1, newRows.length, 7).setValues(newRows);
      }

      return jsonOut({ ok: true, count: body.items.length });
    }

    return jsonOut({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOut({ error: 'Server error: ' + err.toString() });
  }
}

/**
 * Returns JSON response with proper CORS/MIME settings.
 */
function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
