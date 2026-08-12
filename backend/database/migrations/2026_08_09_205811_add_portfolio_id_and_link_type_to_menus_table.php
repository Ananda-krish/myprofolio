<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->foreignId('portfolio_id')->nullable()->after('is_active')->constrained()->cascadeOnDelete();
            $table->string('link_type', 10)->default('page')->after('portfolio_id');
        });
    }

    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->dropForeign(['portfolio_id']);
            $table->dropColumn(['portfolio_id', 'link_type']);
        });
    }
};
