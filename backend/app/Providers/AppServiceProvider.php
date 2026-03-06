<?php

namespace App\Providers;

use App\Models\Menu;
use App\Models\Order;
use App\Models\User;
use App\Policies\MenuPolicy;
use App\Policies\OrderPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Menu::class, MenuPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
    }
}
