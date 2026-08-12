<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
        ]);

        $file = $request->file('file');
        $path = $file->store('uploads', 'public');
        $url = $request->getSchemeAndHttpHost() . '/storage/' . $path;

        return response()->json([
            'url' => $url,
            'path' => $path,
            'name' => $file->getClientOriginalName(),
        ]);
    }
}
