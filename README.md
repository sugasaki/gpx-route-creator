# GPX Route Creator

MapLibreとReactを使用したWebベースのGPXルート作成アプリケーション。Stravaやrungoappのような直感的なインターフェースでルートを作成・編集できます。

![GPX Route Creator](https://github.com/user-attachments/assets/placeholder.png)

## 機能

### 🗺️ ルート作成
- 地図上をクリックしてポイントを追加
- ライン上をクリックして中間点を挿入
- ドラッグ＆ドロップでポイントを移動

### ✏️ 編集機能
- 3つのモード（表示/作成/編集）
- 全モードでポイントのドラッグ移動が可能
- 編集モードで中間点の削除（端点は削除不可）

### 🎯 スマートなUI
- 端点（始点・終点）は常時表示
- 中間点はホバー時のみ表示でクリーンな見た目
- リアルタイムでラインが追従

### 💾 その他の機能
- Undo/Redo機能
- 総距離の自動計算
- GPXファイルのエクスポート
- ダークテーマの地図スタイル

## 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **地図ライブラリ**: MapLibre GL JS + react-map-gl
- **状態管理**: Zustand
- **スタイリング**: Tailwind CSS
- **ビルドツール**: Vite
- **アイコン**: Heroicons

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

# 開発サーバーの起動
pnpm dev
```

開発サーバーは http://localhost:3000 で起動します。

### ビルド

```bash
# プロダクションビルド
pnpm build

# ビルドしたアプリの確認
pnpm preview
```

## 使い方

### 基本操作

1. **ルート作成モード** (青い+ボタン)
   - 地図をクリック: 端にポイントを追加
   - ライン上をクリック: 中間にポイントを挿入

2. **編集モード** (緑の鉛筆ボタン)
   - ポイントをクリック: 削除（端点以外）
   - ポイントをドラッグ: 移動

3. **表示モード** (デフォルト)
   - ポイントをドラッグ: 移動のみ

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
├── components/
│   ├── Map.tsx          # メイン地図コンポーネント
│   ├── MapControls.tsx  # UIコントロール
│   └── RouteMarker.tsx  # ポイントマーカー
├── store/
│   ├── routeStore.ts    # ルートデータ管理
│   └── uiStore.ts       # UI状態管理
├── types/
│   └── index.ts         # 型定義
└── App.tsx              # ルートコンポーネント
```

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
```

## ライセンス

MIT License

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して変更内容について議論してください。

## 作成者

[Your Name]

---

🤖 Generated with [Claude Code](https://claude.ai/code)