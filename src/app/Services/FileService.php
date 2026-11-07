<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class FileService
{
    protected string $disk;

    public function __construct(string $disk = 'public')
    {
        if(app()->isProduction()){
            $this->disk = 'r2';
        }else{
            $this->disk = $disk;
        }
    }

    /**
     * ファイルを保存する
     */
    public function upload(UploadedFile $file, string $path = '', string $fileName): string
    {
        return $this->getStorage()->putFileAs($path, $file, $fileName, 'public');
    }

    /**
     * ファイルのURLを取得する
     */
    public function getUrl(string $filePath): string
    {
        return $this->getStorage()->url($filePath);
    }

    /**
     * ファイルを削除する
     */
    public function delete(string $filePath): bool
    {
        return $this->getStorage()->delete($filePath);
    }

    /**
     * ファイルが存在するか確認する
     */
    public function exists(string $filePath): bool
    {
        return $this->getStorage()->exists($filePath);
    }

    /**
     * ファイルを取得する
     */
    public function get(string $filePath)
    {
        return $this->getStorage()->get($filePath);
    }

    /**
     * Storageインスタンスを取得する
     */
    protected function getStorage()
    {
        return Storage::disk($this->disk);
    }

    /**
     * URLからストレージパスを抽出する
     */
    public function extractPathFromUrl(string $url): ?string
    {
        // /storage/ 以降のパスを取得 (ローカル)
        if (preg_match('/\/storage\/(.+)$/', $url, $matches)) {
            return $matches[1];
        }
        // R2などの外部ストレージの場合、バケット名以降のパスを取得
        if (preg_match('/reviewImage\/.+$/', $url, $matches)) {
            return $matches[0];
        }
        return null;
    }

    /**
     * URLからパスを抽出してファイルを削除する
     */
    public function deleteByUrl(string $url): bool
    {
        $path = $this->extractPathFromUrl($url);
        if ($path && $this->exists($path)) {
            return $this->delete($path);
        }
        return false;
    }
}
