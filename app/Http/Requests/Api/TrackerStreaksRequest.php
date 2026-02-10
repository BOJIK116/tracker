<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class TrackerStreaksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'direction' => ['nullable', 'string'],
            'days'      => ['nullable', 'integer', 'min:30', 'max:2000'],
        ];
    }
}
