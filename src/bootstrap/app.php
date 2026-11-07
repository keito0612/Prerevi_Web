<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpFoundation\Response;
use App\Exceptions\ApiException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // APIリクエストの例外を統一フォーマットで返す
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return match (true) {
                    // カスタムAPI例外
                    $e instanceof ApiException => response()->json([
                        'success' => false,
                        'error' => [
                            'code' => $e->getErrorCode(),
                            'message' => $e->getMessage(),
                            'errors' => $e->getErrors() ?: null,
                        ],
                    ], $e->getStatusCode()),

                    // バリデーションエラー
                    $e instanceof ValidationException => response()->json([
                        'success' => false,
                        'error' => [
                            'code' => 'VALIDATION_ERROR',
                            'message' => 'バリデーションエラー',
                            'errors' => $e->errors(),
                        ],
                    ], Response::HTTP_UNPROCESSABLE_ENTITY),

                    // モデルが見つからない
                    $e instanceof ModelNotFoundException => response()->json([
                        'success' => false,
                        'error' => [
                            'code' => 'NOT_FOUND',
                            'message' => 'リソースが見つかりません',
                        ],
                    ], Response::HTTP_NOT_FOUND),

                    // ルートが見つからない
                    $e instanceof NotFoundHttpException => response()->json([
                        'success' => false,
                        'error' => [
                            'code' => 'NOT_FOUND',
                            'message' => 'エンドポイントが見つかりません',
                        ],
                    ], Response::HTTP_NOT_FOUND),

                    // 認証エラー
                    $e instanceof AuthenticationException => response()->json([
                        'success' => false,
                        'error' => [
                            'code' => 'UNAUTHORIZED',
                            'message' => '認証が必要です',
                        ],
                    ], Response::HTTP_UNAUTHORIZED),

                    // その他のエラー（本番ではメッセージを隠す）
                    default => (function () use ($e) {
                        Log::error('Unhandled API Exception', [
                            'exception' => get_class($e),
                            'message' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                        ]);

                        return response()->json([
                            'success' => false,
                            'error' => [
                                'code' => 'INTERNAL_ERROR',
                                'message' => app()->isProduction()
                                    ? 'サーバーエラーが発生しました'
                                    : $e->getMessage(),
                            ],
                        ], Response::HTTP_INTERNAL_SERVER_ERROR);
                    })(),
                };
            }

            return null; // Web用は通常のハンドリング
        });
    })->create();
