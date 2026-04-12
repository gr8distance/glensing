export const ja = {
  // Nav & Layout
  nav: {
    packages: "パッケージ",
    area51: "area51",
    docs: "ドキュメント",
  },
  footer: {
    description: "Common Lisp パッケージレジストリ",
    powered: "Powered by",
  },
  langSwitch: "EN",

  // Top page
  top: {
    tagline: "Common Lisp Package Registry & Scope",
    search: "パッケージを検索...",
    stats: (count: number) => `${count} 個のパッケージが軌道上に`,
    what: {
      title: "Gravity Lensing とは？",
      desc: 'Common Lisp のパッケージレジストリです。パッケージを検索・閲覧し、<strong>area51</strong> でローカルにインストールできます。',
    },
    flow: {
      registry: "パッケージレジストリ",
    },
    quickstart: "クイックスタート",
    packages: "軌道上のパッケージ",
    link: {
      area51: { desc: "Common Lisp パッケージマネージャ" },
      docs: { label: "ドキュメント", desc: "はじめかたガイド" },
      packages: { label: "全パッケージ", desc: "レジストリを閲覧・検索" },
    },
    tooltip: {
      earth: "地球 \u2014 area51",
      earthDesc: "クリックして地上局を探索",
    },
    pkg: {
      add: "プロジェクトに追加",
      note: "area51.lisp と .asd が自動更新されます。",
      install: "インストール",
    },
    a51: {
      subtitle: "Common Lisp パッケージマネージャ",
      add: "パッケージを追加",
      addDesc: "<strong>glensing</strong> から取得してローカルにインストールします。",
      how: "仕組み",
      registry: "レジストリ",
      local: "あなたのマシン",
      quickstart: "クイックスタート",
      config: "設定",
    },
    copy: "コピー",
    copied: "コピーしました！",
    commentInstall: "# area51 をインストール",
    commentNew: "# 新しいプロジェクトを作成",
    commentAdd: "# パッケージを追加",
    commentDownload: "# 依存関係をダウンロード",
  },

  // Search results
  search: {
    placeholder: "パッケージを検索...",
    count: (count: number) => `${count} 件のパッケージが見つかりました`,
    resultsFor: (count: number, query: string) => `"${query}" の検索結果: ${count}件`,
    emptyTitle: (query: string) => `"${query}" に一致するパッケージが見つかりません`,
    emptyHint: "スペルを確認するか、より広いキーワードを試すか、",
    emptyBrowse: (count: number) => `全 ${count} パッケージを閲覧`,
    sortRelevance: "関連度順",
    sortMostUsed: "利用数順",
    sortNameAsc: "名前 (A\u2192Z)",
    sortNameDesc: "名前 (Z\u2192A)",
    usedBy: (count: number) => `${count} 件が利用`,
  },

  // Package detail
  pkg: {
    usage: "使い方",
    deps: "依存関係",
    usedBy: "利用しているパッケージ",
    links: "リンク",
    source: "ソースリポジトリ",
    copyTooltip: "クリックでコピー",
    copy: "コピー",
    copied: "コピーしました！",
    usageComment1: ";; area51 add で .asd が自動更新されます。",
    usageComment2: ";; コード内でパッケージを使用:",
  },

  // area51 page
  a51: {
    subtitle: "Common Lisp パッケージマネージャ",
    what: {
      title: "area51 とは？",
      desc: "Common Lisp 用のパッケージマネージャです。Ruby の Bundler、Rust の Cargo、JavaScript の npm に相当します。依存関係の解決、バージョンのロック、再現可能なビルドを実現します。",
    },
    how: "仕組み",
    registry: "レジストリ",
    local: "あなたのマシン",
    installation: "インストール",
    commands: "コマンド",
    cmd: {
      newDesc: "新しいプロジェクトを作成。",
      addDesc: "依存関係を追加。",
      installDesc: "すべての依存関係を解決しダウンロード。",
      buildDesc: "ビルド、実行、テスト。",
    },
    config: "設定",
    configDesc: "area51 はキャッシュを以下に保存します：",
    treeDownloaded: "ダウンロード済みパッケージ",
    treeCachedIndex: "キャッシュ済み Quicklisp インデックス",
    source: "ソースコード",
    github: "GitHub で見る",
  },

  // Docs page
  docs: {
    label: "ドキュメント",
    title: "はじめかた",
    subtitle: "Gravity Lensing と area51 パッケージマネージャを使って Common Lisp プロジェクトを始めるために必要なすべて。",
    prerequisites: {
      title: "前提条件",
      text: "area51 をインストールする前に、動作する Common Lisp 処理系が必要です。パフォーマンスと幅広い互換性から <strong>SBCL</strong>（Steel Bank Common Lisp）を推奨しますが、準拠する処理系であればどれでも使えます。",
      sbcl: "推奨、ほとんどのプラットフォームで利用可能",
      ccl: "ネイティブスレッド対応の優れた選択肢",
      ecl: "C にコンパイル、組み込み向け",
      abcl: "JVM 上で動作",
      verify: "次のコマンドでインストールを確認してください：",
    },
    install: {
      title: "area51 のインストール",
      text: "area51 はランタイム依存なしの単一バイナリです。1つのコマンドでインストールできます：",
      path: '<code>area51</code> バイナリが <code>~/.local/bin</code> にインストールされます。<code>PATH</code> に含まれていることを確認してください。インストールの確認：',
    },
    create: {
      title: "プロジェクトの作成",
      text: "<code>area51 new</code> で新しい Common Lisp プロジェクトを作成します。開発に必要な標準的なプロジェクト構造が生成されます。",
      structure: "生成される構造：",
      manifest: "プロジェクトマニフェスト",
      asd: "ASDF システム定義",
      packageLisp: "パッケージ定義",
      mainLisp: "エントリーポイント",
      items: {
        area51Lisp: "プロジェクトマニフェスト。依存関係とメタデータを宣言。",
        asd: "ASDF システム定義。<code>area51 add</code> / <code>remove</code> で自動更新。",
        packageLisp: "パッケージシンボルを定義・エクスポート。",
        mainLisp: "アプリケーションコードの開始点。",
      },
    },
    adding: {
      title: "パッケージの追加",
      text: "<code>area51 add</code> でパッケージを追加します。<code>area51.lisp</code> マニフェストと <code>.asd</code> システム定義の両方が自動更新されます。",
      install: "次に <code>area51 install</code> を実行して、すべての依存関係を解決しダウンロードします：",
      lock: "<code>area51.lock</code> ファイルが生成され、再現可能なビルドのために正確なバージョンが固定されます。ソースファイルでパッケージを使用できます：",
      packageLispNote: "<code>area51 add</code> は <code>area51.lisp</code> と <code>.asd</code> を更新しますが、<code>src/package.lisp</code> は意図的に<strong>触りません</strong>。シンボルをパッケージに取り込む方法は好みが分かれるので、area51 はユーザーに任せる設計です。代表的な書き方をいくつか紹介します：",
      importFromHeading: "import-from",
      importFromDesc: "明示的で、現代の Common Lisp コードで最も一般的なスタイルです。どのシンボルがどのパッケージ由来か、コードを読む人が一目で把握できます。",
      localNicknamesHeading: "local-nicknames",
      localNicknamesDesc: "完全修飾のまま使いつつ、長いパッケージ名を毎回書く手間を減らします。",
      useHeading: "use",
      useDesc: "エクスポートされた全シンボルを取り込みます。<code>arrows</code> や <code>iterate</code> のように、シンボルが構文のように読める DSL 系ライブラリと相性が良いですが、alexandria のような巨大ユーティリティに対しては避けるのが無難です（ライブラリ拡張時にシンボル衝突が気付かないうちに起きやすい）。",
      qualifiedDesc: "あるいは <code>package.lisp</code> を触らず、コード内で完全修飾シンボルをそのまま使うのもアリです：<code>(alexandria:iota 5)</code>。",
    },
    sly: {
      title: "SLY/SLIME でのインタラクティブ開発",
      text: "<code>area51 repl</code> は、プロジェクトをロード済みで <code>*package*</code> もプロジェクトパッケージに切り替えた状態の <a href=\"https://github.com/joaotavora/sly\" target=\"_blank\" rel=\"noreferrer\">slynk</a> サーバを起動します。Emacs から <code>M-x sly-connect</code> で繋ぐと、プロジェクトにスコープされた REPL がそのまま使えます。Emacs 側での <code>.sbclrc</code> や <code>.dir-locals.el</code> 設定は不要です。",
      startText: "プロジェクトディレクトリから REPL サーバを起動します：",
      connectText: "次に Emacs で：",
      connectCmd: "M-x sly-connect RET 127.0.0.1 RET 4005 RET",
      features: "REPL は最初からプロジェクトのパッケージで開くので、<code>(main)</code> やエクスポートされた関数をすぐに裸で呼び出せます。",
      portItem: "<code>--port N</code> で 4005 以外のポートも指定できます。",
      stopItem: "<strong>Ctrl-C</strong> で綺麗にシャットダウンしてポートを解放するので、そのまま再起動できます。",
      isolationItem: "<strong>プロジェクトごとの分離</strong>: 実行中の sbcl からは、そのプロジェクトの <code>area51.lock</code> に載っている依存だけが ASDF から見えます（<code>area51 run</code> と同じ分離）。",
      slynkNote: "slynk は起動時に ASDF 経由でロードされます。マシンにインストールされていない場合（SLY 同梱が一般的ですが <code>(ql:quickload :slynk)</code> でも OK）、ハングする代わりに一行のエラーで終了します。",
    },
    browsing: {
      title: "パッケージの閲覧",
      text: "Web でパッケージを閲覧・検索できます：",
      installed: "現在のプロジェクトにインストールされているものを確認するには：",
    },
    configTitle: "設定",
    configText: "area51 は設定とキャッシュをホームディレクトリに保存します。",
    configCache: "パッケージは一度ダウンロードされるとここにキャッシュされます。Quicklisp インデックスは24時間ごとに自動更新されます。<code>area51 clean</code> でキャッシュ全体をクリアできます。",
    treeDownloaded: "ダウンロード済みパッケージ",
    treeCachedIndex: "キャッシュ済み Quicklisp インデックス",
    commands: {
      title: "コマンドリファレンス",
      text: "area51 の全コマンド一覧。",
      command: "コマンド",
      description: "説明",
      newDesc: "新しい Common Lisp プロジェクトを作成",
      addDesc: "area51.lisp と .asd に依存関係を追加",
      removeDesc: "プロジェクトから依存関係を削除",
      installDesc: "すべての依存関係を解決しダウンロード、ロックファイルを生成",
      listDesc: "宣言済み依存関係とそのステータスを一覧表示",
      buildDesc: "プロジェクトをスタンドアロンバイナリにビルド",
      runDesc: "プロジェクトのエントリーポイントをロードして実行",
      testDesc: "プロジェクトのテストスイートを実行",
      replDesc: "SLY/SLIME 接続用の slynk サーバを起動",
      cleanDesc: "パッケージキャッシュ (~/.area51/) をクリア",
      upgradeDesc: "area51 自体を最新バージョンに更新",
    },
  },

  // About page
  about: {
    label: "概要",
    title: "Gravity Lensing について",
    subtitle: "Common Lisp のパッケージレジストリとエコシステム。",
    whatGargantua: {
      title: "Gravity Lensing とは？",
      desc: "Gravity Lensing は Common Lisp のパッケージレジストリです。Quicklisp エコシステムのパッケージをインデックスし、検索・閲覧可能なインターフェースで提供します。Common Lisp ライブラリが軌道を周回する中央ハブであり、あなたのプロジェクトに取り込む準備ができています。",
    },
    whatArea51: {
      title: "area51 とは？",
      desc: "area51 は Common Lisp のコマンドラインパッケージマネージャです。依存関係の解決、バージョンのロック、プロジェクトのパッケージをローカルで管理します。Gravity Lensing が空のレジストリなら、area51 はあなたのマシン上の地上局です。",
    },
    relationship: {
      title: "連携の仕組み",
      desc: "Gravity Lensing はパッケージをホスティングしインデックスします。area51 は glensing に問い合わせてパッケージを検索、ダウンロード、管理します。Gravity Lensing で検索・閲覧し、area51 でインストール・ビルドします。",
      registry: "パッケージレジストリ",
      cli: "CLI パッケージマネージャ",
      browse: "閲覧・検索",
      install: "インストール・管理",
    },
    name: {
      title: "なぜ「Gravity Lensing」？",
      desc: "「Gravity Lensing」は重力レンズ（gravitational lensing）に由来します。ブラックホールの重力が光を曲げてその向こうにあるものを映し出すのです。そして現代の多くのプログラミング言語は Lisp に影響を受けています。Lisp は重力そのものです。偉大な Lisp Alien たちが生み出した素晴らしいライブラリは Lisp の重力圏を周回しています。重力レンズを通して Common Lisp のパッケージを見つけ出せるようにと命名しました。",
    },
    openSource: {
      title: "オープンソース",
      desc: "Gravity Lensing と area51 はどちらもオープンソースです。パッケージデータは Quicklisp から取得しています。コントリビューション歓迎です。",
    },
    gargantuaRepo: "glensing を GitHub で見る",
    area51Repo: "area51 を GitHub で見る",
  },

  // FAQ page
  faq: {
    label: "FAQ",
    title: "よくある質問",
    subtitle: "Gravity Lensing と area51 に関するよくある質問。",
    items: [
      {
        q: "glensing とは何ですか？",
        a: "Gravity Lensing は Common Lisp のパッケージレジストリです。Common Lisp ライブラリを検索できる Web インターフェースを提供し、パッケージの詳細、依存関係、使用方法の情報を掲載しています。",
      },
      {
        q: "area51 とは何ですか？",
        a: "area51 は Common Lisp のパッケージマネージャ CLI です。依存関係の解決、バージョンのロック、再現可能なビルドを実現します。",
      },
      {
        q: "area51 のインストール方法は？",
        a: "ターミナルで以下のコマンドを実行してください：\ncurl -fsSL https://raw.githubusercontent.com/gr8distance/area51/main/install.sh | bash",
      },
      {
        q: "パッケージの追加方法は？",
        a: "add コマンドを使います：\narea51 add <パッケージ名>\narea51.lisp マニフェストと .asd システム定義が自動で更新されます。",
      },
      {
        q: "パッケージはどこに保存されますか？",
        a: "ダウンロードされたパッケージは ~/.area51/packages/ にキャッシュされます。Quicklisp インデックスは ~/.area51/quicklisp/ にキャッシュされ、24時間ごとに更新されます。",
      },
      {
        q: "Quicklisp は必要ですか？",
        a: "いいえ。area51 はスタンドアロンのパッケージマネージャです。パッケージメタデータを glensing から取得し、ソースを直接ダウンロードします。Quicklisp のインストールは不要です。",
      },
      {
        q: "パッケージの公開方法は？",
        a: "パッケージの公開機能は近日公開予定です。現在、glensing は Quicklisp ディストリビューションからパッケージをインデックスしています。直接公開のサポートをお待ちください。",
      },
      {
        q: "glensing は無料ですか？",
        a: "はい。Gravity Lensing と area51 はどちらも無料のオープンソースソフトウェアです。",
      },
    ],
  },

  // PageLinks
  pageLinks: {
    explore: "探索",
    more: "もっと見る",
    packages: { label: "パッケージ", desc: "軌道上の全パッケージを閲覧" },
    area51: { label: "area51", desc: "CL パッケージマネージャ" },
    docs: { label: "ドキュメント", desc: "はじめかたガイド" },
    home: { label: "Gravity Lensing", desc: "ブラックホールに戻る" },
  },
} as const;
