<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use DevKandil\NotiFire\Channels\FcmChannel;
use DevKandil\NotiFire\Enums\MessagePriority;
use DevKandil\NotiFire\FcmMessage;

class InformationNotification extends Notification
{
    use Queueable;

    /** @var array<string,mixed> 通知内容 */
    protected array $payload;

    /**
     * @param  array<string,mixed> $payload 例) ['title' => '…', 'body' => '…', 'url' => '…']
     */
    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // いいね通知の場合はFCMとデータベース保存
        if (($this->payload['type'] ?? null) === \App\Consts\NotificationType::LIKE) {
            // FCMトークンがある場合のみFCM通知を送信
            if (!empty($notifiable->fcm_token)) {
                return [FcmChannel::class, 'database'];
            }
            return ['database'];
        }
        return ['mail', 'database'];
    }

    /**
     * FCM通知の内容を定義
     */
    public function toFcm(object $notifiable): FcmMessage
    {
        return FcmMessage::create(
            $this->payload['title'] ?? 'お知らせ',
            $this->payload['content'] ?? ''
        )
            ->sound('default')
            ->priority(MessagePriority::HIGH)
            ->data([
                'type' => $this->payload['type'] ?? '',
                'url' => $this->payload['url'] ?? '',
                'liked_by_user_id' => isset($this->payload['liked_by_user']) ? (string) $this->payload['liked_by_user']->id : '',
            ]);
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->payload['title'])
            ->markdown('emails.notification', [
                'title'   => $this->payload['title'],
                'content' => $this->payload['content'],
                'url'     => $this->payload['url'] ?? null,
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'date' => $this->payload['date'] ?? now()->toDateString(),
            'title' => $this->payload['title'],
            'content' => $this->payload['content'],
            'liked_by_user' => $this->payload['liked_by_user'] ?? null,
            'type' => $this->payload['type']
        ];
    }
}
