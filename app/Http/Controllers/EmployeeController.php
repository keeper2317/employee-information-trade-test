<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Employee;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    public function employee_store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name'  => 'required|string|max:255|regex:/^[a-zA-Z\s\-]+$/',
            'middle_name' => 'nullable|string|max:255|regex:/^[a-zA-Z\s\-]+$/',
            'last_name'   => 'required|string|max:255|regex:/^[a-zA-Z\s\-]+$/',
            'email'       => 'required|email|max:255|unique:employees,email',
            'date_hired'  => 'required|date',
            'phone'       => 'nullable|regex:/^09\d{9}$/',
            'position'    => 'nullable|string|max:255',
            'department'  => 'nullable|string|max:255',
            'salary'      => 'nullable|numeric|min:15000',
        ]);

        // sending errors in json to see in console
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        // creating a new employee/row
        $employee = DB::transaction(function () use ($validator) {
            return Employee::create(array_merge(
                $validator->validated(),
                ['employee_id' => Employee::generateEmployeeId()]
            ));
        });

        // caching, when cache has already stored data, it will update.
        Cache::forget('employees:all');

        Cache::put(
            "employees:{$employee->employee_p_id}",
            $employee,
            now()->addMinutes(30)
        );

        return response()->json([
            'message' => 'Employee created successfully',
            'data'    => $employee
        ], 201);
    }

    public function get_employees()
    {
        // try and catch method incase there some error in the database, also using caching
        try {
            $employees = Cache::remember(
                'employees:all',
                now()->addMinutes(30),
                function () {
                    return Employee::orderBy('employee_p_id', 'desc')->get();
                }
            );

            return response()->json([
                'data' => $employees
            ], 200);

        } catch (\Throwable $e) {

            Log::error('Failed to fetch employees', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to fetch employees',
                'error' => 'Something went wrong'
            ], 500);
        }
    }

    public function employee_update(Request $request, $employee_p_id)
    {
        $employee = Employee::findOrFail($employee_p_id);

        // used a reusable modal so that what is input, it is the same to update, though it added status of the employee
        $validator = Validator::make($request->all(), [
            'first_name'  => 'required|string|max:255|regex:/^[a-zA-Z\s\-]+$/',
            'middle_name' => 'nullable|string|max:255|regex:/^[a-zA-Z\s\-]+$/',
            'last_name'   => 'required|string|max:255|regex:/^[a-zA-Z\s\-]+$/',
            'email'       => 'required|email|max:255|unique:employees,email,' . $employee->employee_p_id . ',employee_p_id',
            'date_hired'  => 'required|date',
            'phone'       => 'nullable|regex:/^09\d{9}$/|unique:employees,phone,' . $employee->employee_p_id . ',employee_p_id',
            'position'    => 'nullable|string|max:255',
            'department'  => 'nullable|string|max:255',
            'salary'      => 'nullable|numeric|min:0',
            'status'      => 'required|in:active,resigned,terminated',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        DB::transaction(function () use ($employee, $validator) {
            $employee->update($validator->validated());
        });

        // caching
        Cache::forget('employees:all');
        Cache::forget("employees:{$employee->employee_p_id}");

        return response()->json([
            'message' => 'Employee updated successfully',
            'data'    => $employee->fresh()
        ], 200);
    }
    
    public function employee_delete($employee_p_id)
    {
        $employee = Employee::findOrFail($employee_p_id);

        DB::transaction(function () use ($employee) {
            $employee->delete();
        });

        Cache::forget('employees:all');
        Cache::forget("employees:{$employee->employee_p_id}");

        return response()->json([
            'message' => 'Employee deleted successfully'
        ], 200);
    }
}
