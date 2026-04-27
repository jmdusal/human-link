<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Workspace\StoreWorkspaceRequest;
use App\Http\Requests\Workspace\UpdateWorkspaceRequest;
use App\Mail\WorkspaceInvitation;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class WorkspaceController extends Controller
{
    public function index(): JsonResponse
    {
        $workspaces = Workspace::with([
            'owner',
            'members',
            'tags',
            'statuses',
            'projects.projectMembers',
            'projects.tasks.assignees',
            'projects.tasks.tags:id,name,color',
            'projects.tasks.comments' => function($query) {
                $query->whereNull('parent_id')->with('user', 'replies.user')->latest();
            }
        ])
        ->latest()
        ->get();

        return response()->json([
            'data' => $workspaces
        ], 200);
    }

    public function store(StoreWorkspaceRequest $request): JsonResponse
    {
        $workspace = DB::transaction(function () use ($request) {
            $data = array_merge($request->validated(), [
                'slug' => Str::slug($request->name),
                'owner_id' => Auth::id(),
            ]);

            $workspace = Workspace::create($data);
            $workspace->members()->attach(Auth::id(), ['role' => 'owner']);
            // $memberIds = collect($request->members)->pluck('id');

            if ($request->has('members')) {
                $memberIds = collect($request->members)
                    ->pluck('id')
                    ->reject(fn($id) => $id == Auth::id())
                    ->values();

                // Log::info('Member IDs found in request:', $memberIds->toArray());

                $membersWithRoles = $memberIds->mapWithKeys(function ($id) {
                    return [$id => ['role' => 'member']];
                })->toArray();

                $workspace->members()->syncWithoutDetaching($membersWithRoles);

                $newMembers = User::whereIn('id', $memberIds)->get();

                // Log::info('Users found for emailing:', ['count' => $newMembers->count(), 'emails' => $newMembers->pluck('email')]);
                // foreach ($newMembers as $user) {
                //     Log::info('Queueing email for user: ' . $user->email);
                //     // Mail::to($user->email)->later(now()->addSeconds($index * 2), new WorkspaceInvitation($workspace, $user));
                //     Mail::to($user->email)->queue(new WorkspaceInvitation($workspace, $user));

                //     sleep(2);
                // }
            }

            // statuses default
            $workspace->statuses()->createMany([
                ['name' => 'Todo', 'color_hex' => '#3b82f6', 'position' => 0],
                ['name' => 'In Progress', 'color_hex' => '#f59e0b', 'position' => 1],
                ['name' => 'Done', 'color_hex' => '#10b981', 'position' => 2],
            ]);

            // tags default
            $workspace->tags()->createMany([
                ['name' => 'Bug', 'color' => '#ef4444'],
                ['name' => 'Enhancement', 'color' => '#3b82f6'],
                ['name' => 'Feature', 'color' => '#10b981'],
                ['name' => 'Refactor', 'color' => '#8b5cf6'],
            ]);

            return $workspace;
        });

        return response()->json([
            'message' => 'Workspace created successfully.',
            'data' => $workspace->load('statuses', 'tags', 'members', 'projects')
        ], 201);
    }

    public function update(UpdateWorkspaceRequest $request, Workspace $workspace): JsonResponse
    {
        $workspace = DB::transaction(function () use ($request, $workspace) {
            // check if the current user owns this workspace
            // if ($workspace->owner_id !== Auth::id()) abort(403);
            $data = $request->validated();

            if ($request->has('name')) {
                $data['slug'] = Str::slug($request->name);
            }

            if ($request->has('members')) {
                $existingMemberIds = $workspace->members()->pluck('users.id')->toArray();

                $syncData = collect($request->members)->mapWithKeys(function ($member) use ($workspace) {
                    $id = $member['id'];
                    if ($id == $workspace->owner_id) return [$id => ['role' => 'owner']];

                    $role = $member['pivot']['role'] ?? 'member';
                    return [$id => ['role' => $role]];
                })->toArray();

                if (!isset($syncData[$workspace->owner_id])) {
                    $syncData[$workspace->owner_id] = ['role' => 'owner'];
                }

                $workspace->members()->sync($syncData);

                $newMemberIds = array_diff(array_keys($syncData), $existingMemberIds);

                if (!empty($newMemberIds)) {
                    $newMembers = User::whereIn('id', $newMemberIds)->get();
                    foreach ($newMembers as $user) {
                        Mail::to($user->email)->queue(new WorkspaceInvitation($workspace, $user));
                    }
                }
            }

            $workspace->update($data);
            return $workspace;
        });

        return response()->json([
            'message' => 'Workspace updated successfully.',
            'data' => $workspace->load(['statuses', 'tags', 'members', 'projects'])
        ], 200);
    }

    public function showBySlug(string $slug): JsonResponse
    {
        $workspace = Workspace::with([
            'owner',
            'members',
            'tags',
            'statuses',
            'projects.projectMembers',
            // 'projects.tasks.assignees',
            // 'projects.tasks.tags:id,name,color',
            'projects.tasks' => function($query) {
                $query->with(['assignees', 'tags:id,name,color', 'subtasks']);
            },


            'projects.tasks.comments' => function($query) {
                $query->whereNull('parent_id')->with('user', 'replies.user')->latest();
            }


            ])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'data' => $workspace
        ], 200);
    }

    public function destroy(Workspace $workspace): JsonResponse
    {
        $workspace->delete();

        return response()->json([
            'message' => 'Workspace deleted successfully'
        ], 200);
    }
}
