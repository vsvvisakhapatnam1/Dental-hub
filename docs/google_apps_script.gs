// Dental Hub Pro -> Google Sheet + Drive receiver
// Paste into Extensions > Apps Script of your Google Sheet, then Deploy > New deployment > Web app
// (Execute as: Me, Who has access: Anyone). Send the Web app URL to your developer.

const SECRET = 'oVH-VTb38hUgUZVhNSvo69Z-97ZFlFsD';
const CV_FOLDER_NAME = 'Dental Hub Pro - CVs';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return out({ ok: false, error: 'unauthorized' });
    if (body.action === 'ping') return out({ ok: true });

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sh = ss.getSheetByName(body.tab) || ss.insertSheet(body.tab);
      if (sh.getLastRow() === 0) {
        sh.appendRow(body.headers);
        sh.getRange(1, 1, 1, body.headers.length).setFontWeight('bold');
        sh.setFrozenRows(1);
      }
      if (body.record_id && sh.createTextFinder(body.record_id).matchEntireCell(true).findNext()) {
        return out({ ok: true, duplicate: true });
      }
      const row = body.row;
      let link = '';
      if (body.cv && body.cv.data && body.cv_col !== null) {
        const blob = Utilities.newBlob(Utilities.base64Decode(body.cv.data), body.cv.mime, body.cv.filename);
        link = cvFolder().createFile(blob).getUrl();
        row[body.cv_col] = link;
      }
      sh.appendRow(row);
      return out({ ok: true, cv_link: link });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function cvFolder() {
  const it = DriveApp.getFoldersByName(CV_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CV_FOLDER_NAME);
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
