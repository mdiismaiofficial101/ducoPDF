<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\PdfHistory;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PdfHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_file_size_formatted()
    {
        $history = PdfHistory::factory()->make([
            'file_size' => 1024,
        ]);

        $this->assertEquals('1 KB', $history->file_size_for_humans);
    }

    public function test_large_file_size_formatted()
    {
        $history = PdfHistory::factory()->make([
            'file_size' => 1048576,
        ]);

        $this->assertEquals('1 MB', $history->file_size_for_humans);
    }

    public function test_tool_label_is_formatted()
    {
        $history = PdfHistory::factory()->make([
            'tool' => 'pdf-to-word',
        ]);

        $this->assertEquals('Pdf To Word', $history->tool_label);
    }

    public function test_scopes()
    {
        PdfHistory::factory()->count(5)->create(['status' => 'completed']);
        PdfHistory::factory()->count(2)->create(['status' => 'failed']);

        $this->assertEquals(5, PdfHistory::completed()->count());
    }
}
