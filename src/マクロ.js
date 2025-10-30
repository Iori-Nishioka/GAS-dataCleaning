function cleanInboundSheet() {
  // ▼▼▼ 設定項目 ▼▼▼
  const SHEET_NAME = 'インバウンド';      // 対象のシート名

  const COLUMN_A_NUMBER = 12;        // 比較する列Lの列番
  const COLUMN_B_NUMBER =13;        // 基準にする列Mの列番号

  const CHECK_COLUMN_1_NUMBER = 28;  // 新しい比較を行うAB列
  const CHECK_AND_CLEAR_COLUMN_2_NUMBER = 29; // 新しい比較を行い、値を削除する可能性があるAC列

  const ACCOMMODATION_COLUMN_NUMBER = 10; // 宿泊先データJ列

  const ACCOMPANY_COUNT_COLUMN = 19; // 同行人数が入っている列 (S列)
  const ACCOMPANY_PERSON_COLUMN = 20; // 同行者情報が入り、「その他」を追記する列 (T列)

  const START_ROW = 2;              // 処理を開始する行 (ヘッダー行を除く場合は2)
  // ▲▲▲ 設定はここまで ▲▲▲

  // --- 処理本体 ---
  //シートの存在確認
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert(`シート「${SHEET_NAME}」が見つかりません。`);
    return;
  }


  const range = sheet.getRange(START_ROW, 1, sheet.getLastRow() - START_ROW + 1, sheet.getLastColumn());
  const values = range.getValues();

  // 列番号を配列のインデックスに変換 (例: 1列目 -> 0番目)
  const indexA = COLUMN_A_NUMBER - 1;
  const indexB = COLUMN_B_NUMBER - 1;
  const indexCheck1 = CHECK_COLUMN_1_NUMBER - 1;
  const indexClear2 = CHECK_AND_CLEAR_COLUMN_2_NUMBER - 1;
  const accommodationIndex = ACCOMMODATION_COLUMN_NUMBER - 1; // 宿泊先列 (J列)
  const sourceIndex = ACCOMMODATION_COLUMN_NUMBER - 2;        // コピー元の左隣の列 (I列)
  const targetIndex = ACCOMMODATION_COLUMN_NUMBER;            // コピー先の右隣の列 (K列)
  const indexAccompanyCount = ACCOMPANY_COUNT_COLUMN - 1;
  const indexAccompanyPerson = ACCOMPANY_PERSON_COLUMN - 1;

  for (let i = 0; i < values.length; i++) {
    const valueA = values[i][indexA];
    const valueB = values[i][indexB];

    // 両方のセルが数値の場合のみ比較
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      // 条件：A列がB列より大きい場合
      if (valueA < valueB) {
        values[i][indexA] = valueB; // A列の値をB列の値で上書き
      }
    }
    // 空白、０の時は「初めて」を入れる
    // B列の値をチェック
    const currentValB = values[i][indexB];
    if (currentValB === '' || currentValB == 0) {
      values[i][indexB] = '初めて';
    }

    // 両方に値があった場合二つ目を削除
    const valueCheck1 = values[i][indexCheck1];
    const valueClear2 = values[i][indexClear2];
    
    if (valueCheck1 != 0) {
      if (valueCheck1 !== '' && valueClear2 !== '') {
        values[i][indexClear2] = ''; // チェック列2の値を削除（空白にする）
      }
    }

    const accommodationCell = values[i][accommodationIndex]; // 宿泊先セルの値 (J列)
    const targetCell = values[i][targetIndex];               // 右隣のセルの値 (K列)

    // 条件1：「宿泊先」セルが文字列であること
    if (typeof accommodationCell === 'string') {

      // 条件2：「福岡市」を含み、かつ「（福岡市以外）」を含まないこと
      const isStayInFukuoka = accommodationCell.includes('福岡市') && (accommodationCell !== '福岡県（福岡市以外）');

      // 条件3：右隣のセルの値が数値の0であること
      const isTargetZero = (targetCell === 0);

      // 上記の条件をすべて満たした場合
      if (isStayInFukuoka && isTargetZero) {
        const sourceValue = values[i][sourceIndex]; // 左隣のセルの値を取得 (I列)
        values[i][targetIndex] = sourceValue;     // 右隣のセルに、左隣の値を上書き (K列)
      }
    }

    const accompanyCount = values[i][indexAccompanyCount];   // 19列目の値
    const accompanyPerson = values[i][indexAccompanyPerson]; // 20列目の値

    // 条件：19列目が2以上、かつ、20列目が空白の場合
    if (accompanyCount >= 2 && accompanyPerson === '') {
      values[i][indexAccompanyPerson] = 'その他'; // 20列目に「その他」を書き込む
    }
  }

  // 変更後の配列をシートに一括で書き込む
  range.setValues(values);
  SpreadsheetApp.getUi().alert('処理が完了しました。');
}

/**
 * 国内シート用のデータクリーニング関数
 */
