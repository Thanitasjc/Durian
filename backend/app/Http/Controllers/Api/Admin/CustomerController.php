<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\NumberingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(private NumberingService $numbering) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => Customer::query()->latest()->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['nullable', 'string', 'max:50', 'unique:customers,code'],
            'name' => ['required', 'string', 'max:180'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:180'],
            'address' => ['nullable', 'string'],
            'type' => ['nullable', 'in:retail,wholesale,export'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $customer = Customer::query()->create([
            ...$data,
            'code' => $data['code'] ?? $this->numbering->nextCustomerCode(),
            'type' => $data['type'] ?? 'retail',
        ]);

        return response()->json(['data' => $customer], 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        return response()->json(['data' => $customer->load('orders')]);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $data = $request->validate([
            'code' => ['sometimes', 'string', 'max:50', 'unique:customers,code,'.$customer->id],
            'name' => ['sometimes', 'string', 'max:180'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:180'],
            'address' => ['nullable', 'string'],
            'type' => ['nullable', 'in:retail,wholesale,export'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $customer->update($data);

        return response()->json(['data' => $customer->fresh()]);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json(['message' => 'ลบลูกค้าแล้ว']);
    }
}
