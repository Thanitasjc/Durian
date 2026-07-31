<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Support\MediaUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,webp,gif,mp4,webm,mov',
                'max:51200',
            ],
            'collection' => ['nullable', 'string', 'max:50'],
            'mediable_type' => ['nullable', 'string'],
            'mediable_id' => ['nullable', 'integer'],
        ]);

        $file = $request->file('file');
        $collection = $validated['collection'] ?? 'default';
        $disk = config('filesystems.media_disk', 'public');
        $path = $file->store("uploads/{$collection}", [
            'disk' => $disk,
            'visibility' => 'public',
        ]);

        $media = Media::query()->create([
            'disk' => $disk,
            'path' => $path,
            'filename' => $file->getClientOriginalName(),
            'mime' => $file->getClientMimeType(),
            'size' => $file->getSize() ?: 0,
            'collection' => $collection,
            'mediable_type' => $validated['mediable_type'] ?? null,
            'mediable_id' => $validated['mediable_id'] ?? null,
            'uploaded_by' => $request->user()?->id,
        ]);

        $url = MediaUrl::fromDiskPath($path, $disk);

        return response()->json([
            'data' => [
                ...$media->toArray(),
                'url' => $url,
            ],
        ], 201);
    }

    public function destroy(Media $medium): JsonResponse
    {
        Storage::disk($medium->disk)->delete($medium->path);
        $medium->delete();

        return response()->json(['message' => 'ลบไฟล์แล้ว']);
    }
}
