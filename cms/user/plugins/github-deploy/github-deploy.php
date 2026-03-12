<?php
namespace Grav\Plugin;

use Grav\Common\Plugin;

class GithubDeployPlugin extends Plugin
{
    public static function getSubscribedEvents(): array
    {
        return [
            'onAdminSave' => ['onAdminSave', 0],
        ];
    }

    public function onAdminSave(): void
    {
        $this->createMissingMetaFiles();

        $token      = $this->config->get('plugins.github-deploy.token');
        $repository = $this->config->get('plugins.github-deploy.repository');

        if (!$token || !$repository) {
            return;
        }

        $ch = curl_init("https://api.github.com/repos/{$repository}/dispatches");
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 5,
            CURLOPT_HTTPHEADER     => [
                "Authorization: token {$token}",
                "Accept: application/vnd.github.v3+json",
                "User-Agent: Grav-GitHub-Deploy",
                "Content-Type: application/json",
            ],
            CURLOPT_POSTFIELDS => json_encode(['event_type' => 'cms_content_updated']),
        ]);
        curl_exec($ch);
        curl_close($ch);
    }

    /**
     * Grav's mediapicker requires a .meta.yaml file for every image.
     * This method auto-creates missing meta files so uploaded images
     * immediately appear in the media picker without manual steps.
     */
    private function createMissingMetaFiles(): void
    {
        $pagesDir = GRAV_ROOT . '/user/pages';
        if (!is_dir($pagesDir)) {
            return;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($pagesDir, \RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if (!$file->isFile()) {
                continue;
            }
            if (preg_match('/\.(jpg|jpeg|png|gif|webp|svg|ico|mp4|pdf)$/i', $file->getFilename())) {
                $metaPath = $file->getPathname() . '.meta.yaml';
                if (!file_exists($metaPath)) {
                    file_put_contents($metaPath, "alt: ''\n");
                }
            }
        }
    }
}
