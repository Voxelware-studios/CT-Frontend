import { APP_VERSION } from '@/lib/version';

export function StatsFooter() {
  return (
    <footer className="border-t border-border py-8 mt-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">CoreTuff</span>
            <span className="text-xs text-muted-foreground/60">{APP_VERSION}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a
              href="https://github.com/Voxelware-studios/CoreTuff-Issue-Tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.voxelware.org/projects/coretuff"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Documentation
            </a>
            <a
              href="https://discord.com/invite/dnV3fazVRF"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Discord
            </a>
            <a
              href="https://modrinth.com/plugin/coretuff"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Modrinth
            </a>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground/40">
          Anonymous aggregate statistics. No player data is collected or displayed.
        </div>
      </div>
    </footer>
  );
}
