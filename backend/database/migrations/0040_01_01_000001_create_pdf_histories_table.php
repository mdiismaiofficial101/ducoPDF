<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pdf_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('tool');
            $table->string('filename');
            $table->string('original_filename');
            $table->bigInteger('file_size')->default(0);
            $table->string('mime_type')->nullable();
            $table->string('status')->default('completed');
            $table->json('meta')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('user_id');
            $table->index('tool');
            $table->index('status');
            $table->index('created_at');
        });

        Schema::create('pdf_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pdf_history_id')->constrained()->cascadeOnDelete();
            $table->string('disk')->default('uploads');
            $table->string('path');
            $table->string('filename');
            $table->bigInteger('file_size')->default(0);
            $table->string('mime_type')->nullable();
            $table->timestamps();

            $table->index('pdf_history_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pdf_files');
        Schema::dropIfExists('pdf_histories');
    }
};
