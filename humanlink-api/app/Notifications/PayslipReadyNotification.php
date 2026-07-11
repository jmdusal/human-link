<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Payslip;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PayslipReadyNotification extends Notification implements ShouldBroadcastNow
{
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
        return new BroadcastMessage($this->payload());
    }

    public function toArray(object $notifiable): array
    {
        return $this->payload();
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
