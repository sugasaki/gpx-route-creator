# GPX Route Creator

MapLibreとReactを使用したWebベースのGPXルート作成アプリケーション。Stravaやrungoappのような直感的なインターフェースでルートを作成・編集できます。

🚀 **デモ**: https://sugasaki.github.io/gpx-route-creator/

<!-- スクリーンショットはデモサイトをご確認ください -->

## 機能

### 🗺️ ルート作成
- 地図上をクリックしてポイントを追加
- ライン上をクリックして中間点を挿入
- ドラッグ＆ドロップでポイントを移動

### ✏️ 編集機能
- 5つのモード（表示/作成/編集/削除/矩形削除）
- 表示・作成・編集モードでポイントのドラッグ移動が可能
- 編集モードで中間点の削除（端点は削除不可）
- 削除モードで全ポイントの個別削除
- 矩形削除モードでドラッグ範囲内のポイントを一括削除
- 全モードでESCキーによる解除が可能

### 🎯 スマートなUI
- 端点（始点・終点）は常時表示
- 中間点はホバー時のみ表示でクリーンな見た目
- 削除モード時は全ポイントを表示
- リアルタイムでラインが追従
- モードごとに最適化されたカーソル表示
- ルートクリア時に確認ダイアログ表示（誤操作防止）

### 🎨 カスタマイズ機能
- 地図スタイルの切り替え（Streets/Dark/Satellite/Outdoor）
- ルートラインの色を自由に変更
  - 8色のプリセットカラー
  - カスタムカラーピッカーで任意の色を選択
- 選択した設定はすべて自動保存

### 💾 その他の機能
- Undo/Redo機能
- 総距離の自動計算
- GPXファイルのエクスポート
- すべての設定をlocalStorageに永続化

## 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **地図ライブラリ**: MapLibre GL JS + react-map-gl
- **状態管理**: Zustand
- **スタイリング**: Tailwind CSS
- **ビルドツール**: Vite
- **アイコン**: Heroicons

### 特徴

- 🧩 **コンポーネント指向**: 各コンポーネントは100行以下でシンプルに保たれています
- 🪝 **カスタムフック**: 複雑なロジックは再利用可能なフックに分離
- 📁 **整理されたファイル構造**: 機能ごとに適切に分類されたディレクトリ
- 🎯 **単一責任の原則**: 各モジュールが明確な役割を持つ設計
- 🔒 **型安全**: TypeScriptによる厳密な型定義
- 🚀 **高速ビルド**: Viteによる高速な開発体験

## セットアップ

### 必要な環境
- Node.js 18以上
- pnpm（推奨）またはnpm

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/gpx-route-creator.git
cd gpx-route-creator

# 依存関係のインストール
pnpm install

# 環境変数の設定（地図スタイル切り替えを使用する場合）
cp .env.example .env
# .envファイルを編集してMapTiler APIキーを設定

# 開発サーバーの起動
pnpm dev
```

開発サーバーは http://localhost:3000 で起動します。

#### MapTiler APIキーの取得
Streets、Satellite、Outdoorスタイルを使用するには、MapTiler APIキーが必要です：
1. [MapTiler Cloud](https://cloud.maptiler.com/)でアカウントを作成
2. ダッシュボードからAPIキーを取得
3. `.env`ファイルにキーを設定: `VITE_MAPTILER_KEY=your_key_here`

### ビルド

```bash
# プロダクションビルド
pnpm build

