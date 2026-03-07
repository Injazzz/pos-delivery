<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';

use Illuminate\Foundation\Facades\Facade;
use App\Models\User;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get manager user
$user = User::where('email', 'manager@pos.com')->first();

if (!$user) {
    echo "Manager user not found\n";
    exit(1);
}

echo "User ID: " . $user->id . "\n";
echo "User Email: " . $user->email . "\n";
echo "User Role: " . $user->role . "\n";
echo "User Role Value: " . $user->role->value . "\n";

// Test channel authorization
$channels = ['manager', 'cashier', 'order.1'];

foreach ($channels as $channel) {
    echo "\n--- Testing channel: $channel ---\n";
    
    // Load the channel authorization callbacks
    include __DIR__ . '/routes/channels.php';
    
    // Get the callback from Broadcast facade
    $callbacks = \Illuminate\Support\Facades\Broadcast::getChannels();
    echo "Available channels: " . json_encode(array_keys($callbacks)) . "\n";
}
