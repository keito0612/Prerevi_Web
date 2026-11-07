import { UtilApi } from "@/Util/Util_api";
import { CookieServise } from "./cookieServise";
import { ApiResponse } from "@/types";

const TOKEN_KEY = 'token';
const TOKEN_EXPIRY_DAYS = 7;

interface LoginData {
  token: string;
  message: string;
}

interface RegisterData {
  token: string;
  message: string;
}

export class AuthService {

  static async login<T>({ url, param, success, validetionMessage, failure }: { url: string, param: T, success: (token: string) => void, validetionMessage: (message: string) => void, failure: (error: string) => void }) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(param),
      });

      const response: ApiResponse<LoginData> = await res.json();

      if (response.success) {
        success(response.data.token);
      } else {
        const errorMessage = UtilApi.getErrorMessage(response, ['email', 'password']);
        if (response.error?.errors) {
          validetionMessage(errorMessage);
        } else {
          failure(errorMessage);
        }
      }
    } catch (error) {
      failure("予期しないエラーが発生しました");
      console.error('エラー発生', error);
    }
  }

  static async register<T>({ url, param, success, failure }: { url: string, param: T, success: (message: string, token: string) => void, failure: (error: string) => void }) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(param),
      });

      const response: ApiResponse<RegisterData> = await res.json();

      if (response.success) {
        success("新規登録が完了しました。", response.data.token);
      } else {
        failure(UtilApi.getErrorMessage(response, ["name", "email", "password"]));
      }
    } catch (error) {
      failure('想定外のエラーが発生しました。');
      console.error('エラー発生', error);
    }
  }


  static setSesstion(token: string) {
    CookieServise.setCookie(TOKEN_KEY, token, TOKEN_EXPIRY_DAYS);
  }

  static deleteSesstion() {
    CookieServise.deleteCookie(TOKEN_KEY);
  }

  static getSesstion(): string | null {
    if (typeof window !== 'undefined') {
      const token = CookieServise.getCookie(TOKEN_KEY);
      return token ?? null;
    }
    return null;
  }
}
