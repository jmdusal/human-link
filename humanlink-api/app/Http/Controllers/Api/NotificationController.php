<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\CompanyContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function __construct(
        private CompanyContext $companyContext,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = $request->user()
            ->notifications()
            ->latest();

        $this->constrainToActiveCompany($query);

        $notifications = $query
            ->limit(30)
            ->get()
            ->map(fn (DatabaseNotification $notification): array => [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? 'Notification',
                'message' => $notification->data['message'] ?? null,
                'time' => $notification->created_at?->diffForHumans(),
                'read' => $notification->read_at !== null,
                'type' => $notification->data['type'] ?? null,
                'company_id' => $notification->company_id ?? $notification->data['company_id'] ?? null,
                'leave_request_id' => $notification->data['leave_request_id'] ?? null,
                'payslip_id' => $notification->data['payslip_id'] ?? null,
                'workspace_id' => $notification->data['workspace_id'] ?? null,
                'workspace_slug' => $notification->data['workspace_slug'] ?? null,
                'invitation_token' => $notification->data['invitation_token'] ?? null,
                'task_id' => $notification->data['task_id'] ?? null,
                'project_id' => $notification->data['project_id'] ?? null,
                'created_at' => $notification->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'data' => $notifications,
        ]);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $query = $request->user()
            ->notifications()
            ->where('id', $id);

        $this->constrainToActiveCompany($query);

        $notification = $query->firstOrFail();
        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read.',
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $query = $request->user()->unreadNotifications();
        $this->constrainToActiveCompany($query);
        $query->get()->markAsRead();

        return response()->json([
            'message' => 'All notifications marked as read.',
        ]);
    }

    protected function constrainToActiveCompany($query): void
    {
        if (! $this->companyContext->shouldScope()) {
            return;
        }

        $query->where('company_id', $this->companyContext->id());
    }
}
