<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Contracts\LeaveRequestServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    public function __construct(
        private LeaveRequestServiceInterface $leaveRequestService
    ) {}

    public function index(): void
    {
        //
    }

    public function store(Request $request): void
    {
        //
    }

    public function show(string $id): void
    {
        //
    }

    public function update(Request $request, string $id): void
    {
        //
    }

    public function destroy(string $id): void
    {
        //
    }
}
