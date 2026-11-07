import { ApiResponse } from "@/types";

export class UtilApi {
  static API_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost'
    : 'https://api.pre-re-vi.com';

  static selectedErrorMessage(keys: string[], errors: { [key: string]: string[] }): string {
    for (const key of keys) {
      if (errors[key]?.length) {
        return errors[key][0];
      }
    }
    return "";
  }

  /**
   * APIレスポンスからエラーメッセージを抽出する
   */
  static getErrorMessage<T>(response: ApiResponse<T>, keys?: string[]): string {
    if (response.success) {
      return "";
    }

    // バリデーションエラーがある場合
    if (keys && response.error.errors) {
      const message = this.selectedErrorMessage(keys, response.error.errors);
      if (message) return message;
    }

    // 一般的なエラーメッセージ
    return response.error.message || "エラーが発生しました";
  }

  /**
   * APIレスポンスがエラーかどうかをチェック
   */
  static isError<T>(response: ApiResponse<T>): response is { success: false; error: { code: string; message: string; errors?: { [key: string]: string[] } } } {
    return !response.success;
  }
}