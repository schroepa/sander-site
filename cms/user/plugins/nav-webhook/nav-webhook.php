<?php
namespace Grav\Plugin;

use Grav\Common\Plugin;

class NavWebhookPlugin extends Plugin
{
    public static function getSubscribedEvents(): array
    {
        return [
            'onAdminSave' => ['onAdminSave', 0],
        ];
    }

    public function onAdminSave(): void
    {
        $pat   = $this->config->get('plugins.nav-webhook.github_pat', '');
        $owner = $this->config->get('plugins.nav-webhook.repo_owner', '');
        $repo  = $this->config->get('plugins.nav-webhook.repo_name', '');

        if (!$pat || !$owner || !$repo) {
            return;
        }

        $url  = "https://api.github.com/repos/{$owner}/{$repo}/dispatches";
        $body = json_encode(['event_type' => 'cms_content_updated']);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_HTTPHEADER     => [
                'Accept: application/vnd.github+json',
                'Authorization: Bearer ' . $pat,
                'Content-Type: application/json',
                'User-Agent: Grav-Nav-Webhook',
                'X-GitHub-Api-Version: 2022-11-28',
            ],
        ]);

        curl_exec($ch);
        curl_close($ch);
    }
}
