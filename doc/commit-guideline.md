# doc/commit-guideline.md

## 基本方針
- 適切な単位に分割してcommitする
- 論理的に関連のある変更をまとめる
- 単一の責任を持つcommitにする

## コミットメッセージのフォーマット
**コミットメッセージは日本語で記述する**


---
[TICKET-ID] 変更の概要

詳細説明（必要に応じて）
- 変更理由
- 影響範囲
- 注意事項
---

## ルール
1. **チケット番号を必ず含める**
   - TICKET-ID-XXX形式でプレフィックスを付ける
   - 例: `TICKET-ID-162: コミットルールドキュメントを追加`

2. **変更の種類を明確にする**
   - `add`: 新機能の追加
   - `update`: 既存機能の更新・改善
   - `fix`: バグ修正
   - `refactor`: リファクタリング
   - `remove`: 削除
   - `docs`: ドキュメント更新

3. **適切な粒度でcommit**
   - 関連のない変更は分ける
   - テストとソースコードは同じcommitで含める
   - 設定変更は別途commitする

## 避けるべきコミット
- 複数の機能を同時に含むcommit
- "WIP", "fix", "update"のような曖昧なメッセージ
- 設定ファイルと機能実装を同時に含むcommit


## その他
- **Signature**:
  - GeminiからPull Requestを作成する場合:
    - `🤖 Generated with Gemini` を末尾に含める
  - Claude CodeからPull Requestを作成する場合:
    - `🤖 Generated with Claude Code` を末尾に含める