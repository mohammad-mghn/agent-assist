import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataPanelProps {
  title: string;
  description: string;
  exportLabel: string;
  importLabel: string;
  onExport: () => void;
  onImport: () => void;
}

export function DataPanel({
  title,
  description,
  exportLabel,
  importLabel,
  onExport,
  onImport,
}: DataPanelProps) {
  return (
    <div className="min-w-0 space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3 xl:p-4">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
          {description}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="outline" className="w-full min-w-0 justify-start gap-2" onClick={onExport}>
          <Download className="h-4 w-4 shrink-0" />
          {exportLabel}
        </Button>
        <Button variant="outline" className="w-full min-w-0 justify-start gap-2" onClick={onImport}>
          <Upload className="h-4 w-4 shrink-0" />
          {importLabel}
        </Button>
      </div>
    </div>
  );
}
