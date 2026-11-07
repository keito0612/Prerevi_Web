<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

class ApiException extends Exception
{
    public function __construct(
        string $message,
        protected string $errorCode = 'INTERNAL_ERROR',
        protected int $statusCode = Response::HTTP_INTERNAL_SERVER_ERROR,
        protected array $errors = []
    ) {
        parent::__construct($message);
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    // よく使うエラーのファクトリメソッド
    public static function notFound(string $message = 'リソースが見つかりません'): self
    {
        return new self($message, 'NOT_FOUND', Response::HTTP_NOT_FOUND);
    }

    public static function badRequest(string $message = '不正なリクエストです', array $errors = []): self
    {
        return new self($message, 'BAD_REQUEST', Response::HTTP_BAD_REQUEST, $errors);
    }

    public static function unauthorized(string $message = '認証が必要です'): self
    {
        return new self($message, 'UNAUTHORIZED', Response::HTTP_UNAUTHORIZED);
    }

    public static function forbidden(string $message = 'アクセス権限がありません'): self
    {
        return new self($message, 'FORBIDDEN', Response::HTTP_FORBIDDEN);
    }

    public static function conflict(string $message = '競合が発生しました'): self
    {
        return new self($message, 'CONFLICT', Response::HTTP_CONFLICT);
    }

    public static function serverError(string $message = 'サーバーエラーが発生しました'): self
    {
        return new self($message, 'INTERNAL_ERROR', Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}
