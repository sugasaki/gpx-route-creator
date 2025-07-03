# Claude Code Settings


## Development Commands
- Build: `pnpm build`
- Type Check: `npx tsc -b`
- Lint: `pnpm lint`  
- Dev Server: `pnpm dev`

## Project Settings
- Auto-confirmation: Enabled (no "Do you want to proceed?" prompts)

## Pull Request Guidelines

`doc/pull-request-guidelines.md`を参照してください

## Commit Message Guidelines  
- `doc/commit-guideline.md`のルールを守ってコミットを行います。

## Code Style
- **Formatting**: Prettier設定に従う
- **Linting**: ESLintルールを遵守
- **Import Order**: 
  - React関連のimportを最初
  - 外部ライブラリ
  - 内部モジュール（@/から始まる）
  - 相対パス
- **Naming Conventions**:
  - コンポーネント: PascalCase
  - 関数・変数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - ファイル名: kebab-case
- **Comments**: 複雑なロジックには日本語コメントを追加
- **Type Safety**: any型の使用を避け、適切な型定義を行う

## Architecture Principles

`doc/architecture.md`を参照してください

### Hexagonal Architecture（ポートとアダプター）
- **ドメイン層の独立性**: ビジネスロジックはUIフレームワークや状態管理ライブラリに依存しない
- **ドメインクラス**: `src/domain/`ディレクトリに配置し、純粋なTypeScriptクラスとして実装
- **Storeは薄いラッパー**: Zustand storeはドメインクラスを呼び出すだけの薄いアダプター
- **テスタビリティ**: 各ドメインクラスは独立してユニットテスト可能

## State Management
- **Zustand優先**: プロジェクト共通のstateはZustandで管理する
- **Props最小化**: コンポーネントへのpropsは必要最低限に抑える
- **Store設計**: 
  - `src/store/`ディレクトリに機能別にstoreを配置
  - 単一責任の原則に従い、各storeは特定のドメインのみを管理
  - **ビジネスロジックの分離**: storeにビジネスロジックを書かず、ドメイン層に委譲
- **Local State**: コンポーネント固有の一時的な状態のみuseStateを使用
- **Global State**: 複数のコンポーネントで共有される状態はZustandへ
- **Selector Pattern**: 必要なstateのみを選択的に取得し、不要な再レンダリングを防ぐ

## Component Design Philosophy
- **小さく分割**: コンポーネントは可能な限り小さな単位に分割する
- **将来を見据えた設計**: 現在使用しなくても、将来の再利用可能性を常に考慮する
- **Props Interface**: 柔軟で拡張可能なpropsインターフェースを設計する
- **Context Independence**: 特定の文脈に依存しない、汎用的なコンポーネントを作成する
- **Composition over Inheritance**: 継承よりもコンポジションを優先する
- **Extract Early**: 重複の兆候が見えたら即座にコンポーネントを抽出する
- **Generic First**: 特定用途向けではなく、汎用的な設計から始める

#### スタイリング

- Tailwind CSS v4 with PostCSS
- フォントはGeist SansとGeist MonoがCSS変数として設定済み

#### 言語

- TypeScript
  - パスエイリアス（`@/*`はプロジェクトルートにマップ）を使用したStrictモードが有効


# リファクタリングの仕方

`doc/refactoring-guideline.md`を参照してください

## ドメインロジックの抽出
新しいビジネスロジックを実装する際は：
1. まずドメインクラスのテストを書く（TDD）
2. テストが失敗することを確認
3. ドメインクラスを実装してテストを通す
4. storeから該当ロジックを呼び出す

### 例：新しい操作を追加する場合
```typescript
// 1. テストファースト
// src/domain/__tests__/YourManager.test.ts

// 2. ドメインクラス実装
// src/domain/YourManager.ts
export class YourManager {
  static yourOperation(/* params */) {
    // ビジネスロジック
  }
}

// 3. storeから呼び出し
// src/store/yourStore.ts
yourAction: (params) => {
  const result = YourManager.yourOperation(params)
  set(result)
}
```

# テストの書き方

`doc/test-guideline.md`を参照してください

## ドメイン層のテスト
- 各ドメインクラスは独立してテスト
- 外部依存なしの純粋な単体テスト
- カバレッジ100%を目指す