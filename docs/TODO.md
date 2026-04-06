# TODO

## glensing

- [ ] MCP (Model Context Protocol) サーバーを追加
  - Claude や他の生成AIからパッケージ検索・詳細取得ができるようにする
  - `search_packages`, `get_package_detail`, `list_dependencies` などのツールを提供
  - area51 と組み合わせて AI がパッケージの選定からインストールまで一気通貫でできる体験

## area51

- [ ] 生成AIネイティブな CLI 設計
  - `area51 -h` で一発で使い方が理解できるヘルプ出力
  - サブコマンドごとに明確な説明と使用例
  - JSON 出力オプション（`--json`）で AI が解析しやすい構造化出力
  - エラーメッセージも AI が次のアクションを判断できる明瞭さ
- [ ] area51 用の MCP ツールも検討
  - Claude Code から直接 `area51 add`, `area51 install` を実行できるフロー

## 共通方針

生成AIネイティブなツールとして設計する。人間が使いやすいのは当然として、AIが読んで即座に使えることを前提にする。これからの時代、ツールのユーザーは人間だけではない。

## パッケージデータ拡充

- [ ] Quicklisp tarball から `.asd` の `:description` を抽出してパッケージ説明を拡充
  - 現在 desc があるのは 54/2382 パッケージのみ（GitHub KNOWN_REPOS 分だけ）
  - releases.txt の tarball URL → ダウンロード → .asd パース → :description 取得
  - GitHub repo description よりも .asd の方が作者の公式説明で正確
- [ ] D1 + API 復活でパッケージメタデータを動的管理
  - MCP サーバーがパッケージ検索する前提として desc の充実が必須
