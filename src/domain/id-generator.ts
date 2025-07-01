/**
 * ユニークなIDを生成する
 * @returns ランダムな英数字のID文字列
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}