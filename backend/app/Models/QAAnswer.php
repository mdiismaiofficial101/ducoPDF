<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QAAnswer extends Model
{
    protected $table = 'qa_answers';

    protected $fillable = [
        'qa_question_id',
        'user_id',
        'body',
        'votes',
        'is_best_answer',
        'reports',
    ];

    protected $casts = [
        'reports' => 'array',
        'votes' => 'integer',
        'is_best_answer' => 'boolean',
    ];

    protected $appends = ['author'];

    public function question(): BelongsTo
    {
        return $this->belongsTo(QAQuestion::class, 'qa_question_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getAuthorAttribute(): array
    {
        if ($this->user) {
            return [
                'id' => $this->user->email,
                'name' => $this->user->name,
                'avatar' => $this->user->avatar ?? '',
            ];
        }
        return ['id' => 'anon', 'name' => 'Anonymous', 'avatar' => ''];
    }

    public function toApiArray(): array
    {
        return [
            'id' => (string) $this->id,
            'body' => $this->body,
            'author' => $this->author,
            'votes' => $this->votes,
            'isBestAnswer' => $this->is_best_answer,
            'createdAt' => $this->created_at?->toIso8601String() ?? now()->toIso8601String(),
            'reports' => $this->reports ?? [],
        ];
    }
}
