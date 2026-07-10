<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\TagServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tag\StoreTagRequest;
use App\Http\Requests\Tag\UpdateTagRequest;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function __construct(
        private TagServiceInterface $tagService
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->tagService->listByWorkspace(
                $request->integer('workspace_id') ?: null
            ),
        ], 200);
    }

    public function store(StoreTagRequest $request): JsonResponse
    {
        $tag = $this->tagService->create($request->validated());

        return response()->json([
            'message' => 'Tag created successfully.',
            'data' => $tag,
        ], 201);
    }

    public function update(UpdateTagRequest $request, Tag $tag): JsonResponse
    {
        $tag = $this->tagService->update($tag, $request->validated());

        return response()->json([
            'message' => 'Tag updated successfully.',
            'data' => $tag,
        ], 200);
    }

    public function destroy(Tag $tag): JsonResponse
    {
        $this->tagService->delete($tag);

        return response()->json([
            'status' => 'success',
            'message' => 'Tag deleted successfully',
        ], 200);
    }
}
