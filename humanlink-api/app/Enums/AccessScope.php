<?php

declare(strict_types=1);

namespace App\Enums;

enum AccessScope: string
{
    case Self = 'self';
    case Workspace = 'workspace';
    case Company = 'company';

    public function label(): string
    {
        return match ($this) {
            self::Self => 'Self only',
            self::Workspace => 'Workspace members',
            self::Company => 'Entire company',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
