<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class UserController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly UserService $userService
    ) {}

    /**
     * GET /api/manager/users
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', User::class);

        $users = $this->userService->getAll($request->only([
            'search', 'role', 'status',
            'sort_by', 'sort_dir', 'per_page',
        ]));

        return UserResource::collection($users)
            ->additional([
                'summary' => $this->userService->getSummary(),
            ]);
    }

    /**
     * POST /api/manager/users
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $user = $this->userService->create($request->validated());

        return response()->json([
            'message' => 'User berhasil dibuat.',
            'data'    => new UserResource($user),
        ], 201);
    }

    /**
     * GET /api/manager/users/{user}
     */
    public function show(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return response()->json([
            'data' => new UserResource($user->load('customer')),
        ]);
    }

    /**
     * PUT /api/manager/users/{user}
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $updated = $this->userService->update($user, $request->validated());

        return response()->json([
            'message' => 'User berhasil diperbarui.',
            'data'    => new UserResource($updated),
        ]);
    }

    /**
     * DELETE /api/manager/users/{user}
     */
    public function destroy(User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $this->userService->delete($user);

        return response()->json([
            'message' => 'User berhasil dihapus.',
        ]);
    }

    /**
     * PATCH /api/manager/users/{user}/toggle-status
     */
    public function toggleStatus(User $user): JsonResponse
    {
        $this->authorize('toggleStatus', $user);

        $updated = $this->userService->toggleStatus($user);

        $statusText = $updated->status === 'active' ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'message' => "User {$statusText}.",
            'data'    => new UserResource($updated),
        ]);
    }

    /**
     * POST /api/manager/users/{user}/reset-password
     */
    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $this->userService->resetPassword($user, $validated['password']);

        return response()->json([
            'message' => 'Password user berhasil direset.',
        ]);
    }
}
