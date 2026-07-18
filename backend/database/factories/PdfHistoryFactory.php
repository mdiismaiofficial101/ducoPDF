<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class PdfHistoryFactory extends Factory
{
    public function definition(): array
    {
        $tools = ['merge', 'split', 'compress', 'protect', 'unlock', 'rotate', 'watermark', 'ocr', 'pdf-to-word', 'word-to-pdf'];

        return [
            'user_id' => User::factory(),
            'tool' => fake()->randomElement($tools),
            'filename' => fake()->uuid() . '.pdf',
            'original_filename' => fake()->word() . '.pdf',
            'file_size' => fake()->numberBetween(1024, 10485760),
            'mime_type' => 'application/pdf',
            'status' => 'completed',
            'ip_address' => fake()->ipv4(),
        ];
    }
}
