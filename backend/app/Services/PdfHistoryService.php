<?php

namespace App\Services;

use App\Models\PdfHistory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PdfHistoryService
{
    public function store(
        int $userId,
        string $tool,
        UploadedFile $file,
        string $status = 'completed',
        array $meta = []
    ): PdfHistory {
        $path = "uploads/pdf/{$tool}/" . now()->format('Y/m/d');
        $filename = $this->generateFilename($file);

        $file->move(public_path($path), $filename);

        return PdfHistory::create([
            'user_id' => $userId,
            'tool' => $tool,
            'filename' => $filename,
            'original_filename' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'status' => $status,
            'meta' => $meta,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public function getUserHistory(int $userId, int $perPage = 20)
    {
        return PdfHistory::byUser($userId)
            ->latest()
            ->paginate($perPage);
    }

    public function getToolStats(string $tool): array
    {
        return [
            'total' => PdfHistory::byTool($tool)->count(),
            'today' => PdfHistory::byTool($tool)->whereDate('created_at', today())->count(),
            'total_size' => PdfHistory::byTool($tool)->sum('file_size'),
        ];
    }

    public function getUserStats(int $userId): array
    {
        $histories = PdfHistory::byUser($userId);

        return [
            'total_operations' => $histories->count(),
            'total_files' => $histories->count(),
            'total_size' => $histories->sum('file_size'),
            'recent_tools' => $histories->select('tool')
                ->distinct()
                ->pluck('tool'),
            'today_count' => (clone $histories)->whereDate('created_at', today())->count(),
        ];
    }

    private function generateFilename(UploadedFile $file): string
    {
        $timestamp = now()->format('Ymd_His');
        $random = substr(uniqid(), -8);
        $extension = $file->getClientOriginalExtension();
        return "{$timestamp}_{$random}.{$extension}";
    }
}
