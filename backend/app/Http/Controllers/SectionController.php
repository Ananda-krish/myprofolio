<?php

namespace App\Http\Controllers;

use App\Events\SectionUpdated;
use App\Models\Page;
use App\Models\Portfolio;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SectionController extends Controller
{
    public function index(Portfolio $portfolio, Page $page): JsonResponse
    {
        $sections = $page->sections()->ordered()->get();

        return response()->json($sections);
    }

    public function store(Request $request, Portfolio $portfolio, Page $page): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:hero,text,gallery',
            'content' => 'required|array',
        ]);

        Section::validateContent($validated['type'], $validated['content']);

        $validated['page_id'] = $page->id;

        $section = Section::create($validated);

        $sections = $page->sections()->ordered()->get()->toArray();
        broadcast(new SectionUpdated('created', $portfolio->id, $page->id, $section, $sections));

        return response()->json($section, 201);
    }

    public function show(Portfolio $portfolio, Page $page, Section $section): JsonResponse
    {
        return response()->json($section);
    }

    public function update(Request $request, Portfolio $portfolio, Page $page, Section $section): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'sometimes|required|in:hero,text,gallery',
            'content' => 'sometimes|required|array',
        ]);

        $type = $validated['type'] ?? $section->type;
        $content = $validated['content'] ?? $section->content;

        Section::validateContent($type, $content);

        $section->update(['type' => $type, 'content' => $content]);

        $sections = $page->sections()->ordered()->get()->toArray();
        broadcast(new SectionUpdated('updated', $portfolio->id, $page->id, $section, $sections));

        return response()->json($section);
    }

    public function destroy(Portfolio $portfolio, Page $page, Section $section): JsonResponse
    {
        $section->delete();

        $sections = $page->sections()->ordered()->get()->toArray();
        broadcast(new SectionUpdated('deleted', $portfolio->id, $page->id, null, $sections));

        return response()->json(['message' => 'Section deleted.']);
    }

    public function reorder(Request $request, Portfolio $portfolio, Page $page): JsonResponse
    {
        $validated = $request->validate([
            'moves' => 'required|array',
            'moves.*.id' => 'required|exists:sections,id',
            'moves.*.order' => 'required|integer|min:0',
        ]);

        Section::reorder($validated['moves']);

        $sections = $page->sections()->ordered()->get();
        broadcast(new SectionUpdated('reordered', $portfolio->id, $page->id, null, $sections->toArray()));

        return response()->json($sections);
    }
}
