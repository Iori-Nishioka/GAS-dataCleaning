# GAS×clasp ワークフロー土台

> 目的: Google Apps Script(GAS)のコードをローカルで管理して、`npm`版claspで push / pull するための手順メモ
---

## 0. 前提

- Node.js / npm が動く環境があること
    
- Googleアカウントを用意済み
    
- GAS プロジェクトを作成する or これから作成する
---

## 1. clasp のセットアップ

### 1-1. プロジェクトフォルダを用意する(ローカル)

```bash
mkdir gas-project
cd gas-project
npm init -y
```

### 1-2. clasp をインストール

- グローバル(PC全体)
    

```bash
npm install -g @google/clasp
```

- ローカル(このプロジェクトだけ)
    

```bash
npm install -D @google/clasp
```

### 1-3. Googleログイン

```bash
npx clasp login
```

- ブラウザが開くので、GASで使うGoogleアカウントを許可する
    

> メモ: 会社アカウント / 個人アカウントが複数ある場合は、どのアカウントに紐づくかをここで決める。

---

## 2. GASプロジェクトとローカルをひも付ける

### パターンA: 既存のGASプロジェクトをcloneする場合

```bash
npx clasp clone <scriptId>
```

- `scriptId` はGASの画面(エディタ右上の「プロジェクト設定」など)で確認できるID
    
- 成功すると `.clasp.json` などの設定ファイルと `Code.gs` 等がローカルに落ちてくる
    

### パターンB: 新規でGASプロジェクトを作る場合

```bash
npx clasp create --type standalone --title "プロジェクト名"
```

- これで新しいGASプロジェクトがGoogle側に作られ、`scriptId`と`.clasp.json`がローカルに生成される
    
- `--type` は `standalone` (単体スクリプト) / `webapp` / `docs` / `sheets` など
    

> この段階でローカルとGASが1対1対応する。

---

## 3. ディレクトリ構成(例)

```text
gas-project/
  ├─ .clasp.json        # GAS側との紐づけ情報(scriptIdなど)
  ├─ .claspignore       # pushしないファイルを指定(後で書く)
  ├─ package.json       # npm管理ファイル
  ├─ src/
  │    ├─ main.gs       # メインのGASコード
  │    └─ utils.gs      # ヘルパー関数
  └─ dist/              # ビルド後ファイル(必要なら)
```

- 素のGASであれば `.gs` / `.ts` / `.js` をそのままpushできる
    
- TypeScript構成にする場合は `clasp` + `tsc` で `dist` をpush などの運用もできる
    

---

## 4. pull(＝サーバ側→ローカルに反映)

> すでにGoogle側に最新コードがあって、それをローカルに落としたいとき

```bash
 npx clasp pull
```

- GAS上のファイルがローカルに同期される
    
- 衝突防止: ローカルで未コミットの変更がある場合は上書きに注意
    

---

## 5. push(＝ローカル→サーバ側に反映)

> ローカルで編集した`.gs`や`.ts`などを、GAS本体にアップロードするとき

```bash
npx clasp push
```

- これでGASエディタ側のコードが更新される
    
- `-f` をつけると force push (問答無用で上書き)。基本は使いすぎないこと。
    

---

## 6. よく使う補足コマンド

### 6-1. プロジェクト情報の確認

```bash
npx clasp status
```

- ローカルとGAS側の差分を表示してくれる
    

### 6-2. バージョン発行 (デプロイ用のスナップショット)

```bash
npx clasp version "v1 初回リリース"
```

- GASの「バージョン履歴」に記録されるコメント付きタグを作れる
    

---

## 7. .clasp.json のイメージ

```json
{
  "scriptId": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "rootDir": "src"
}
```

- `scriptId`: このローカルがどのGASプロジェクトとひも付いているか
    
- `rootDir`: `clasp push` や `clasp pull` の対象ディレクトリ(例では `src/`)
    

---

## 8. .claspignore のイメージ

```text
# node_modules や ローカルだけのものはpushしない
node_modules/
.git/
.dist/
README.md
```

- `.gitignore` と似たイメージ
    
- `clasp push`時に除外するものを書く
    

---

## 9. よくあるトラブル(下書き)

- `TypeError: Failed to fetch` 系
    
    - ログインしていない / 権限の違うGoogleアカウントになってる
        
    - プロキシ/社内ネットワークでブロックされてる
        
- `Unknown command "clasp open"` みたいなエラー
    
    - `clasp` のバージョンが古い / `npx` 経由になってる / パスの衝突など
        
    - グローバルとローカルの2個インストールで食い違ってる
        
 