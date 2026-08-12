<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::firstOrCreate(
            ['email' => 'admin@myprofolio.test'],
            [
                'name' => 'Test Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        $this->command->info('Test admin created:');
        $this->command->info('  Email:    admin@myprofolio.test');
        $this->command->info('  Password: password');
    }
}
