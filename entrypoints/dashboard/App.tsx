import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { CategoryModal, ShortcutForm } from '@/components/form';
import { AppHeader } from '@/components/layout';
import { LeftSidebar, RightSidebar } from '@/components/sidebar';
import type { ImportDialogState } from '@/components/sidebar/right';
import { useAppData } from '@/hooks/use-app-data';
import { useDashboardActions } from '@/hooks/use-dashboard-actions';
import { useUiLocale } from '@/hooks/use-ui-locale';
import { useUiTheme } from '@/hooks/use-ui-theme';
import { useUndoToast } from '@/hooks/use-undo-toast';
import { setDropdownEnabled, setEnabled } from '@/lib/storage';
import { TEMP_CATEGORY_ID } from '@/shared/constants';
import type { Shortcut, ShortcutKind, Category } from '@/shared/types';

export default function App() {
  const { theme, setUiTheme } = useUiTheme();
  const { setUiLocale, t, dir } = useUiLocale();
  const { data, setData, refresh, persist } = useAppData();

  const [editing, setEditing] = useState<Shortcut | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formKind, setFormKind] = useState<ShortcutKind>('permanent');
  const [importDialog, setImportDialog] = useState<ImportDialogState>(null);

  const scheduleUndo = useUndoToast(persist, refresh, t);

  const {
    handleDeleteShortcut,
    handleDeleteCategory,
    handleFormSubmit,
    handleImportPermanent,
    handleImportTemp,
    handleClearCategories,
    handleAddCategory,
    handleUpdateCategory,
  } = useDashboardActions({
    data,
    editing,
    persist,
    scheduleUndo,
    t,
    setEditing,
    setSelectedCategoryId,
    setData,
  });

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-[var(--color-muted-foreground)]">
        {t('app.loading')}
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden" data-snippet-assist>
      <AppHeader
        extensionEnabled={data.enabled}
        theme={theme}
        onThemeChange={setUiTheme}
        onLocaleChange={setUiLocale}
      />

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <LeftSidebar
          data={data}
          enabled={data.enabled}
          dropdownEnabled={data.dropdownEnabled}
          onEnabledChange={async (enabled) => {
            const next = await setEnabled(enabled);
            setData(next);
            toast.success(
              enabled ? t('toast.extensionEnabled') : t('toast.extensionDisabled'),
            );
          }}
          onDropdownEnabledChange={async (dropdownEnabled) => {
            const next = await setDropdownEnabled(dropdownEnabled);
            setData(next);
            toast.success(
              dropdownEnabled
                ? t('toast.dropdownEnabled')
                : t('toast.dropdownDisabled'),
            );
          }}
          selectedId={editing?.id ?? null}
          selectedCategoryId={selectedCategoryId}
          onSelectShortcut={(shortcut) => {
            setEditing(shortcut);
            setFormKind(shortcut.kind);
          }}
          onSelectCategory={(id) => {
            setSelectedCategoryId(id);
            setFormKind(id === TEMP_CATEGORY_ID ? 'temp' : 'permanent');
            setEditing(null);
            setFormResetKey((key) => key + 1);
          }}
          onDeleteShortcut={handleDeleteShortcut}
          onEditCategory={(category) => {
            setEditingCategory(category);
            setCategoryModalOpen(true);
          }}
          onDeleteCategory={handleDeleteCategory}
          onClearCategories={() => void handleClearCategories()}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
          <main className="min-h-0 min-w-0 shrink-0 px-[var(--layout-gutter)] py-5 xl:flex-1 xl:overflow-y-auto xl:py-8">
            <div className="mx-auto w-full max-w-[var(--layout-content-max)]">
              <ShortcutForm
                data={data}
                editing={editing}
                kind={formKind}
                onKindChange={(kind) => {
                  setFormKind(kind);
                  if (editing && editing.kind !== kind) {
                    setEditing(null);
                  }
                  if (kind === 'temp') {
                    setSelectedCategoryId(TEMP_CATEGORY_ID);
                  }
                }}
                selectedCategoryId={selectedCategoryId}
                formResetKey={formResetKey}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setEditing(null);
                  setSelectedCategoryId(null);
                }}
                onNewCategory={() => {
                  setEditingCategory(null);
                  setCategoryModalOpen(true);
                }}
              />
            </div>
          </main>

          <RightSidebar
            data={data}
            importDialog={importDialog}
            onImportDialogChange={setImportDialog}
            onImportPermanent={handleImportPermanent}
            onImportTemp={handleImportTemp}
          />
        </div>
      </div>

      <CategoryModal
        open={categoryModalOpen}
        onOpenChange={(open) => {
          setCategoryModalOpen(open);
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory}
        onAdd={(category) => void handleAddCategory(category)}
        onUpdate={(category) => void handleUpdateCategory(category)}
      />

      <Toaster
        position="bottom-right"
        richColors
        closeButton
        theme={theme}
        dir={dir}
      />
    </div>
  );
}
