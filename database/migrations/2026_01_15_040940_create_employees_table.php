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
        Schema::create('employees', function (Blueprint $table) {
            $table->id('employee_p_id');

            $table->string('employee_id')->unique();
            $table->string('first_name'); 
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('email')->unique();
            $table->date('date_hired');
            $table->string('phone', 11)->nullable()->unique();
            $table->string('position')->nullable();
            $table->string('department')->nullable();

            $table->decimal('salary', 10, 2)->nullable();

            $table->enum('status', ['active', 'resigned', 'terminated'])
                ->default('active');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
