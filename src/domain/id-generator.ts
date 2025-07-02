/**
 * ユニークなIDを生成する
 * crypto.randomUUID()が利用可能な場合は使用し、
 * そうでない場合はMath.randomベースのフォールバックを使用
 * @returns ランダムなID文字列（UUIDまたは英数字）
 */
export const generateId = (): string => {
  // crypto.randomUUID が利用可能かチェック
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID()
    } catch (error) {
      // セキュアコンテキストでない場合などのエラーをキャッチ
      console.warn('crypto.randomUUID() failed, falling back to Math.random', error)
    }
  }
  
  // フォールバック: Math.randomベースのID生成
  return Math.random().toString(36).slice(2, 11)
}