<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\QAQuestion;
use App\Models\QAAnswer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QAController extends Controller
{
    public function questions(Request $request): JsonResponse
    {
        $query = QAQuestion::with('answers.user');

        if ($request->category && $request->category !== 'all') {
            $query->byCategory($request->category);
        }

        if ($request->search) {
            $query->search($request->search);
        }

        if ($request->sort === 'votes') {
            $query->orderBy('votes', 'desc');
        } else {
            $query->latest();
        }

        $questions = $query->paginate(50);

        return response()->json([
            'questions' => collect($questions->items())->map->toApiArray(),
            'meta' => [
                'current_page' => $questions->currentPage(),
                'last_page' => $questions->lastPage(),
                'per_page' => $questions->perPage(),
                'total' => $questions->total(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $question = QAQuestion::with('answers.user')->findOrFail($id);
        $question->increment('view_count');

        return response()->json([
            'question' => $question->toApiArray(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'category' => 'required|string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $question = QAQuestion::create([
            'user_id' => $request->user()?->id,
            'title' => $data['title'],
            'body' => $data['body'],
            'category' => $data['category'],
            'tags' => $data['tags'] ?? [],
            'votes' => 0,
            'view_count' => 0,
            'reports' => [],
        ]);

        return response()->json([
            'question' => $question->fresh()->load('answers.user')->toApiArray(),
        ], 201);
    }

    public function storeAnswer(Request $request, string $questionId): JsonResponse
    {
        $question = QAQuestion::findOrFail($questionId);

        $data = $request->validate([
            'body' => 'required|string',
        ]);

        $answer = QAAnswer::create([
            'qa_question_id' => $question->id,
            'user_id' => $request->user()?->id,
            'body' => $data['body'],
            'votes' => 0,
            'reports' => [],
        ]);

        return response()->json([
            'answer' => $answer->load('user')->toApiArray(),
        ], 201);
    }

    public function voteQuestion(Request $request, string $id): JsonResponse
    {
        $data = $request->validate(['delta' => 'required|in:1,-1']);
        $question = QAQuestion::findOrFail($id);
        $question->increment('votes', $data['delta']);

        return response()->json([
            'votes' => $question->fresh()->votes,
        ]);
    }

    public function voteAnswer(Request $request, string $id): JsonResponse
    {
        $data = $request->validate(['delta' => 'required|in:1,-1']);
        $answer = QAAnswer::findOrFail($id);
        $answer->increment('votes', $data['delta']);

        return response()->json([
            'votes' => $answer->fresh()->votes,
        ]);
    }

    public function markBestAnswer(Request $request, string $questionId, string $answerId): JsonResponse
    {
        $question = QAQuestion::findOrFail($questionId);
        $answer = QAAnswer::findOrFail($answerId);

        if ($answer->qa_question_id !== (int) $questionId) {
            return response()->json(['message' => 'Answer does not belong to this question.'], 422);
        }

        QAAnswer::where('qa_question_id', $question->id)->update(['is_best_answer' => false]);
        $answer->update(['is_best_answer' => true]);
        $question->update(['best_answer_id' => $answerId]);

        return response()->json(['message' => 'Best answer marked.']);
    }

    public function reportQuestion(Request $request, string $id): JsonResponse
    {
        $question = QAQuestion::findOrFail($id);
        $userId = $request->user()?->email ?? 'anon';
        $reports = $question->reports ?? [];

        if (!in_array($userId, $reports)) {
            $reports[] = $userId;
            $question->update(['reports' => $reports]);
        }

        return response()->json(['message' => 'Question reported.']);
    }

    public function reportAnswer(Request $request, string $id): JsonResponse
    {
        $answer = QAAnswer::findOrFail($id);
        $userId = $request->user()?->email ?? 'anon';
        $reports = $answer->reports ?? [];

        if (!in_array($userId, $reports)) {
            $reports[] = $userId;
            $answer->update(['reports' => $reports]);
        }

        return response()->json(['message' => 'Answer reported.']);
    }

    public function categories(): JsonResponse
    {
        $categories = QAQuestion::select('category')
            ->distinct()
            ->pluck('category')
            ->toArray();

        if (empty($categories)) {
            $categories = ['General', 'Technical', 'Feature Request', 'Bug Report', 'Tutorial'];
        }

        return response()->json(['categories' => $categories]);
    }
}
