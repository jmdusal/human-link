<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tag\StoreTagRequest;
use App\Http\Requests\Tag\UpdateTagRequest;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\JsonResponse;

class TagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tag = Tag::where('workspace_id', $request->workspace_id)->get();

        return response()->json([
            'data' => $tag
        ], 200);
    }

    public function store(StoreTagRequest $request): JsonResponse
    {
        $tag = DB::transaction(function () use ($request) {
            return Tag::create($request->validated());
        });

        return response()->json([
            'message' => 'Tag created successfully.',
            'data' => $tag
        ], 201);
    }

    public function update(UpdateTagRequest $request, Tag $tag): JsonResponse
    {
        $tag = DB::transaction(function () use ($request, $tag) {
            $tag->update($request->validated());
            return $tag;
        });

        return response()->json([
            'message' => 'Tag updated successfully.',
            'data' => $tag
        ], 200);
    }

    public function destroy(Tag $tag): JsonResponse
    {
        $tag->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Tag deleted successfully'
        ], 200);
    }
}
