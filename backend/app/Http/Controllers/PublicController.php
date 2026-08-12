<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\NavbarTemplate;
use App\Models\Portfolio;
use Illuminate\Http\JsonResponse;

class PublicController extends Controller
{
    public function portfolio(string $id): JsonResponse
    {
        $portfolio = Portfolio::where('id', $id)->where('status', 'live')->firstOrFail();

        $pages = $portfolio->pages()
            ->where('status', 'published')
            ->orderBy('order')
            ->get(['id', 'title', 'slug', 'order']);

        return response()->json([
            'id'   => $portfolio->id,
            'name' => $portfolio->name,
            'domain' => $portfolio->domain,
            'pages' => $pages,
        ]);
    }

    public function page(string $portfolioId, string $pageId): JsonResponse
    {
        $portfolio = Portfolio::where('id', $portfolioId)->where('status', 'live')->firstOrFail();

        $page = $portfolio->pages()
            ->where('id', $pageId)
            ->where('status', 'published')
            ->firstOrFail();

        $sections = $page->sections()->ordered()->get();

        return response()->json([
            'id'            => $page->id,
            'title'         => $page->title,
            'slug'          => $page->slug,
            'sections'      => $sections,
            'model_config'  => $page->model_config,
        ]);
    }

    public function pageBySlug(string $portfolioId, string $slug): JsonResponse
    {
        $portfolio = Portfolio::where('id', $portfolioId)->where('status', 'live')->firstOrFail();

        $page = $portfolio->pages()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        $sections = $page->sections()->ordered()->get();

        return response()->json([
            'id'            => $page->id,
            'title'         => $page->title,
            'slug'          => $page->slug,
            'sections'      => $sections,
            'model_config'  => $page->model_config,
        ]);
    }

    public function menus(string $id): JsonResponse
    {
        $portfolio = Portfolio::where('id', $id)->where('status', 'live')->firstOrFail();

        $flat = Menu::where('portfolio_id', $id)
            ->where('is_active', true)
            ->get()
            ->toArray();

        $tree = Menu::buildNestedTree($flat);

        return response()->json($tree);
    }

    public function navbarTemplate(string $id): JsonResponse
    {
        $portfolio = Portfolio::where('id', $id)->where('status', 'live')->firstOrFail();

        $template = $portfolio->navbarTemplate;

        $config = $template
            ? $template->resolvedConfig()
            : NavbarTemplate::defaultConfig();

        return response()->json($config);
    }
}
