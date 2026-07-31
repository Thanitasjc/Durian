<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteSectionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => SiteSection::query()->orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $section = SiteSection::query()->create($data);

        return response()->json(['data' => $section], 201);
    }

    public function show(SiteSection $siteSection): JsonResponse
    {
        return response()->json(['data' => $siteSection]);
    }

    public function update(Request $request, SiteSection $siteSection): JsonResponse
    {
        $siteSection->update($this->validated($request, $siteSection->id));

        return response()->json(['data' => $siteSection->fresh()]);
    }

    public function destroy(SiteSection $siteSection): JsonResponse
    {
        $siteSection->delete();

        return response()->json(['message' => 'ลบ section แล้ว']);
    }

    private function validated(Request $request, ?int $id = null): array
    {
        $unique = $id
            ? 'unique:site_sections,key,'.$id
            : 'unique:site_sections,key';

        $data = $request->validate([
            'key' => ['required', 'string', 'max:50', $unique],
            'title' => ['nullable', 'string', 'max:255'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'subtitle' => ['nullable', 'string'],
            'body' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:1000'],
            'cta_label' => ['nullable', 'string', 'max:120'],
            'cta_link' => ['nullable', 'string', 'max:255'],
            'cta_label_2' => ['nullable', 'string', 'max:120'],
            'cta_link_2' => ['nullable', 'string', 'max:255'],
            'meta' => ['nullable'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('meta', $data)) {
            if (is_string($data['meta'])) {
                $decoded = json_decode($data['meta'], true);
                $data['meta'] = json_last_error() === JSON_ERROR_NONE ? $decoded : null;
            }
            if ($data['meta'] === '' || $data['meta'] === []) {
                $data['meta'] = null;
            }
        }

        if (array_key_exists('is_active', $data)) {
            $data['is_active'] = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? (bool) $data['is_active'];
        }

        return $data;
    }
}
