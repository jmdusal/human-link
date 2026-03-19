<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Activitylog\Models\Activity;


class ActivityLogController extends Controller
{
    public function index(): JsonResponse
    {
        // $activities = Activity::with('causer')->latest()->get();
        $activities = Activity::with('causer')->latest()->get()->map(function ($activity) {
            return [
                'id' => $activity->id,
                'description' => $activity->description,
                'subjectType' => class_basename($activity->subject_type),
                'properties' => $activity->properties,
                'causer' => $activity->causer ? [
                    'name' => $activity->causer->name,
                    'email' => $activity->causer->email,
                ] : null,
                'createdAt' => $activity->created_at,
            ];
        });

        return response()->json([
            'data' => $activities
        ], 200);
    }
}
