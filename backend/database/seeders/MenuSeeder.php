<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $dashboard = Menu::create(['label' => 'Dashboard', 'icon' => 'LayoutDashboard', 'route_path' => '/dashboard', 'order' => 0]);

        $content = Menu::create(['label' => 'Content', 'icon' => 'FileText', 'route_path' => null, 'order' => 1]);
        $pages = Menu::create(['label' => 'Pages', 'icon' => 'Layers', 'route_path' => '/dashboard/pages', 'parent_id' => $content->id, 'order' => 0]);
        $sections = Menu::create(['label' => 'Sections', 'icon' => 'LayoutGrid', 'route_path' => '/dashboard/sections', 'parent_id' => $content->id, 'order' => 1]);
        $hero = Menu::create(['label' => 'Hero Block', 'icon' => 'Star', 'route_path' => '/dashboard/sections/hero', 'parent_id' => $sections->id, 'order' => 0]);
        $about = Menu::create(['label' => 'About Block', 'icon' => 'Info', 'route_path' => '/dashboard/sections/about', 'parent_id' => $sections->id, 'order' => 1]);
        $portfolio = Menu::create(['label' => 'Portfolio', 'icon' => 'Briefcase', 'route_path' => '/dashboard/portfolio', 'parent_id' => $content->id, 'order' => 2]);

        $menus = Menu::create(['label' => 'Menus', 'icon' => 'Menu', 'route_path' => '/dashboard/menus', 'order' => 2]);

        $settings = Menu::create(['label' => 'Settings', 'icon' => 'Settings', 'route_path' => null, 'order' => 3]);
        $general = Menu::create(['label' => 'General', 'icon' => 'Sliders', 'route_path' => '/dashboard/settings/general', 'parent_id' => $settings->id, 'order' => 0]);
        $seo = Menu::create(['label' => 'SEO', 'icon' => 'Search', 'route_path' => '/dashboard/settings/seo', 'parent_id' => $settings->id, 'order' => 1]);
        $socials = Menu::create(['label' => 'Social Links', 'icon' => 'Share2', 'route_path' => '/dashboard/settings/socials', 'parent_id' => $settings->id, 'order' => 2]);
    }
}
