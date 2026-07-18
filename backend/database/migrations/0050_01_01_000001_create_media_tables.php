<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('filename');
            $table->string('original_filename');
            $table->string('path');
            $table->string('url');
            $table->string('thumbnail_url')->nullable();
            $table->string('webp_url')->nullable();
            $table->bigInteger('file_size');
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->string('mime_type');
            $table->string('disk')->default('uploads');
            $table->string('collection')->default('default');
            $table->json('meta')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('user_id');
            $table->index('collection');
            $table->index('mime_type');
            $table->index('created_at');
        });

        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('type'); // youtube, vimeo, upload
            $table->string('url');
            $table->string('embed_url')->nullable();
            $table->string('video_id')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->string('filename')->nullable();
            $table->bigInteger('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->integer('duration')->nullable();
            $table->string('status')->default('active');
            $table->boolean('is_featured')->default(false);
            $table->json('meta')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('user_id');
            $table->index('type');
            $table->index('status');
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('videos');
        Schema::dropIfExists('images');
    }
};
