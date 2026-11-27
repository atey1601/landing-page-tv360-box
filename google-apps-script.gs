/**
 * TV360 Box - nhận lead từ form "Đăng ký lắp đặt" và ghi vào Google Sheet.
 * Dán toàn bộ đoạn này vào Apps Script của file Google Sheet
 * "TV360 Box - Lead đăng ký lắp đặt" (Tiện ích mở rộng > Apps Script).
 */
const SHEET_ID = '1hdpmvn0oktAa-1aXw-KQfgn79prvT0mzxmSUKjSYyaw';
const HEADERS = ['Thời gian', 'Họ và tên', 'Số điện thoại', 'Địa chỉ lắp đặt', 'Gói quan tâm', 'Thời gian liên hệ', 'Ghi chú', 'Nguồn'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = (e && e.parameter) || {};
    const clean = (v, max) => String(v || '').replace(/^[=+\-@]/, "'$&").trim().slice(0, max || 500);
    const phone = String(p.phone || '').replace(/[^0-9]/g, '');
    if (!p.name || !/^0[0-9]{9,10}$/.test(phone)) {
      return json({ ok: false, error: 'invalid' });
    }
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    sheet.appendRow([
      Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss'),
      clean(p.name, 120),
      "'" + phone,
      clean(p.address, 300),
      clean(p.plan, 60),
      clean(p.time, 60),
      clean(p.note, 1000),
      clean(p.source, 300),
    ]);
    return json({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, message: 'TV360 lead endpoint is running' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
