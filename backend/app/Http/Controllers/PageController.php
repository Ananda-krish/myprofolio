<?php

namespace App\Http\Controllers;

use App\Events\PageUpdated;
use App\Models\Page;
use App\Models\Portfolio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PageController extends Controller
{
    public function index(Request $request, Portfolio $portfolio): JsonResponse
    {
        $pages = $portfolio->pages()->ordered()->get();

        return response()->json($pages);
    }

    public function store(Request $request, Portfolio $portfolio): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => [
                'nullable', 'string', 'max:255',
                Rule::unique('pages', 'slug')->where(fn ($q) => $q->where('portfolio_id', $portfolio->id)),
            ],
            'status' => 'required|in:published,draft',
        ]);

        $validated['portfolio_id'] = $portfolio->id;

        $page = Page::create($validated);

        $pages = $portfolio->pages()->ordered()->get()->toArray();
        broadcast(new PageUpdated('created', $portfolio->id, $page, $pages));

        return response()->json($page, 201);
    }

    public function show(Portfolio $portfolio, Page $page): JsonResponse
    {
        return response()->json($page);
    }

    public function update(Request $request, Portfolio $portfolio, Page $page): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => [
                'nullable', 'string', 'max:255',
                Rule::unique('pages', 'slug')
                    ->where(fn ($q) => $q->where('portfolio_id', $portfolio->id))
                    ->ignore($page->id),
            ],
            'status' => 'sometimes|required|in:published,draft',
        ]);

        $page->update($validated);

        $pages = $portfolio->pages()->ordered()->get()->toArray();
        broadcast(new PageUpdated('updated', $portfolio->id, $page, $pages));

        return response()->json($page);
    }

    public function destroy(Portfolio $portfolio, Page $page): JsonResponse
    {
        $page->delete();

        $pages = $portfolio->pages()->ordered()->get()->toArray();
        broadcast(new PageUpdated('deleted', $portfolio->id, null, $pages));

        return response()->json(['message' => 'Page deleted.']);
    }

    public function reorder(Request $request, Portfolio $portfolio): JsonResponse
    {
        $validated = $request->validate([
            'moves' => 'required|array',
            'moves.*.id' => 'required|exists:pages,id',
            'moves.*.order' => 'required|integer|min:0',
        ]);

        Page::reorder($validated['moves']);

        $pages = $portfolio->pages()->ordered()->get();
        broadcast(new PageUpdated('reordered', $portfolio->id, null, $pages->toArray()));

        return response()->json($pages);
    }

    public function uploadModel(Request $request, Portfolio $portfolio, Page $page): JsonResponse
    {
        $validated = $request->validate([
            'model' => 'required|file|mimes:glb|max:15360',
        ]);

        $page->clearMediaCollection('page_model');

        $page
            ->addMediaFromRequest('model')
            ->usingName($request->file('model')->getClientOriginalName())
            ->toMediaCollection('page_model');

        $media = $page->getFirstMedia('page_model');
        $glbUrl = $request->getSchemeAndHttpHost() . '/storage/' . $media->getPath();

        $config = $page->model_config ?? Page::defaultModelConfig();
        $config['glb_url'] = $glbUrl;
        $page->update(['model_config' => $config]);

        broadcast(new PageUpdated('updated', $portfolio->id, $page, null));

        return response()->json($page);
    }

    public function updateModelConfig(Request $request, Portfolio $portfolio, Page $page): JsonResponse
    {
        $validated = $request->validate([
            'idle' => 'sometimes|array',
            'idle.rotation_speed' => 'sometimes|numeric|min:0|max:1',
            'hover' => 'sometimes|array',
            'hover.scale' => 'sometimes|numeric|min:1|max:2',
            'hover.color' => 'nullable|string|max:20',
        ]);

        $config = $page->model_config ?? Page::defaultModelConfig();

        if (isset($validated['idle'])) {
            $config['idle'] = array_merge($config['idle'] ?? ['rotation_speed' => 0.2], $validated['idle']);
        }
        if (isset($validated['hover'])) {
            $config['hover'] = array_merge($config['hover'] ?? ['scale' => 1.15, 'color' => null], $validated['hover']);
        }

        $page->update(['model_config' => $config]);

        broadcast(new PageUpdated('updated', $portfolio->id, $page, null));

        return response()->json($page);
    }

    public function deleteModel(Portfolio $portfolio, Page $page): JsonResponse
    {
        $page->clearMediaCollection('page_model');
        $page->update(['model_config' => null]);

        broadcast(new PageUpdated('updated', $portfolio->id, $page, null));

        return response()->json($page);
    }
}
