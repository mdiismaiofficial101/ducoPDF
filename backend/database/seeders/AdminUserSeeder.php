<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@docupdf.com',
            'password' => Hash::make('Admin@123'),
            'email_verified_at' => now(),
        ]);

        $admin->assignRole('admin');

        // Demo user
        $user = User::create([
            'name' => 'User',
            'email' => 'user@docupdf.com',
            'password' => Hash::make('User@123'),
            'email_verified_at' => now(),
        ]);

        $user->assignRole('user');
    }
}
