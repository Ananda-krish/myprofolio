<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('portfolios', function (Blueprint $table) {
            $table->unsignedBigInteger('navbar_template_id')->nullable()->after('owner_id');
            $table->foreign('navbar_template_id')->references('id')->on('navbar_templates')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('portfolios', function (Blueprint $table) {
            $table->dropForeign(['navbar_template_id']);
            $table->dropColumn('navbar_template_id');
        });
    }
};
