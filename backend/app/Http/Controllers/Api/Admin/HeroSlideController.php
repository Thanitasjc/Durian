<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class HeroSlideController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => HeroSlide::query()->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $slide = HeroSlide::query()->create($this->validated($request));

        return response()->json(['data' => $slide], 201);
    }

    public function show(HeroSlide $hero_slide): JsonResponse
    {
        return response()->json(['data' => $hero_slide]);
    }

    public function update(Request $request, HeroSlide $hero_slide): JsonResponse
    {
        $hero_slide->update($this->validated($request, true, $hero_slide));

        return response()->json(['data' => $hero_slide->fresh()]);
    }

    public function destroy(HeroSlide $hero_slide): JsonResponse
    {
        $hero_slide->delete();

        return response()->json(['message' => 'ลบสไลด์แล้ว']);
    }

    private function validated(Request $request, bool $updating = false, ?HeroSlide $existing = null): array
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:180'],
            'subtitle' => ['nullable', 'string', 'max:180'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'body' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:1000'],
            'video_url' => ['nullable', 'string', 'max:500'],
            'cta_label' => ['nullable', 'string', 'max:80'],
            'cta_link' => ['nullable', 'string', 'max:255'],
            'cta_label_2' => ['nullable', 'string', 'max:80'],
            'cta_link_2' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable'],
        ]);

        $image = array_key_exists('image_url', $data)
            ? $data['image_url']
            : $existing?->image_url;
        $video = array_key_exists('video_url', $data)
            ? $data['video_url']
            : $existing?->video_url;

        if (blank($image) && blank($video)) {
            throw ValidationException::withMessages([
                'image_url' => 'ต้องมีรูปหรือวิดีโออย่างน้อยหนึ่งอย่าง',
                'video_url' => 'ต้องมีรูปหรือวิดีโออย่างน้อยหนึ่งอย่าง',
            ]);
        }

        if (array_key_exists('is_active', $data)) {
            $data['is_active'] = filter_var(
                $data['is_active'],
                FILTER_VALIDATE_BOOLEAN,
                FILTER_NULL_ON_FAILURE
            ) ?? (bool) $data['is_active'];
        } elseif (! $updating) {
            $data['is_active'] = true;
        }

        if (! array_key_exists('sort_order', $data) && ! $updating) {
            $data['sort_order'] = (int) HeroSlide::query()->max('sort_order') + 1;
        }

        return $data;
    }
}
