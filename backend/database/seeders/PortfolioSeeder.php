<?php

namespace Database\Seeders;

use App\Models\Portfolio;
use Illuminate\Database\Seeder;

class PortfolioSeeder extends Seeder
{
    public function run(): void
    {
        Portfolio::create(['name' => 'Alex Studio', 'domain' => 'alex-studio.com', 'status' => 'live', 'order' => 0]);
        Portfolio::create(['name' => 'Nova Events', 'domain' => 'nova-events.sa', 'status' => 'live', 'order' => 1]);
        Portfolio::create(['name' => 'Reef Bahrain', 'domain' => 'reef-bahrain.io', 'status' => 'draft', 'order' => 2]);
        Portfolio::create(['name' => 'Skyline Labs', 'domain' => null, 'status' => 'draft', 'order' => 3]);
    }
}
