<?php

namespace Database\Seeders;

use App\Models\Page;
use App\Models\Section;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $home = Page::firstOrCreate(
            ['slug' => 'home', 'portfolio_id' => 1],
            ['title' => 'Home', 'status' => 'published', 'order' => 0]
        );

        Section::create([
            'page_id' => $home->id,
            'type' => 'hero',
            'order' => 0,
            'content' => [
                'heading' => 'Alex Studio',
                'subheading' => 'Creative design and development studio',
                'background_image' => null,
                'cta_text' => 'View Our Work',
                'cta_link' => '/portfolio',
            ],
        ]);

        Section::create([
            'page_id' => $home->id,
            'type' => 'text',
            'order' => 1,
            'content' => [
                'body' => 'We are a multidisciplinary studio focused on branding, web design, and digital experiences. Our team brings ideas to life through thoughtful design and clean code.',
            ],
        ]);

        $about = Page::firstOrCreate(
            ['slug' => 'about', 'portfolio_id' => 1],
            ['title' => 'About', 'status' => 'published', 'order' => 1]
        );

        Section::create([
            'page_id' => $about->id,
            'type' => 'hero',
            'order' => 0,
            'content' => [
                'heading' => 'About Us',
                'subheading' => 'Our story and mission',
                'background_image' => null,
                'cta_text' => null,
                'cta_link' => null,
            ],
        ]);

        Section::create([
            'page_id' => $about->id,
            'type' => 'gallery',
            'order' => 1,
            'content' => [
                'images' => [
                    ['url' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800', 'caption' => 'Our team collaborating'],
                    ['url' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 'caption' => 'Studio workspace'],
                ],
            ],
        ]);
    }
}
