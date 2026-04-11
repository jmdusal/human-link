<?php

namespace App\Http\Controllers;

use App\Models\Status;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class StatusController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = Status::where('workspace_id', $request->workspace_id)->get();

        return response()->json([
            'data' => $status
        ], 200);
    }
}
