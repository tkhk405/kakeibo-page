// ===== 設定 =====
// localStorage に保存するときのキー（引き出しのラベル）
const STORAGE_KEY = "kakeibo-entries";

// ===== HTML の要素を取得する =====
const entryForm = document.querySelector("#entry-form");
const dateInput = document.querySelector("#date");
const itemInput = document.querySelector("#item");
const amountInput = document.querySelector("#amount");
const totalOutput = document.querySelector("#total");
const entryList = document.querySelector("#entry-list");

// ===== データ本体 =====
// 記録（オブジェクト）を並べた配列。ページを開いたときに localStorage から読み込む
const entries = loadEntries();

// ===== localStorage とのやり取り =====

// 読み込む：localStorage の文字列 → 配列
function loadEntries() {
  const savedText = localStorage.getItem(STORAGE_KEY);

  // 初めて開いたときは何も保存されていない（null）ので、空の配列から始める
  if (savedText === null) {
    return [];
  }

  return JSON.parse(savedText);
}

// 保存する：配列 → localStorage の文字列
function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ===== 画面の表示 =====

// 種類（英語の値）を、表に出す日本語に置き換える
function typeLabel(type) {
  if (type === "income") {
    return "収入";
  }
  return "支出";
}

// 表のセル（<td>）を1つ作る
function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

// 一覧を表示する：配列 → <tbody id="entry-list">
function renderList() {
  // いったん空にする（空にしないと、追加のたびに行が重複する）
  entryList.innerHTML = "";

  for (const entry of entries) {
    const row = document.createElement("tr");
    row.appendChild(createCell(entry.date));
    row.appendChild(createCell(entry.item));
    row.appendChild(createCell(typeLabel(entry.type)));
    row.appendChild(createCell(entry.amount.toLocaleString("ja-JP")));
    entryList.appendChild(row);
  }
}

// 合計を計算する：配列 → 数値（収入 − 支出）
function calculateTotal() {
  let total = 0;

  for (const entry of entries) {
    if (entry.type === "income") {
      total += entry.amount; // 収入は足す
    } else {
      total -= entry.amount; // 支出は引く
    }
  }

  return total;
}

// 合計を表示する：数値 → <output id="total">
function renderTotal() {
  totalOutput.textContent = calculateTotal().toLocaleString("ja-JP");
}

// ===== フォーム送信時 =====
entryForm.addEventListener("submit", (event) => {
  // 送信によるページの再読み込みを止める
  event.preventDefault();

  // 種類は「name が type で、いま選ばれているラジオボタン」から取り出す
  const typeInput = document.querySelector('input[name="type"]:checked');

  // 1件分の記録を作る
  const entry = {
    date: dateInput.value,
    item: itemInput.value.trim(),
    type: typeInput.value,
    amount: Number(amountInput.value), // 入力欄の値は文字列なので、数値に変換する
  };

  // 品目が空白だけのときは登録しない
  if (entry.item === "") {
    itemInput.focus();
    return;
  }

  // 配列を更新 → 保存 → 表示し直す
  entries.push(entry);
  saveEntries();
  renderList();
  renderTotal();

  // フォームを初期状態に戻す
  entryForm.reset();
});

// ===== ページ読み込み時 =====
renderList();
renderTotal();
