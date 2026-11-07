<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'comment' => 'nullable|string|max:300|',
            'profileImage' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => '名前は必須です。',
            'name.string' => '名前は文字列で入力してください。',
            'name.max' => '名前は100文字以内で入力してください。',
            'comment.max' =>'自己紹介は300文字以内で入力して下さい。',
            'profileImage.image' => '画像ファイルを選択してください。',
            'profileImage.mimes' => '画像の形式はjpeg、png、jpg、gifのいずれかにしてください。',
            'profileImage.max' => '画像のサイズは2MB以内にしてください。',
        ];
    }
}
