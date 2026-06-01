/**
 * AR Learning Hub - Backend System (Updated with Specific Sheet ID)
 * สำหรับดึงข้อมูลสื่อการเรียนรู้จาก Google Sheets
 */

// ใส่ Google Sheet ID ที่ต้องการใช้งาน
const SPREADSHEET_ID = '1dm0lLIvTK3hwFg9ugCkGxB1DcReCvZOzeoXUMISCyiI';
// ชื่อ Sheet ที่เก็บข้อมูล
const SHEET_NAME = 'Games';

/**
 * ฟังก์ชันหลักสำหรับการสร้าง Web App
 * @param {Object} e - Event Object
 * @returns {HtmlOutput} - หน้าเว็บ Index.html
 */
function doGet(e) {
  // สร้าง HTML Output จากไฟล์ Index.html พร้อมตั้งค่ารองรับ Responsive
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('AR Learning Hub - โรงเรียนบ้านสุไหงโก-ลก')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * ฟังก์ชันสำหรับอ่านข้อมูลจาก Google Sheet แบบ Real-Time ผ่าน ID
 * @returns {String} - ข้อมูล JSON ของเกมที่สถานะ Active
 */
function getGames() {
  try {
    // เปิด Google Sheet ผ่าน ID ที่ระบุไว้
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('ไม่พบ Sheet ที่ชื่อ "' + SHEET_NAME + '" ใน Spreadsheet ID ที่ระบุ');
    }
    
    // ดึงข้อมูลทั้งหมด รวมถึง Header
    const dataRange = sheet.getDataRange().getValues();
    
    // ตรวจสอบว่ามีข้อมูลหรือไม่ (ต้องมีมากกว่า 1 แถวคือ Header + Data)
    if (dataRange.length <= 1) {
      return JSON.stringify([]);
    }
    
    const headers = dataRange[0];
    const rows = dataRange.slice(1);
    const activeGames = [];
    
    // ตำแหน่ง Column (Index เริ่มจาก 0)
    // 0:ID, 1:Category, 2:Title, 3:Description, 4:Thumbnail, 5:URL, 6:Status
    const STATUS_COL_INDEX = 6;
    
    // วนลูปเพื่อดึงเฉพาะข้อมูลที่ Active
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const status = row[STATUS_COL_INDEX] ? row[STATUS_COL_INDEX].toString().trim().toLowerCase() : '';
      
      // กรองเฉพาะ Status = Active
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
    
    // คืนค่าเป็น JSON String
    return JSON.stringify(activeGames);
    
  } catch (error) {
    // ส่งคืน Array ว่างพร้อม Log error หากเกิดข้อผิดพลาด
    console.error('Error in getGames:', error.message);
    return JSON.stringify([]);
  }
}
