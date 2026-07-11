<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Payslip</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1e293b; }
        h1 { font-size: 20px; margin: 0 0 4px; }
        .muted { color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: left; }
        th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; }
        .right { text-align: right; }
        .total { font-weight: bold; font-size: 14px; }
        .section { margin-top: 24px; }
    </style>
</head>
<body>
    <h1>Human Link Payslip</h1>
    <p class="muted">
        @if($payslip->month === 13)
            13th Month Pay — {{ $payslip->year }}
        @else
            {{ \Illuminate\Support\Carbon::create($payslip->year, $payslip->month, 1)->format('F Y') }}
        @endif
    </p>

    <p>
        <strong>{{ $payslip->user?->name }}</strong><br>
        {{ $payslip->user?->email }}<br>
        @if($payslip->user?->details?->tin) TIN: {{ $payslip->user->details->tin }}<br>@endif
        Period: {{ $payslip->period_start?->format('Y-m-d') }} to {{ $payslip->period_end?->format('Y-m-d') }}
    </p>

    <div class="section">
        <table>
            <thead>
                <tr>
                    <th>Earnings</th>
                    <th class="right">Amount ({{ $payslip->currency }})</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Basic pay</td><td class="right">{{ number_format((float) $payslip->basic_pay, 2) }}</td></tr>
                <tr><td>Allowance</td><td class="right">{{ number_format((float) $payslip->allowance_pay, 2) }}</td></tr>
                <tr><td>Overtime</td><td class="right">{{ number_format((float) $payslip->overtime_pay, 2) }}</td></tr>
                @if((float) $payslip->thirteenth_month_pay > 0)
                    <tr><td>13th month pay</td><td class="right">{{ number_format((float) $payslip->thirteenth_month_pay, 2) }}</td></tr>
                @endif
                <tr class="total"><td>Gross pay</td><td class="right">{{ number_format((float) $payslip->gross_pay, 2) }}</td></tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <table>
            <thead>
                <tr>
                    <th>Deductions</th>
                    <th class="right">Amount ({{ $payslip->currency }})</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>SSS (EE)</td><td class="right">{{ number_format((float) $payslip->sss_ee, 2) }}</td></tr>
                <tr><td>PhilHealth (EE)</td><td class="right">{{ number_format((float) $payslip->philhealth_ee, 2) }}</td></tr>
                <tr><td>Pag-IBIG (EE)</td><td class="right">{{ number_format((float) $payslip->pagibig_ee, 2) }}</td></tr>
                <tr><td>Withholding tax</td><td class="right">{{ number_format((float) $payslip->withholding_tax, 2) }}</td></tr>
                <tr><td>Other deductions</td><td class="right">{{ number_format((float) $payslip->other_deductions, 2) }}</td></tr>
                <tr class="total"><td>Total deductions</td><td class="right">{{ number_format((float) $payslip->total_deductions, 2) }}</td></tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <table>
            <tr class="total">
                <td>Net pay</td>
                <td class="right">{{ number_format((float) $payslip->net_pay, 2) }} {{ $payslip->currency }}</td>
            </tr>
        </table>
        <p class="muted" style="margin-top: 12px;">
            Employer shares (informational): SSS {{ number_format((float) $payslip->sss_er, 2) }},
            PhilHealth {{ number_format((float) $payslip->philhealth_er, 2) }},
            Pag-IBIG {{ number_format((float) $payslip->pagibig_er, 2) }}.
        </p>
    </div>
</body>
</html>
