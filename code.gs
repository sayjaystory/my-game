/**
 * AR Learning Hub - Backend System (ใช้ระบบ Fetch API)
 * สำหรับดึงข้อมูลสื่อการเรียนรู้จาก Google Sheets
 */

// Google Sheet ID ที่ใช้งาน
const SPREADSHEET_ID = '1dm0lLIvTK3hwFg9ugCkGxB1DcReCvZOzeoXUMISCyiI';
// ชื่อ Sheet ที่เก็บข้อมูล
const SHEET_NAME = 'Games';

/**
 * ฟังก์ชันหลักสำหรับการจัดการ Request (เปิดหน้าเว็บ หรือ รับส่งข้อมูล API)
 * @param {Object} e - Event Object จาก Google Apps Script
 * @returns {Object} - HtmlOutput หรือ TextOutput (JSON)
 */
function doGet(e) {
  // 1. หากมีการส่งพารามิเตอร์ ?action=getGames มา ให้ทำหน้าที่เป็น API Endpoint คืนค่า JSON
  if (e.parameter && e.parameter.action === 'getGames') {
    const data = getGamesData();
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // 2. กรณีการเรียกหน้าเว็บปกติ ให้ใช้ HtmlTemplate เพื่อส่ง Web App URL ไปยัง Frontend โดยอัตโนมัติ
  const webAppUrl = ScriptApp.getService().getUrl();
  const template = HtmlService.createTemplateFromFile('Index');
  template.webAppUrl = webAppUrl; // ส่งตัวแปร URL ไปที่ไฟล์ HTML
  
  return template.evaluate()
    .setTitle('AR Learning Hub - โรงเรียนบ้านสุไหงโก-ลก')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * ฟังก์ชันภายในสำหรับประมวลผลข้อมูลจาก Google Sheet
 * @returns {Array} - รายการเกมที่มีสถานะ Active
 */
function getGamesData() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return [];
    }
    
    const dataRange = sheet.getDataRange().getValues();
    if (dataRange.length <= 1) {
      return [];
    }
    
    const rows = dataRange.slice(1);
    const activeGames = [];
    
    // คอลัมน์ Status อยู่ที่ Index 6
    const STATUS_COL_INDEX = 6;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const status = row[STATUS_COL_INDEX] ? row[STATUS_COL_INDEX].toString().trim().toLowerCase() : '';
      
      if (status === 'active') {
        activeGames.push({
          id: row[0],
          category: row[1],
          title: row[2],
          description: row[3],
          thumbnail: row[4],
          url: row[5]
        });
      }
    }
    
    return activeGames;
    
  } catch (error) {
    console.error('Error in getGamesData:', error.message);
    return [];
  }
}
