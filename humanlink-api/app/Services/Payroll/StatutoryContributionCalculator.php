<?php

declare(strict_types=1);

namespace App\Services\Payroll;

use App\Models\StatutoryContributionBracket;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class StatutoryContributionCalculator
{
    /**
     * @return array{
     *     sss_ee: float,
     *     sss_er: float,
     *     philhealth_ee: float,
     *     philhealth_er: float,
     *     pagibig_ee: float,
     *     pagibig_er: float,
     *     withholding_tax: float
     * }
     */
    public function calculate(float $monthlyCompensation, float $grossPay, Carbon $asOf): array
    {
        $sss = $this->sss($monthlyCompensation, $asOf);
        $philhealth = $this->philhealth($monthlyCompensation, $asOf);
        $pagibig = $this->pagibig($monthlyCompensation, $asOf);

        $taxable = max(
            0,
            $grossPay - $sss['ee'] - $philhealth['ee'] - $pagibig['ee']
        );

        return [
            'sss_ee' => $sss['ee'],
            'sss_er' => $sss['er'],
            'philhealth_ee' => $philhealth['ee'],
            'philhealth_er' => $philhealth['er'],
            'pagibig_ee' => $pagibig['ee'],
            'pagibig_er' => $pagibig['er'],
            'withholding_tax' => $this->withholdingTax($taxable, $asOf),
        ];
    }

    /**
     * @return array{ee: float, er: float}
     */
    protected function sss(float $compensation, Carbon $asOf): array
    {
        $bracket = $this->findBracket('sss', $compensation, $asOf);

        if (! $bracket) {
            return ['ee' => 0.0, 'er' => 0.0];
        }

        return [
            'ee' => round((float) ($bracket->employee_amount ?? 0), 2),
            'er' => round((float) ($bracket->employer_amount ?? 0), 2),
        ];
    }

    /**
     * @return array{ee: float, er: float}
     */
    protected function philhealth(float $compensation, Carbon $asOf): array
    {
        $bracket = $this->findBracket('philhealth', $compensation, $asOf);

        if (! $bracket) {
            // Fallback: 5% total, split EE/ER, floor 10k / ceiling 100k
            $base = min(100_000, max(10_000, $compensation));
            $total = round($base * 0.05, 2);
            $half = round($total / 2, 2);

            return ['ee' => $half, 'er' => $half];
        }

        $min = (float) ($bracket->meta['floor'] ?? 10_000);
        $max = (float) ($bracket->meta['ceiling'] ?? 100_000);
        $rate = (float) ($bracket->employee_rate ?? 0.05);
        $base = min($max, max($min, $compensation));
        $total = round($base * $rate, 2);
        $eeShare = (float) ($bracket->meta['ee_share'] ?? 0.5);
        $ee = round($total * $eeShare, 2);

        return [
            'ee' => $ee,
            'er' => round($total - $ee, 2),
        ];
    }

    /**
     * @return array{ee: float, er: float}
     */
    protected function pagibig(float $compensation, Carbon $asOf): array
    {
        $brackets = $this->bracketsFor('pagibig', $asOf);
        $bracket = $brackets->first(function (StatutoryContributionBracket $row) use ($compensation) {
            $min = (float) $row->min_compensation;
            $max = $row->max_compensation !== null ? (float) $row->max_compensation : null;

            return $compensation >= $min && ($max === null || $compensation <= $max);
        }) ?? $brackets->last();

        if (! $bracket) {
            $eeRate = $compensation > 1_500 ? 0.02 : 0.01;
            $base = min(10_000, $compensation);
            $ee = round($base * $eeRate, 2);
            $er = round($base * 0.02, 2);

            return ['ee' => $ee, 'er' => $er];
        }

        $ceiling = (float) ($bracket->meta['ceiling'] ?? 10_000);
        $base = min($ceiling, $compensation);
        $ee = round($base * (float) ($bracket->employee_rate ?? 0.02), 2);
        $er = round($base * (float) ($bracket->employer_rate ?? 0.02), 2);

        return ['ee' => $ee, 'er' => $er];
    }

    protected function withholdingTax(float $taxableIncome, Carbon $asOf): float
    {
        $brackets = $this->bracketsFor('withholding_tax', $asOf);

        foreach ($brackets as $bracket) {
            $min = (float) $bracket->min_compensation;
            $max = $bracket->max_compensation !== null ? (float) $bracket->max_compensation : null;

            if ($taxableIncome < $min) {
                continue;
            }

            if ($max !== null && $taxableIncome > $max) {
                continue;
            }

            $base = (float) ($bracket->base_amount ?? 0);
            $rate = (float) ($bracket->employee_rate ?? 0);
            $excessOver = (float) ($bracket->meta['excess_over'] ?? $min);

            return round($base + max(0, $taxableIncome - $excessOver) * $rate, 2);
        }

        return 0.0;
    }

    protected function findBracket(string $agency, float $compensation, Carbon $asOf): ?StatutoryContributionBracket
    {
        return $this->bracketsFor($agency, $asOf)->first(function (StatutoryContributionBracket $row) use ($compensation) {
            $min = (float) $row->min_compensation;
            $max = $row->max_compensation !== null ? (float) $row->max_compensation : null;

            return $compensation >= $min && ($max === null || $compensation <= $max);
        });
    }

    /**
     * @return Collection<int, StatutoryContributionBracket>
     */
    protected function bracketsFor(string $agency, Carbon $asOf): Collection
    {
        $effective = StatutoryContributionBracket::query()
            ->where('agency', $agency)
            ->whereDate('effective_date', '<=', $asOf->toDateString())
            ->orderByDesc('effective_date')
            ->value('effective_date');

        if (! $effective) {
            return collect();
        }

        return StatutoryContributionBracket::query()
            ->where('agency', $agency)
            ->whereDate('effective_date', $effective)
            ->orderBy('min_compensation')
            ->get();
    }
}