function cleanDomesticSheet_Final() {
  // ▼▼▼ 設定項目 ▼▼▼
  const SHEET_NAME = '国内';      // 対象のシート名（ご自身のシート名に合わせて修正してください）
  const START_ROW = 2;              // 処理を開始する行 (ヘッダー行を除く場合は2)

  // --- 列番号の設定 ---
  const COLUMN_11 = 11;
  const COLUMN_12 = 12;
  const COLUMN_13_OTHERS = 13;
  const COLUMN_15_COUNT = 15;
  const COLUMN_16_PERSON = 16;
  const COLUMN_23 = 23;
  const COLUMN_24 = 24;
  const COLUMN_29 = 29;
  const COLUMN_31 = 31;
  // ▲▲▲ 設定はここまで ▲▲▲

  // --- 処理本体 ---
  const touristSpots = [
    "博多駅周辺", "キャナルシティ周辺", "ベイサイドプレイス博多・博多港周辺", "中州川端地区",
    "天神地区", "福岡タワー", "ペイペイドーム", "姪浜周辺", "ららぽーと", "映画やドラマのロケ地",
    "志賀島", "海の中道海浜公園（マリンワールド）", "大濠公園", "福岡市動植物園",
    "シーサイドももち海浜公園（福岡タワー）", "能古島", "筥崎宮", "櫛田神社", "東長寺",
    "鴻臚館跡・福岡城跡", "元寇防塁", "博多町家ふるさと館", "はかた伝統工芸館",
    "福岡アジア美術館", "福岡市博物館", "福岡市科学館", "福岡市美術館", "博多座",
    "マリンメッセ福岡", "福岡国際センター", "福岡サンパレス", "福岡国際会議場"
  ];

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert(`シート「${SHEET_NAME}」が見つかりません。`);
    return;
  }

  const range = sheet.getRange(START_ROW, 1, sheet.getLastRow() - START_ROW + 1, sheet.getLastColumn());
  const values = range.getValues();

  // --- インデックス定義 ---
  const index11 = COLUMN_11 - 1;
  const index12 = COLUMN_12 - 1;
  const index13 = COLUMN_13_OTHERS - 1;
  const index15 = COLUMN_15_COUNT - 1;
  const index16 = COLUMN_16_PERSON - 1;
  const index23 = COLUMN_23 - 1;
  const index24 = COLUMN_24 - 1;
  const index29 = COLUMN_29 - 1;
  const index31 = COLUMN_31 - 1;

  for (let i = 0; i < values.length; i++) {
    
    // ---【条件1】(変更なし) ---
    if (values[i][index11] >= 2 && values[i][index12] === '') {
      values[i][index12] = 'その他';
    }

    // ---【条件2】13行目の「その他」の回答を整理 ---
    let otherText = values[i][index13];
    // ▼▼▼ ここを修正しました ▼▼▼
    // 条件：文字列であり、かつ「その他(」または「その他（」で始まり、かつ「)」または「）」で終わる
    if (typeof otherText === 'string' && 
        (otherText.startsWith('その他(') || otherText.startsWith('その他（')) &&
        (otherText.endsWith(')') || otherText.endsWith('）'))) {
      
      // 処理の前に、半角カッコをすべて全角カッコに統一してしまう
      otherText = otherText.replace('(', '（').replace(')', '）');
      
      // これ以降は、すべて全角カッコとして扱えるので、元のロジックがそのまま使える
      const content = otherText.substring(4, otherText.length - 1);
      // ▲▲▲ 修正はここまで ▲▲▲
      
      const normalizedContent = content.replace(/[、, 　]+/g, ',');
      const items = [...new Set(normalizedContent.split(',').map(item => item.trim()).filter(item => item))];

      const matchedSpots = [];
      const unmatchedSpots = [];

      items.forEach(item => {
        if (touristSpots.includes(item)) {
          matchedSpots.push(item);
        } else {
          unmatchedSpots.push(item);
        }
      });
      
      const finalResult = [...matchedSpots];
      if (unmatchedSpots.length > 0) {
        finalResult.push(`その他（${unmatchedSpots.join('、')}）`);
      }
      
      values[i][index13] = finalResult.join(',');
    }

    // ---【条件3, 4, 5】(変更なし) ---
    if (values[i][index15] >= 2 && values[i][index16] === '') {
      values[i][index16] = 'その他';
    }

    const val23 = values[i][index23];
    const val24 = values[i][index24];
    if (typeof val23 === 'number' && val23 !== 0 && typeof val24 === 'number' && val24 !== 0) {
      values[i][index24] = '';
    }

    if (String(values[i][index29]).trim().length === 1) {
      values[i][index29] = '';
    }
    if (String(values[i][index31]).trim().length === 1) {
      values[i][index31] = '';
    }
  }

  range.setValues(values);
  Logger.log(`シート「${SHEET_NAME}」のデータクリーニングが完了しました。`);
}