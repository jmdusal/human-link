<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\LeavePolicy\StoreLeavePolicyRequest;
use App\Http\Requests\LeavePolicy\UpdateLeavePolicyRequest;
use Illuminate\Http\JsonResponse;
use App\Models\LeavePolicy;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;


class LeavePolicyController extends Controller
{
    public function index(): JsonResponse
    {
        $leavePolicy = LeavePolicy::latest()->get();

        return response()->json([
            'data' => $leavePolicy
        ], 200);
    }

    public function store(StoreLeavePolicyRequest $request): JsonResponse
    {
        $leavePolicy = DB::transaction(function () use ($request) {
            $data = array_merge($request->validated(), [
                'slug' => Str::slug($request->name)
            ]);

            return LeavePolicy::create($data);
        });

        return response()->json([
            'message' => 'Leave policy created successfully.',
            'data' => $leavePolicy
        ], 201);
    }

    public function update(UpdateLeavePolicyRequest $request, LeavePolicy $leavePolicy): JsonResponse
    {
        $leavePolicy = DB::transaction(function () use ($request, $leavePolicy) {
            $data = $request->validated();

            if ($request->has('name')) {
                $data['slug'] = Str::slug($request->name);
            }

            $leavePolicy->update($data);

            return $leavePolicy;
        });

        return response()->json([
            'message' => 'Leave policy updated successfully.',
            'data' => $leavePolicy
        ], 200);
    }

    public function destroy(LeavePolicy $leavePolicy): JsonResponse
    {
        $leavePolicy->delete();

        return response()->json([
            'message' => 'Leave Policy deleted successfully'
        ], 200);
    }
}
