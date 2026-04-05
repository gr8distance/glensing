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
    tagline: "Common Lisp パッケージレジストリ",
    search: "パッケージを検索...",
    stats: (count: number) => `${count} 個のパッケージが軌道上に`,
    what: {
      title: "gargantua とは？",
      desc: 'Common Lisp のパッケージレジストリです。パッケージは gargantua の重力場を周回し、<strong>area51</strong> を使ってローカル環境に取り込めます。',
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
      addDesc: "パッケージは <strong>gargantua</strong> から取得され、ローカルマシンにインストールされます。",
      how: "仕組み",
      registry: "レジストリ（宇宙）",
      local: "あなたのマシン（地球）",
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
    emptyTitle: "軌道上にパッケージが見つかりません",
    emptyHint: "別の検索ワードを試すか、全パッケージを閲覧してください",
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
      desc: "area51 は Common Lisp における Bundler（Ruby）、Cargo（Rust）、npm（JavaScript）に相当するツールです。プロジェクトの依存関係を解決・管理し、バージョンをロックして再現可能なビルドを保証します。必要なものを宣言すれば、あとは area51 におまかせ \u2014 ランタイムに Quicklisp は不要です。",
    },
    how: "仕組み",
    registry: "レジストリ / 宇宙",
    local: "あなたのマシン",
    earth: "地球",
    installation: "インストール",
    commands: "基本コマンド",
    cmd: {
      newDesc: "area51.lisp と .asd を含む新しいプロジェクトを作成。",
      addDesc: "area51.lisp と .asd に依存関係を追加。",
      installDesc: "すべての依存関係を解決しダウンロード。",
      buildDesc: "バイナリのビルド、プロジェクトの実行、テストの実行。",
    },
    config: "設定",
    configDesc: "area51 は設定とキャッシュを以下に保存します：",
    source: "ソースコード",
    github: "GitHub で見る",
  },

  // Docs page
  docs: {
    label: "ドキュメント",
    title: "はじめかた",
    subtitle: "gargantua と area51 パッケージマネージャを使って Common Lisp プロジェクトを始めるために必要なすべて。",
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
    },
    browsing: {
      title: "パッケージの閲覧",
      text: "Web でパッケージを閲覧・検索できます：",
      installed: "現在のプロジェクトにインストールされているものを確認するには：",
    },
    configTitle: "設定",
    configText: "area51 は設定とキャッシュをホームディレクトリに保存します。",
    configCache: "パッケージは一度ダウンロードされるとここにキャッシュされます。Quicklisp インデックスは24時間ごとに自動更新されます。<code>area51 clean</code> でキャッシュ全体をクリアできます。",
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
      cleanDesc: "パッケージキャッシュ (~/.area51/) をクリア",
      upgradeDesc: "area51 自体を最新バージョンに更新",
    },
  },

  // PageLinks
  pageLinks: {
    explore: "探索",
    more: "もっと見る",
    packages: { label: "パッケージ", desc: "軌道上の全パッケージを閲覧" },
    area51: { label: "area51", desc: "CL パッケージマネージャ" },
    docs: { label: "ドキュメント", desc: "はじめかたガイド" },
    home: { label: "gargantua", desc: "ブラックホールに戻る" },
  },
} as const;
