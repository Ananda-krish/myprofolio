<?php

namespace App\Http\Controllers;

use App\Models\NavbarTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NavbarTemplateController extends Controller
{
    public function index(): JsonResponse
    {
        $templates = NavbarTemplate::orderBy('name')->get();
        return response()->json($templates);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'config' => 'required|array',
        ]);

        $validated['config'] = array_replace_recursive(
            NavbarTemplate::defaultConfig(),
            $validated['config']
        );

        $template = NavbarTemplate::create($validated);
        return response()->json($template, 201);
    }

    public function show(NavbarTemplate $navbarTemplate): JsonResponse
    {
        return response()->json($navbarTemplate);
    }

    public function update(Request $request, NavbarTemplate $navbarTemplate): JsonResponse
    {
        $validated = $request->validate([
            'name'   => 'sometimes|string|max:255',
            'config' => 'sometimes|array',
        ]);

        if (isset($validated['config'])) {
            $validated['config'] = array_replace_recursive(
                NavbarTemplate::defaultConfig(),
                $validated['config']
            );
        }

        $navbarTemplate->update($validated);
        return response()->json($navbarTemplate);
    }

    public function destroy(NavbarTemplate $navbarTemplate): JsonResponse
    {
        $navbarTemplate->delete();
        return response()->json(['message' => 'Template deleted.']);
    }
}
