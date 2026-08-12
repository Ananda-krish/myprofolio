<?php

namespace App\Events;

use App\Models\Portfolio;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PortfolioUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $action,
        public int $portfolioId,
        public ?Portfolio $portfolio = null,
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel("portfolio.{$this->portfolioId}")];
    }

    public function broadcastAs(): string
    {
        return 'portfolio.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'portfolio' => $this->portfolio?->toArray(),
        ];
    }
}
