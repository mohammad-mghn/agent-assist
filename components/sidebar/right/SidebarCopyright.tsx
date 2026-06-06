import { useUiLocale } from '@/hooks/use-ui-locale';
import { siteConfig } from '@/lib/site';

const linkClassName =
  'underline-offset-2 transition-colors hover:text-[var(--color-foreground)] hover:underline';

export function SidebarCopyright() {
  const { t } = useUiLocale();
  const { hassan, mohammad } = siteConfig.authors;

  return (
    <div className="border-t border-[var(--color-border)] pt-4">
      <p className="text-center text-xs text-[var(--color-muted-foreground)]">
        {t('right.copyrightPrefix')}{' '}
        <a
          href={hassan.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {hassan.name}
        </a>
        {' & '}
        <a
          href={mohammad.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {mohammad.name}
        </a>
      </p>
    </div>
  );
}
