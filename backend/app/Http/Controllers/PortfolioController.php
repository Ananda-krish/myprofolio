<?php

namespace App\Http\Controllers;

use App\Events\PortfolioUpdated;
use App\Models\Portfolio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PortfolioController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Portfolio::ordered()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'nullable|string|max:255|unique:portfolios,domain',
            'status' => 'required|in:live,draft',
            'order' => 'nullable|integer|min:0',
            'navbar_template_id' => 'nullable|exists:navbar_templates,id',
        ]);

        $maxOrder = Portfolio::max('order') ?? -1;
        $validated['order'] = $validated['order'] ?? ($maxOrder + 1);

        $portfolio = Portfolio::create($validated);

        return response()->json($portfolio, 201);
    }

    public function show(Portfolio $portfolio): JsonResponse
    {
        return response()->json($portfolio);
    }

    public function update(Request $request, Portfolio $portfolio): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'domain' => [
                'nullable', 'string', 'max:255',
                Rule::unique('portfolios', 'domain')->ignore($portfolio->id),
            ],
            'status' => 'sometimes|required|in:live,draft',
            'order' => 'nullable|integer|min:0',
            'navbar_template_id' => 'nullable|exists:navbar_templates,id',
        ]);

        $portfolio->update($validated);

        broadcast(new PortfolioUpdated('updated', $portfolio->id, $portfolio));

        return response()->json($portfolio);
    }

    public function destroy(Portfolio $portfolio): JsonResponse
    {
        broadcast(new PortfolioUpdated('deleted', $portfolio->id, null));

        $portfolio->delete();

        return response()->json(['message' => 'Portfolio deleted.']);
    }
}
