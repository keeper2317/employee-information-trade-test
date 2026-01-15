<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Employee extends Model
{

    protected $primaryKey = 'employee_p_id';

    protected $guarded = ['employee_p_id'];

    // incase na needed
    protected $fillable = [
        'employee_id',
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'date_hired',
        'phone',
        'position',
        'department',
        'salary',
        'status'
    ];

    // number generator for employee_id
    public static function generateEmployeeId(): string
    {
        $year = now()->year;

        $last = DB::table('employees')
            ->whereYear('created_at', $year)
            ->lockForUpdate()
            ->orderByDesc('employee_p_id')
            ->value('employee_id');

        $number = 1;

        if ($last) {
            $number = (int) substr($last, -5) + 1;
        }

        return 'EMP-' . $year . '-' . str_pad($number, 5, '0', STR_PAD_LEFT);
    }
}
