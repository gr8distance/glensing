# gargantua — ページ要件仕様書

gargantuaはCommon Lispのパッケージレジストリ。area51（CLのパッケージマネージャ）と連携して動作する。
本ドキュメントはgargantuaに必要なページをフェーズ別に定義する。

参考実装: [rubygems.org](https://rubygems.org), [hex.pm](https://hex.pm)

---

## Phase 1 — MVP（公開前に必要）

### 1. パッケージ詳細ページ

- **パス**: `/packages/:name`
- **概要**: レジストリの核。ユーザーが「このパッケージは何か」を知る場所。
- **表示項目**:
  - パッケージ名
  - description
  - インストールコマンド（`area51 install <name>` のコピーボタン付き）
  - GitHubリポジトリへのリンク
  - ライセンス表示
  - 依存パッケージ一覧（各パッケージの詳細ページへのリンク付き）
  - 逆依存一覧（このパッケージに依存しているパッケージ）
- **参考**: rubygems.org/gems/rails, hex.pm/packages/phoenix

### 2. area51 紹介ページ

- **パス**: `/area51`
- **概要**: area51とは何か、gargantuaとの関係を説明する専用ページ。CLの新規参入者がまず読む場所。
- **表示項目**:
  - area51の概要と位置づけ（Common LispにおけるBundler的存在）
  - インストール手順
  - 基本コマンド一覧（`init` / `install` / `search`）
  - gargantua ↔ area51 の関係図（gargantuaがレジストリ=宇宙空間、area51がローカル=地球）
  - GitHubリポジトリへのリンク

### 3. 検索結果ページ

- **パス**: `/packages?search=<query>`
- **概要**: 独立URLで検索結果を返す。area51 CLIの `area51 search` からこのURLを参照可能にする。
- **表示項目**:
  - 検索クエリの表示
  - マッチしたパッケージ一覧（名前 + description）
  - 各パッケージの詳細ページへのリンク
  - 検索結果件数
- **参考**: rubygems.org/search, hex.pm/packages?search=

### 4. ドキュメントページ

- **パス**: `/docs`
- **概要**: area51 + gargantuaの使い方ガイド。トップページのQuick Startの拡張版。
- **内容**:
  - area51のインストール手順
  - パッケージの検索と追加方法
  - プロジェクトの初期化（`area51 init`）
  - 設定ファイル（`~/.area51/config.lisp`）の説明
- **参考**: guides.rubygems.org, hex.pm/docs

---

## Phase 2 — publish機能と同時

### 5. バージョン履歴

- **パス**: パッケージ詳細ページ内セクション（`/packages/:name` に含める）
- **概要**: パッケージの全バージョン一覧をリリース日付付きで表示。
- **参考**: rubygems.orgのサイドバー, hex.pmのバージョンドロップダウン

### 6. APIドキュメント

- **パス**: `/docs/api`
- **概要**: area51 CLIが叩くgargantuaのAPIエンドポイント仕様。
- **内容**:
  - パッケージ検索エンドポイント
  - パッケージ情報取得エンドポイント
  - レスポンスフォーマット（JSON）
- **参考**: hex.pm/docs/api

### 7. publishガイド（area51 publishコマンド実装後）

- **パス**: `/docs/publish`
- **概要**: `area51 publish` の手順解説。
- **内容**:
  - `.asd` ファイルからのメタデータ抽出方法
  - gargantuaのAPIキー取得手順
  - publishコマンドの実行例
- **参考**: guides.rubygems.org/make-your-own-gem, hex.pm/docs/publish
- **備考**: area51にpublishコマンドが未実装のため、実装完了後に着手する。

---

## Phase 3 — コミュニティ拡大後

### 8. カテゴリ・タグページ

- **パス**: `/packages?tag=<tag>`
- **概要**: パッケージをカテゴリでフィルタする。パッケージ数が100を超えた段階で有効になる。
- **想定タグ**: web / crypto / testing / utilities

### 9. 統計ページ

- **パス**: `/stats`
- **概要**: エコシステムの成長を可視化する。
- **表示項目**: 総パッケージ数、総ダウンロード数、新着パッケージ

### 10. ユーザープロファイル

- **パス**: `/users/:name`
- **概要**: パッケージ著者ページ。複数の著者がpublishし始めたら必要。

---

## 明確に不要

| ページ | 理由 |
|--------|------|
| ユーザー登録 Web UI | GitHub認証でCLI側だけで完結。Web UIは不要。 |
| コメント・レビュー機能 | CLの規模で実装しても過疎になるだけ。GitHub Issuesで十分。 |
| プライベートパッケージ / Organization | Hex.pmの収益源だが、gargantuaには時期尚早。 |

---

## 技術スタック（参考）

- **フレームワーク**: Astro
- **ホスティング**: Cloudflare Workers + D1
- **フロント**: 静的ページ + クライアントサイドJSON検索
- **データ永続化**: D1（publish機能実装時）
