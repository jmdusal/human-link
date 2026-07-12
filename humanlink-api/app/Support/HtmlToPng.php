<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Str;
use RuntimeException;

final class HtmlToPng
{
    /**
     * Convert DomPDF binary output into a PNG binary string.
     */
    public static function fromPdfBinary(string $pdfBinary, int $dpi = 160): string
    {
        if (! self::isAvailable()) {
            throw new RuntimeException(
                'PNG conversion requires poppler-utils (pdftoppm). Install it in the API container.'
            );
        }

        $tmpDir = sys_get_temp_dir();
        $id = Str::uuid()->toString();
        $pdfPath = $tmpDir.'/idcard-'.$id.'.pdf';
        $outBase = $tmpDir.'/idcard-'.$id;

        file_put_contents($pdfPath, $pdfBinary);

        try {
            $command = sprintf(
                'pdftoppm -png -r %d -singlefile %s %s',
                $dpi,
                escapeshellarg($pdfPath),
                escapeshellarg($outBase)
            );

            exec($command.' 2>&1', $output, $exitCode);

            $pngPath = $outBase.'.png';

            if ($exitCode !== 0 || ! is_file($pngPath)) {
                throw new RuntimeException(
                    'Failed to convert ID card PDF to PNG: '.implode("\n", $output)
                );
            }

            $png = file_get_contents($pngPath);

            if ($png === false || $png === '') {
                throw new RuntimeException('Failed to read generated ID card PNG.');
            }

            return $png;
        } finally {
            @unlink($pdfPath);
            @unlink($outBase.'.png');
        }
    }

    public static function isAvailable(): bool
    {
        $path = trim((string) shell_exec('command -v pdftoppm 2>/dev/null'));

        return $path !== '';
    }

    /**
     * Crop near-white margins so the ID card sits tight in the PNG.
     */
    public static function trimWhitespace(string $pngBinary, int $padding = 12): string
    {
        if (! function_exists('imagecreatefromstring')) {
            return $pngBinary;
        }

        $source = @imagecreatefromstring($pngBinary);
        if ($source === false) {
            return $pngBinary;
        }

        $width = imagesx($source);
        $height = imagesy($source);

        $minX = $width;
        $minY = $height;
        $maxX = -1;
        $maxY = -1;

        for ($y = 0; $y < $height; $y++) {
            for ($x = 0; $x < $width; $x++) {
                $rgb = imagecolorat($source, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;

                if ($r < 248 || $g < 248 || $b < 248) {
                    if ($x < $minX) {
                        $minX = $x;
                    }
                    if ($y < $minY) {
                        $minY = $y;
                    }
                    if ($x > $maxX) {
                        $maxX = $x;
                    }
                    if ($y > $maxY) {
                        $maxY = $y;
                    }
                }
            }
        }

        if ($maxX < $minX || $maxY < $minY) {
            imagedestroy($source);

            return $pngBinary;
        }

        $minX = max(0, $minX - $padding);
        $minY = max(0, $minY - $padding);
        $maxX = min($width - 1, $maxX + $padding);
        $maxY = min($height - 1, $maxY + $padding);

        $cropW = $maxX - $minX + 1;
        $cropH = $maxY - $minY + 1;

        $cropped = imagecreatetruecolor($cropW, $cropH);
        if ($cropped === false) {
            imagedestroy($source);

            return $pngBinary;
        }

        $white = imagecolorallocate($cropped, 255, 255, 255);
        imagefill($cropped, 0, 0, $white);
        imagecopy($cropped, $source, 0, 0, $minX, $minY, $cropW, $cropH);

        ob_start();
        imagepng($cropped);
        $trimmed = ob_get_clean();

        imagedestroy($source);
        imagedestroy($cropped);

        return is_string($trimmed) && $trimmed !== '' ? $trimmed : $pngBinary;
    }
}
