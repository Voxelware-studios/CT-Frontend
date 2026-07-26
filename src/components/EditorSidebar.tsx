import { Button } from './ui/button';

interface EditorSidebarProps {
  modules: string[];
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export function EditorSidebar({ modules, activeModule, onModuleChange }: EditorSidebarProps) {
  return (
    <aside className="w-56 border-r border-border bg-card shrink-0 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Modules
        </h2>
        <nav className="space-y-1">
          {modules.map((mod) => (
            <Button
              key={mod}
              variant={activeModule === mod ? 'secondary' : 'ghost'}
              className="w-full justify-start text-sm"
              onClick={() => onModuleChange(mod)}
            >
              {mod.charAt(0).toUpperCase() + mod.slice(1)}
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
