<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ReviewRequest extends FormRequest
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
            'safety' => 'required|integer|in:0,1,2,3,4,5',
            'childRearing' => 'required|integer|in:0,1,2,3,4,5',
            'cityPolicies' => 'required|integer|in:0,1,2,3,4,5',
            'publicTransportation' => 'required|integer|in:0,1,2,3,4,5',
            'livability' =>'required|integer|in:0,1,2,3,4,5',
            'averageRating' => 'required|numeric',
            'photos.*' => 'file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'goodComment' => 'nullable|max:300',
            'badComment' => 'nullable|max:300',
            'deletePhotos' => 'nullable'
        ];
    }

    public function messages(): array
    {
        return [
            'safety.required' => '評価は必須です。',
            'safety.in' => '評価は0から5段階まででお願いします。',
            'cityPolicies.required' => '評価は必須です。',
            'cityPolicies.in' => '評価は0から5段階まででお願いします。',
            'publicTransportation.required' => '評価は必須です。',
            'publicTransportation.in' => '評価は0から5段階まででお願いします。',
            'livability.required' => '評価は必須です。',
            'livability.in' => '評価は0から5段階まででお願いします。',
            'photos.*.file' => '各ファイルは画像ファイルである必要があります。',
            'photos.*.mimes' => '画像の形式はjpeg、png、jpg、gif、webpのいずれかにしてください。',
            'photos.*.max' => '各画像のサイズは5MB以内にしてください。',
            'goodComment' =>'文字数は300文字以内でお願いします。',
            'badComment' => '文字数は300文字以内でお願いします。'
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        $res = response()->json(
            [
                'errors' => $validator->errors(),
            ],
            400
        );
        throw new HttpResponseException($res);
    }
}
