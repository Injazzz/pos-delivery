<?php

// Load Laravel
require __DIR__ . '/bootstrap/app.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get authenticated user
$user = App\Models\User::first();
if (!$user) {
    echo "No user found\n";
    exit(1);
}

echo "Testing broadcast auth for user: " . $user->email . "\n";
echo "User role: " . $user->role->value . "\n";

// Simulate broadcasting auth request
$request = Illuminate\Http\Request::create(
    '/api/broadcasting/auth',
    'POST',
    ['channel_name' => 'cashier']
);

$request->setUserResolver(fn() => $user);

// Try to auth
try {
    echo "Attempting to authorize cashier channel...\n";
    
    // Call channels.php logic directly
    $result = resolve('channels')->authorize('cashier', $user);
    
    echo $result ? "✓ AUTHORIZED\n" : "✗ NOT AUTHORIZED\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
