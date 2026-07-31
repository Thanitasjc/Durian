<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\NavItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class NavItemController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => NavItem::query()
                ->with('parent:id,label')
                ->orderByRaw('COALESCE(parent_id, id)')
                ->orderBy('parent_id')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $item = NavItem::query()->create($this->validated($request));

        return response()->json(['data' => $item->load('parent:id,label')], 201);
    }

    public function show(NavItem $nav_item): JsonResponse
    {
        return response()->json(['data' => $nav_item->load('parent:id,label')]);
    }

    public function update(Request $request, NavItem $nav_item): JsonResponse
    {
        $nav_item->update($this->validated($request, true, $nav_item));

        return response()->json(['data' => $nav_item->fresh()->load('parent:id,label')]);
    }

    public function destroy(NavItem $nav_item): JsonResponse
    {
        $nav_item->children()->update(['parent_id' => null]);
        $nav_item->delete();

        return response()->json(['message' => 'ลบเมนูแล้ว']);
    }

    private function validated(Request $request, bool $updating = false, ?NavItem $existing = null): array
    {
        $data = $request->validate([
            'label' => [$updating ? 'sometimes' : 'required', 'string', 'max:120'],
            'href' => ['nullable', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:nav_items,id'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable'],
        ]);

        if (array_key_exists('href', $data) && blank($data['href'])) {
            $data['href'] = '#';
        } elseif (! array_key_exists('href', $data) && ! $updating) {
            $data['href'] = '#';
        }

        if (array_key_exists('parent_id', $data) && blank($data['parent_id'])) {
            $data['parent_id'] = null;
        }

        $parentId = array_key_exists('parent_id', $data)
            ? $data['parent_id']
            : $existing?->parent_id;

        if ($parentId && $existing && (int) $parentId === (int) $existing->id) {
            throw ValidationException::withMessages([
                'parent_id' => 'ไม่สามารถเลือกตัวเองเป็นเมนูหลักได้',
            ]);
        }

        if ($parentId) {
            $parent = NavItem::query()->find($parentId);
            if ($parent?->parent_id) {
                throw ValidationException::withMessages([
                    'parent_id' => 'รองรับเมนูย่อยได้เพียง 1 ระดับ',
                ]);
            }
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
            $data['sort_order'] = (int) NavItem::query()->max('sort_order') + 1;
        }

        return $data;
    }
}
