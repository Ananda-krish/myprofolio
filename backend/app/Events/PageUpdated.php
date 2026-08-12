<?php

namespace App\Events;

use App\Models\Page;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PageUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $action,
        public int $portfolioId,
        public ?Page $page = null,
        public ?array $pages = null,
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel("portfolio.{$this->portfolioId}")];
    }

    public function broadcastAs(): string
    {
        return 'page.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'page' => $this->page?->toArray(),
            'pages' => $this->pages,
        ];
    }
}
