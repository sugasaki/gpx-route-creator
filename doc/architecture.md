# doc/architecture.md

**重要**: 再利用性を最優先とする

**Component Responsibility**: コンポーネントはUIの描画とイベントハンドリングのみに集中

**Logic Separation**: ビジネスロジックは以下に分離する

  - **Hooks** (`src/hooks/`): 状態管理とコンポーネント間で共有されるロジック
  - **Utils** (`src/utils/`): 純粋関数による汎用的な処理
  - **Libraries** (`src/lib/`): 特定のドメインロジックや外部APIとのやり取り

**Single Responsibility**: 各モジュールは単一の責任を持つ

**Testability**: ロジックを分離することでテストしやすい構造にする

**Reusability**: 同じロジックを複数の場所で使い回せるよう設計する

