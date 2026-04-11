<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveBalance;
use App\Models\LeavePolicy;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class LeaveController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'policies' => LeavePolicy::latest()->get(),
                'balances' => LeaveBalance::with(['user:id,name,email', 'leavePolicy:id,name'])
                    ->where('year', date('Y'))
                    ->latest()
                    ->get(),
                'requests' => LeaveRequest::with(['user:id,name', 'leavePolicy:id,name'])
                    ->latest()
                    ->get(),
            ]
        ]);
    }
}
