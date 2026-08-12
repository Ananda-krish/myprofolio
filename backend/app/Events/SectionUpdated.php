<?php

namespace App\Events;

use App\Models\Section;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SectionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $action,
        public int $portfolioId,
        public int $pageId,
        public ?Section $section = null,
        public ?array $sections = null,
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel("portfolio.{$this->portfolioId}")];
    }

    public function broadcastAs(): string
    {
        return 'section.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'page_id' => $this->pageId,
            'section' => $this->section?->toArray(),
            'sections' => $this->sections,
        ];
    }
}
