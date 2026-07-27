<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qa_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('body');
            $table->string('category')->default('General');
            $table->json('tags')->nullable();
            $table->integer('votes')->default(0);
            $table->integer('view_count')->default(0);
            $table->string('best_answer_id')->nullable();
            $table->json('reports')->nullable();
            $table->timestamps();

            $table->index('category');
            $table->index('created_at');
        });

        Schema::create('qa_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('qa_question_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('body');
            $table->integer('votes')->default(0);
            $table->boolean('is_best_answer')->default(false);
            $table->json('reports')->nullable();
            $table->timestamps();

            $table->index('qa_question_id');
            $table->index('is_best_answer');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qa_answers');
        Schema::dropIfExists('qa_questions');
    }
};