# ビルドしたアプリの確認
pnpm preview
```

## 使い方

### 基本操作

1. **表示モード** (デフォルト)
   - ポイントをドラッグ: 移動のみ
   - ESCキー: 他のモードから戻る

2. **ルート作成モード** (青い+ボタン)
   - 地図をクリック: 端にポイントを追加
   - ライン上をクリック: 中間にポイントを挿入
   - ESCキー: 表示モードに戻る

3. **編集モード** (緑の鉛筆ボタン)
   - ポイントをクリック: 削除（端点以外）
   - ポイントをドラッグ: 移動
   - ESCキー: 表示モードに戻る

4. **削除モード** (赤い×ボタン)
   - ポイントをクリック: 即座に削除（全ポイント対象）
   - ESCキー: 表示モードに戻る

5. **矩形削除モード** (オレンジの照準ボタン)
   - ドラッグで範囲選択: 範囲内のポイントを一括削除
   - ESCキー: 表示モードに戻る

### その他のコントロール
- **地図スタイル切替** (右上のドロップダウン)
  - Streets（デフォルト）、Dark、Satellite、Outdoorから選択
- **ルート色変更** (右上のカラーピッカー)
  - プリセットカラーまたはカスタム色を選択
- **ルートクリア** (×ボタン)
  - 確認ダイアログ表示後、全ポイントを削除
- **GPXエクスポート** (ダウンロードボタン)
  - 作成したルートをGPXファイルとして保存

### ポイントの色分け
- 🔵 **青**: 始点
- 🟠 **オレンジ**: 終点
- ⚪ **グレー**: 中間点
- 🟢 **緑**: 選択中
- 🔴 **赤**: ドラッグ中

## 開発

### プロジェクト構成

```
src/
├── components/          # UIコンポーネント
│   ├── controls/        # コントロールコンポーネント
│   ├── map/             # 地図関連コンポーネント
│   └── ui/              # 汎用UIコンポーネント
├── hooks/               # カスタムフック
├── utils/               # ユーティリティ関数
├── constants/           # 定数定義
├── store/               # 状態管理（Zustand）
└── types/               # 型定義
```

### アーキテクチャ

このプロジェクトは、保守性と拡張性を重視した設計になっています：

- **コンポーネント**: UIの表示に専念（ロジックは最小限）
- **カスタムフック**: 複雑なロジックをカプセル化
- **ユーティリティ**: 純粋関数で再利用可能な処理
- **状態管理**: Zustandで集中管理

詳細なアーキテクチャ設計については [doc/architecture.md](doc/architecture.md) を参照してください。

### 主要な型定義

```typescript
interface RoutePoint {
  id: string
  lat: number
  lng: number
  elevation?: number
}

interface Route {
  points: RoutePoint[]
  distance: number
}

type EditMode = 'view' | 'create' | 'edit' | 'delete' | 'delete-range'
```

## ライセンス

MIT License

## デプロイ

このアプリケーションは、mainブランチへのプッシュまたはプルリクエストのマージ時に自動的にGitHub Pagesにデプロイされます。

### デプロイフロー
1. プルリクエストを作成
2. レビューを受ける
3. mainブランチにマージ
4. GitHub Actionsが自動的にビルド・デプロイ
5. https://sugasaki.github.io/gpx-route-creator/ で公開

## 拡張ガイド

### 新機能の追加方法

#### 1. 新しい地図操作を追加する場合
```typescript
// src/hooks/useYourFeature.ts
export function useYourFeature() {
  // ロジックをここに実装
}
```

#### 2. 新しいコントロールを追加する場合
```typescript
// src/components/YourControl.tsx
export default function YourControl() {
  // UIコンポーネントのみ、ロジックはhooksへ
}
```

#### 3. 新しい計算処理を追加する場合
```typescript
// src/utils/yourUtil.ts
export function calculateSomething() {
  // 純粋関数として実装
}
```

### コーディング規約

- **コンポーネント**: 100行以下を目標
- **カスタムフック**: 単一責任の原則に従う
- **ユーティリティ**: 副作用のない純粋関数
- **型定義**: 明示的な型付けを推奨

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して変更内容について議論してください。

### 開発フロー
1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コミットメッセージ
- 日本語で記載
- 変更内容を簡潔に説明
- 絵文字プレフィックス推奨:
  - ✨ 新機能
  - 🐛 バグ修正
  - 📝 ドキュメント
  - ♻️ リファクタリング
  - 🎨 UI/UX改善

詳細なコミットガイドラインは [doc/commit-guideline.md](doc/commit-guideline.md) を参照してください。

## 今後の機能追加予定

- 📏 距離測定モード
- 🏔️ 標高グラフ表示
- 💾 ローカルストレージへの自動保存
- 📤 GPXファイルのインポート
- 📱 モバイル対応の改善
- 🛣️ ルート自動提案（道路に沿った経路）

## トラブルシューティング

### よくある問題

1. **地図が表示されない**
   - ネットワーク接続を確認してください
   - ブラウザのコンソールでエラーを確認してください

2. **ポイントがドラッグできない**
   - 削除モードになっていないか確認してください
   - ブラウザを再読み込みしてみてください

3. **GPXエクスポートができない**
   - ルートにポイントが存在するか確認してください
   - ブラウザのダウンロード設定を確認してください

## 作成者

sugasaki

---

🤖 Generated with [Claude Code](https://claude.ai/code)