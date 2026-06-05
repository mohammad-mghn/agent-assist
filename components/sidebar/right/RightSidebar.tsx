import { useRef } from 'react';
import { toast } from 'sonner';
import { DataPanel } from '@/components/sidebar/right/DataPanel';
import { ImportOverwriteDialog } from '@/components/sidebar/right/ImportOverwriteDialog';
import { TestTextarea } from '@/components/sidebar/right/TestTextarea';
import type { ImportDialogState } from '@/components/sidebar/right/types';
import {
  buildPermanentExport,
  buildTempExport,
  downloadJson,
  hasPermanentImportData,
  hasTempImportData,
  parsePermanentExport,
  parseTempExport,
  readJsonFile,
} from '@/lib/export-import';
import { cn } from '@/lib/utils';
import { useUiLocale } from '@/hooks/use-ui-locale';
import type { AppData } from '@/shared/types';

interface RightSidebarProps {
  data: AppData;
  importDialog: ImportDialogState;
  onImportDialogChange: (dialog: ImportDialogState) => void;
  onImportPermanent: (payload: unknown, overwrite: boolean) => void;
  onImportTemp: (payload: unknown, overwrite: boolean) => void;
}

export function RightSidebar({
  data,
  importDialog,
  onImportDialogChange,
  onImportPermanent,
  onImportTemp,
}: RightSidebarProps) {
  const { t } = useUiLocale();
  const permInputRef = useRef<HTMLInputElement>(null);
  const tempInputRef = useRef<HTMLInputElement>(null);

  const handlePermImport = async (file: File) => {
    const raw = await readJsonFile(file);
    const parsed = parsePermanentExport(raw);
    if (!parsed.success) {
      toast.error(t('toast.invalidPermanentJson'));
      return;
    }
    if (hasPermanentImportData(data)) {
      onImportDialogChange({ open: true, type: 'permanent', payload: parsed.data });
      return;
    }
    onImportPermanent(parsed.data, false);
  };

  const handleTempImport = async (file: File) => {
    const raw = await readJsonFile(file);
    const parsed = parseTempExport(raw);
    if (!parsed.success) {
      toast.error(t('toast.invalidTempJson'));
      return;
    }
    if (hasTempImportData(data)) {
      onImportDialogChange({ open: true, type: 'temp', payload: parsed.data });
      return;
    }
    onImportTemp(parsed.data, false);
  };

  return (
    <aside
      className={cn(
        'flex min-h-0 shrink-0 flex-col gap-4 overflow-y-auto border-[var(--color-border)] bg-[var(--color-muted)]/20',
        'w-full border-t p-[var(--layout-gutter)]',
        'xl:min-h-0 xl:w-[var(--layout-sidebar-right)] xl:overflow-y-auto xl:border-s xl:border-t-0 xl:p-4 xl:overscroll-contain 2xl:p-5',
      )}
      data-snippet-assist
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <DataPanel
          title={t('right.permanentTitle')}
          description={t('right.permanentDesc')}
          exportLabel={t('right.exportJson')}
          importLabel={t('right.importJson')}
          onExport={() =>
            downloadJson(
              'agent-assist-permanent.json',
              buildPermanentExport(data),
            )
          }
          onImport={() => permInputRef.current?.click()}
        />
        <DataPanel
          title={t('right.tempTitle')}
          description={t('right.tempDesc')}
          exportLabel={t('right.exportJson')}
          importLabel={t('right.importJson')}
          onExport={() =>
            downloadJson('agent-assist-temp.json', buildTempExport(data))
          }
          onImport={() => tempInputRef.current?.click()}
        />
      </div>
      <input
        ref={permInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handlePermImport(f);
          e.target.value = '';
        }}
      />
      <input
        ref={tempInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleTempImport(f);
          e.target.value = '';
        }}
      />

      <div className="flex min-h-[10rem] flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 xl:min-h-[12rem]">
        <h3 className="text-sm font-semibold">{t('right.testTitle')}</h3>
        <p className="mb-3 mt-1 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
          {t('right.testHint')}
        </p>
        <TestTextarea data={data} />
      </div>

      <ImportOverwriteDialog
        importDialog={importDialog}
        onImportDialogChange={onImportDialogChange}
        onImportPermanent={onImportPermanent}
        onImportTemp={onImportTemp}
      />
    </aside>
  );
}
