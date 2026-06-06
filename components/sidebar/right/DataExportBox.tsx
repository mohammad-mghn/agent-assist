import { DataPanel } from '@/components/sidebar/right/DataPanel';
import {
  FormatTabs,
  type ExportFormat,
} from '@/components/sidebar/right/FormatTabs';
import { useUiLocale } from '@/hooks/use-ui-locale';

interface DataExportBoxProps {
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  onDownloadPermanentTemplate: () => void;
  onDownloadTempTemplate: () => void;
  onExportPermanent: () => void;
  onImportPermanent: () => void;
  onExportTemp: () => void;
  onImportTemp: () => void;
}

export function DataExportBox({
  format,
  onFormatChange,
  onDownloadPermanentTemplate,
  onDownloadTempTemplate,
  onExportPermanent,
  onImportPermanent,
  onExportTemp,
  onImportTemp,
}: DataExportBoxProps) {
  const { t } = useUiLocale();
  const isExcel = format === 'excel';
  const exportLabel = isExcel ? t('right.exportExcel') : t('right.exportJson');
  const importLabel = isExcel ? t('right.importExcel') : t('right.importJson');

  return (
    <div className="min-w-0 space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3 xl:p-4">
      <FormatTabs format={format} onFormatChange={onFormatChange} />

      <div className="space-y-3">
        <DataPanel
          title={t('right.permanentTitle')}
          description={t('right.permanentDesc')}
          templateLabel={t('right.downloadPermanentTemplate')}
          exportLabel={exportLabel}
          importLabel={importLabel}
          onDownloadTemplate={onDownloadPermanentTemplate}
          onExport={onExportPermanent}
          onImport={onImportPermanent}
          nested
        />
        <DataPanel
          title={t('right.tempTitle')}
          description={t('right.tempDesc')}
          templateLabel={t('right.downloadTempTemplate')}
          exportLabel={exportLabel}
          importLabel={importLabel}
          onDownloadTemplate={onDownloadTempTemplate}
          onExport={onExportTemp}
          onImport={onImportTemp}
          nested
        />
      </div>
    </div>
  );
}
