<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view posts', 'create posts', 'edit posts', 'delete posts',
            'view categories', 'create categories', 'edit categories', 'delete categories',
            'view tags', 'create tags', 'edit tags', 'delete tags',
            'view users', 'create users', 'edit users', 'delete users',
            'view payments', 'manage payments',
            'view settings', 'manage settings',
            'view analytics',
            'view images', 'upload images', 'delete images',
            'view videos', 'create videos', 'edit videos', 'delete videos',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        $user = Role::create(['name' => 'user']);
        $user->givePermissionTo([
            'view posts', 'view categories', 'view tags',
            'view images', 'upload images',
            'view videos',
        ]);

        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo(Permission::all());
    }
}
