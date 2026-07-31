<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use Illuminate\Http\JsonResponse;

class ContactInquiryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => ContactInquiry::query()->latest()->get()]);
    }

    public function show(ContactInquiry $contactInquiry): JsonResponse
    {
        return response()->json(['data' => $contactInquiry]);
    }

    public function destroy(ContactInquiry $contactInquiry): JsonResponse
    {
        $contactInquiry->delete();

        return response()->json(['message' => 'ลบข้อความแล้ว']);
    }
}
