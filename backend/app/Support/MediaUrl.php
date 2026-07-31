<?php

namespace App\Support;

class MediaUrl
{
    public static function absolute(?string $url): ?string
    {
        if ($url === null || $url === '') {
            return $url;
        }

        $url = trim($url);

        if (str_starts_with($url, '/storage/v1/object/public/')) {
            $host = parse_url((string) config('filesystems.disks.s3.url'), PHP_URL_HOST)
                ?: 'anefnlhwarioumxdyrpa.supabase.co';

            return 'https://'.$host.$url;
        }

        return $url;
    }

    public static function fromDiskPath(string $path, string $disk): string
    {
        if ($disk === 's3') {
            $base = rtrim((string) config('filesystems.disks.s3.url'), '/');
            if ($base === '' || ! str_starts_with($base, 'http')) {
                $base = 'https://anefnlhwarioumxdyrpa.supabase.co/storage/v1/object/public/media';
            }

            return $base.'/'.ltrim($path, '/');
        }

        $stored = \Illuminate\Support\Facades\Storage::disk($disk)->url($path);

        return self::absolute($stored) ?? $stored;
    }
}
