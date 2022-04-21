import HtmlOutput = GoogleAppsScript.HTML.HtmlOutput;

global.doGet = (): HtmlOutput => HtmlService.createTemplateFromFile("index").evaluate().addMetaTag("viewport", "width=device-width, initial-scale=1");

global.include = (filename: string): string => HtmlService.createHtmlOutputFromFile(filename).getContent();


global.t = () => {
  console.log(global.include("client.js"));
}

const config = {
  sheetId: "1LYsOCan9htIMMsgucIz-HPmKr30lVztvBgXbmW-YiIg",
  settingData: {
    sheetName: "Setting",
    headers: ["file data"],
    fileDataRange: "A2",
  },
  markdownData: {
    sheetName: "markdown一覧",
    headers: ["uuid", "text"],
  },
};

/**
 * シートの存在チェック関数
 * @param {Object} spreadSheet - Class SpreadSheet
 * @param {String} sheetName - 検索するシート名
 */
const _isExistSheet = (spreadSheet, sheetName) => spreadSheet.getSheets().filter((sheet) => sheet.getSheetName() === sheetName).length === 0;
/**
 * 設定用シートを作成する、存在していれば作成しない
 */
global.initCreateSheet = () => {
  const { sheetId, settingData, markdownData } = config;
  const ss = SpreadsheetApp.openById(sheetId);

  /* settingシートの存在チェック、無ければ作成 */
  if (_isExistSheet(ss, settingData.sheetName)) {
    const settingSheet = ss.insertSheet();
    settingSheet.setName(settingData.sheetName);
    settingSheet.getRange("A1").setValue(settingData.headers);
    settingSheet.getRange(settingData.fileDataRange).setValue(JSON.stringify([]));
  } else console.log("Settingシートは既に作成されています");

  /* markdownシートの存在チェック、なければ作成 */
  if (_isExistSheet(ss, markdownData.sheetName)) {
    const markdownSheet = ss.insertSheet();
    markdownSheet.setName(markdownData.sheetName);
    markdownSheet.getRange(1, 1, 1, markdownData.headers.length).setValues([markdownData.headers]);
  } else console.log("markdownシートは既に作成されています");
};


/**
 * Settingシートからファイル構造を取り出す
 */
global.getFileStructureData = () => {
  const { sheetId, settingData } = config;
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(settingData.sheetName);
  const data = sheet.getRange(settingData.fileDataRange).getValue();
  console.log(data);
  return { data };
};
/**
 * ファイル構造をセットする
 * ファイルを作成したら新規ファイルをセット
 */
global.setFileStructureData = (e) => {
  console.log(e[0]);
  const { isCreate, data, type, uid, uids } = e[0];
  const { sheetId, settingData, markdownData } = config;
  const ss = SpreadsheetApp.openById(sheetId);
  const settingSheet = ss.getSheetByName(settingData.sheetName);
  settingSheet.getRange(settingData.fileDataRange).setValue(data);
  if (type === "file" || (type === "foldar" && !isCreate)) {
    const markdownSheet = ss.getSheetByName(markdownData.sheetName);
    if (isCreate) {
      console.log("create events");
      const lastRow = markdownSheet.getLastRow() + 1;
      console.log(`create Row ${lastRow}`);
      markdownSheet.getRange(`A${lastRow}:B${lastRow}`).setValues([[uid, ""]]);
    } else {
      console.log("delete events");
      uids.map((uid) => {
        const removeRow =
          markdownSheet
            .getRange(`A:A`)
            .getValues()
            .map((row) => row[0])
            .findIndex((row) => row === uid) + 1;
        console.log(`remove Row ${removeRow}`);
        markdownSheet.deleteRow(removeRow);
      });
    }
  }
  return { status: "success" };
};

/**
 * Markdownデータを取得する
 */
global.getMarkdownText = (e) => {
  const { uid } = e[0];
  const { sheetId, markdownData } = config;
  console.log(e[0]);
  const ss = SpreadsheetApp.openById(sheetId);
  const markdownSheet = ss.getSheetByName(markdownData.sheetName);
  const data = markdownSheet.getRange(`A:B`).getValues()
  const markdownRow = data.findIndex((row) => row[0] === uid);
  console.log(data);
  console.log(markdownRow);
  console.log(data[markdownRow]);
  return { value: data[markdownRow][1] };
};
/**
 * Markdownデータを格納する
 */
global.setMarkdownText = (e) => {
  const { uid, value } = e[0];
  const { sheetId, markdownData } = config;
  const ss = SpreadsheetApp.openById(sheetId);
  const markdownSheet = ss.getSheetByName(markdownData.sheetName);
  const markdownRow =
    markdownSheet
      .getRange(`A:A`)
      .getValues()
      .findIndex((row) => row[0] === uid) + 1;
  markdownSheet.getRange(`B${markdownRow}`).setValue(value);
  return { status: "success" };
};
