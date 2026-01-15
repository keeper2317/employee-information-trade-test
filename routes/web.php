<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;


Route::prefix('api')->group(function () {

    // CREATE employee
    Route::post('/employee-store', [EmployeeController::class, 'employee_store'])
        ->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)
        ->name('employees.employee_store');

    // GET all employees
    Route::get('/employee-get', [EmployeeController::class, 'get_employees'])
        ->name('employees.get_employees');

    // UPDATE employee
    Route::put('/employee-update/{employee_p_id}', [EmployeeController::class, 'employee_update'])
        ->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)
        ->name('employees.employee_update');

    // Delete Employee
    Route::delete('/employee-delete/{employee_p_id}', [EmployeeController::class, 'employee_delete'])
        ->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)
        ->name('employees.employee_delete');
});

// needed for cors since the system didn't use laravel blade
Route::get('/csrf-token', function () {
    return response()->json([
        'token' => csrf_token()
    ]);
});