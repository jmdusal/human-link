<?php

declare(strict_types=1);

return [
    'sprint' => [
        'label' => 'Sprint board',
        'description' => 'Backlog-driven delivery with review and done columns.',
        'statuses' => [
            ['name' => 'Backlog', 'color_hex' => '#64748b'],
            ['name' => 'In Progress', 'color_hex' => '#f59e0b'],
            ['name' => 'Review', 'color_hex' => '#8b5cf6'],
            ['name' => 'Done', 'color_hex' => '#10b981'],
        ],
        'tags' => [
            ['name' => 'Spike', 'color' => '#64748b'],
            ['name' => 'Story', 'color' => '#3b82f6'],
            ['name' => 'Bug', 'color' => '#ef4444'],
            ['name' => 'Tech Debt', 'color' => '#f59e0b'],
        ],
    ],
    'hr_ops' => [
        'label' => 'HR ops',
        'description' => 'People workflows from open requests through approval.',
        'statuses' => [
            ['name' => 'Open', 'color_hex' => '#3b82f6'],
            ['name' => 'In Review', 'color_hex' => '#f59e0b'],
            ['name' => 'Approved', 'color_hex' => '#10b981'],
            ['name' => 'Closed', 'color_hex' => '#64748b'],
        ],
        'tags' => [
            ['name' => 'Onboarding', 'color' => '#10b981'],
            ['name' => 'Offboarding', 'color' => '#ef4444'],
            ['name' => 'Policy', 'color' => '#8b5cf6'],
            ['name' => 'Benefits', 'color' => '#3b82f6'],
        ],
    ],
    'client_delivery' => [
        'label' => 'Client delivery',
        'description' => 'Intake through client review and delivery.',
        'statuses' => [
            ['name' => 'Intake', 'color_hex' => '#64748b'],
            ['name' => 'In Progress', 'color_hex' => '#f59e0b'],
            ['name' => 'Client Review', 'color_hex' => '#8b5cf6'],
            ['name' => 'Delivered', 'color_hex' => '#10b981'],
        ],
        'tags' => [
            ['name' => 'Scope', 'color' => '#3b82f6'],
            ['name' => 'Change Request', 'color' => '#f59e0b'],
            ['name' => 'Bug', 'color' => '#ef4444'],
            ['name' => 'Handoff', 'color' => '#10b981'],
        ],
    ],
];
