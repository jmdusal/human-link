<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Payslip;
use App\Models\User;
use App\Notifications\Concerns\HasCompanyContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PayslipReadyNotification extends Notification implements ShouldBroadcastNow
{
    use HasCompanyContext;
    use Queueable;

    public function __construct(
        private Payslip $payslip
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->withCompanyContext($this->payload(), $notifiable));
    }

    public function toArray(object $notifiable): array
    {
        return $this->withCompanyContext($this->payload(), $notifiable);
    }

    public function companyId(?object $notifiable = null): ?int
    {
        $companyId = $this->payslip->user?->company_id;

        if ($companyId !== null) {
            return (int) $companyId;
        }

        if ($notifiable instanceof User && $notifiable->company_id !== null) {
            return (int) $notifiable->company_id;
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    protected function payload(): array
    {
        $period = $this->payslip->isThirteenthMonth()
            ? sprintf('13th month %d', $this->payslip->year)
            : sprintf('%s %d', $this->payslip->period_start?->format('F') ?? '', $this->payslip->year);

        return [
            'title' => 'Payslip ready',
            'message' => "Your payslip for {$period} is ready.",
            'type' => 'payslip_ready',
            'payslip_id' => $this->payslip->id,
            'year' => $this->payslip->year,
            'month' => $this->payslip->month,
            'time' => now()->diffForHumans(),
        ];
    }
}
