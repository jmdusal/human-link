<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $start = $request->query('start', now()->startOfMonth()->toDateString());
        $end = $request->query('end', now()->endOfMonth()->toDateString());

        $schedules = Schedule::with('user:id,name')
            ->where(function($q) use ($start, $end) {
                $q->where('start_date', '<=', $end)
                ->where(function($query) use ($start) {
                    $query->whereNull('end_date')
                            ->orWhere('end_date', '>=', $start);
                });
            })
            ->latest()
            ->get();

        return response()->json([
            'data' => $schedules,
            'meta' => [
                'start' => $start,
                'end' => $end
            ]
        ]);
    }

    // public function store(Request $request)
    // {
    //     //
    // }

    // public function show(string $id)
    // {
    //     //
    // }

    // public function update(Request $request, string $id)
    // {
    //     //
    // }

    // public function destroy(string $id)
    // {
    //     //
    // }
}
