<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QAQuestion extends Model
{
    protected $table = 'qa_questions';

    protected $fillable = [
        'user_id',
        'title',
        'body',
        'category',
        'tags',
        'votes',
        'view_count',
        'best_answer_id',
        'reports',
    ];

    protected $casts = [
        'tags' => 'array',
        'reports' => 'array',
        'votes' => 'integer',
        'view_count' => 'integer',
    ];

    protected $appends = ['author'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QAAnswer::class, 'qa_question_id');
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

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
              ->orWhere('body', 'like', "%{$term}%")
              ->orWhereJsonContains('tags', $term);
        });
    }

    public function toApiArray(): array
    {
        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'body' => $this->body,
            'tags' => $this->tags ?? [],
            'category' => $this->category,
            'author' => $this->author,
            'votes' => $this->votes,
            'answers' => $this->answers->map->toApiArray()->toArray(),
            'bestAnswerId' => $this->best_answer_id,
            'createdAt' => $this->created_at?->toIso8601String() ?? now()->toIso8601String(),
            'viewCount' => $this->view_count,
            'reports' => $this->reports ?? [],
        ];
    }
}
