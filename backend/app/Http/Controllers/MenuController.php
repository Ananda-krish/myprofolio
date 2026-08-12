<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Menu;

class MenuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Menu::query();

        if ($request->has('portfolio_id')) {
            $portfolioId = $request->portfolio_id;
            $query->where('portfolio_id', $portfolioId);
        } else {
            $query->whereNull('portfolio_id');
        }

        $flat = $query->get()->toArray();
        $tree = Menu::buildNestedTree($flat);

        return response()->json($tree);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label'       => 'required|string|max:255',
            'icon'        => 'nullable|string|max:255',
            'route_path'  => 'nullable|string|max:255',
            'parent_id'   => 'nullable|exists:menus,id',
            'order'       => 'nullable|integer|min:0',
            'is_active'   => 'nullable|boolean',
            'portfolio_id' => 'nullable|exists:portfolios,id',
            'link_type'   => 'nullable|string|in:page,external',
            'style'       => 'nullable|array',
            'style.color' => 'nullable|string',
            'style.bold'  => 'nullable|boolean',
            'style.fontSize' => 'nullable|string|in:xs,sm,md,lg',
            'style.split_fill' => 'nullable|array',
            'style.split_fill.enabled' => 'nullable|boolean',
            'style.split_fill.top_color' => 'nullable|string',
            'style.split_fill.bottom_color' => 'nullable|string',
            'style.split_fill.split_percent' => 'nullable|integer|min:0|max:100',
        ]);

        $maxOrder = Menu::where('parent_id', $validated['parent_id'] ?? null)
            ->where('portfolio_id', $validated['portfolio_id'] ?? null)
            ->max('order') ?? -1;
        $validated['order'] = $validated['order'] ?? ($maxOrder + 1);
        $validated['link_type'] = $validated['link_type'] ?? 'page';

        if (isset($validated['style'])) {
            $validated['style'] = array_replace_recursive(Menu::defaultStyle(), $validated['style']);
        }

        $menu = Menu::create($validated);

        return response()->json($menu, 201);
    }

    public function show(Menu $menu): JsonResponse
    {
        return response()->json($menu);
    }

    public function update(Request $request, Menu $menu): JsonResponse
    {
        $validated = $request->validate([
            'label'       => 'sometimes|string|max:255',
            'icon'        => 'nullable|string|max:255',
            'route_path'  => 'nullable|string|max:255',
            'parent_id'   => 'nullable|exists:menus,id',
            'order'       => 'nullable|integer|min:0',
            'is_active'   => 'nullable|boolean',
            'portfolio_id' => 'nullable|exists:portfolios,id',
            'link_type'   => 'nullable|string|in:page,external',
            'style'       => 'nullable|array',
            'style.color' => 'nullable|string',
            'style.bold'  => 'nullable|boolean',
            'style.fontSize' => 'nullable|string|in:xs,sm,md,lg',
            'style.split_fill' => 'nullable|array',
            'style.split_fill.enabled' => 'nullable|boolean',
            'style.split_fill.top_color' => 'nullable|string',
            'style.split_fill.bottom_color' => 'nullable|string',
            'style.split_fill.split_percent' => 'nullable|integer|min:0|max:100',
        ]);

        if (isset($validated['style'])) {
            $validated['style'] = array_replace_recursive(Menu::defaultStyle(), $validated['style']);
        }

        $menu->update($validated);

        return response()->json($menu);
    }

    public function destroy(Menu $menu): JsonResponse
    {
        $menu->delete();

        return response()->json(['message' => 'Menu deleted.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'moves' => 'required|array',
            'moves.*.id' => 'required|exists:menus,id',
            'moves.*.parent_id' => 'nullable|exists:menus,id',
            'moves.*.order' => 'required|integer|min:0',
        ]);

        Menu::reorder($validated['moves']);

        $portfolioId = Menu::find($validated['moves'][0]['id'] ?? null)?->portfolio_id;

        $query = Menu::query();
        if ($portfolioId) {
            $query->where('portfolio_id', $portfolioId);
        } else {
            $query->whereNull('portfolio_id');
        }

        $flat = $query->get()->toArray();
        $tree = Menu::buildNestedTree($flat);

        return response()->json($tree);
    }
}
