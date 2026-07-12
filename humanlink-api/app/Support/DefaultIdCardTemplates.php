<?php

declare(strict_types=1);

namespace App\Support;

final class DefaultIdCardTemplates
{
    /**
     * @return list<array{name: string, body: string, is_active: bool}>
     */
    public static function all(): array
    {
        return [
            [
                'name' => 'Employee ID Card',
                'body' => self::defaultBody(),
                'is_active' => true,
            ],
        ];
    }

    public static function default(): array
    {
        return self::all()[0];
    }

    private static function defaultBody(): string
    {
        return <<<'HTML'
<div class="id-wrap">
    <table class="id-card" cellpadding="0" cellspacing="0">
        <tr>
            <td class="id-band" colspan="2">
                <table class="id-band-table" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="id-company">{{company_name}}</td>
                        <td class="id-badge-label">Employee ID</td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class="id-body" colspan="2">
                <table class="id-body-table" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="id-photo" width="88">{{initials}}</td>
                        <td class="id-info">
                            <div class="id-name">{{employee_name}}</div>
                            <div class="id-email">{{email}}</div>
                            <table class="id-meta" cellpadding="0" cellspacing="0">
                                <tr>
                                    <th>Department</th>
                                    <th>Job / position</th>
                                </tr>
                                <tr>
                                    <td>{{department}}</td>
                                    <td>{{job_title}}</td>
                                </tr>
                                <tr>
                                    <th>Employment type</th>
                                    <th>Hired</th>
                                </tr>
                                <tr>
                                    <td>{{employment_type}}</td>
                                    <td>{{hired_at}}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class="id-footer" colspan="2">
                Issued <strong>{{generated_at}}</strong>
            </td>
        </tr>
    </table>
</div>
HTML;
    }
}
