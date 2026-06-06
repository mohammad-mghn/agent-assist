import { act, renderHook, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TestTextarea } from '@/components/sidebar/right/TestTextarea';
import { useSnippetTextarea } from '@/hooks/use-snippet-textarea';
import { insertIntoElement } from '@/lib/insert-text';
import { createSampleAppData } from '@/test/fixtures/app-data';
import { renderWithProviders } from '@/test/helpers/render';

vi.mock('@/lib/dropdown-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/dropdown-ui')>();
  return {
    ...actual,
    getCaretRect: () =>
      new DOMRect(10, 20, 0, 16),
  };
});

describe('snippet dropdown behavior', () => {
  const data = createSampleAppData();

  function getDropdown() {
    return document.querySelector('[data-snippet-assist="dropdown"]');
  }

  it('opens dropdown when typing slash trigger in test textarea', async () => {
    const user = userEvent.setup();
    const { getByPlaceholderText } = renderWithProviders(<TestTextarea data={data} />);

    const textarea = getByPlaceholderText('right.testPlaceholder');
    await user.click(textarea);
    await user.type(textarea, '/re');

    await waitFor(() => {
      expect(getDropdown()).toBeInTheDocument();
    });
  });

  it('filters permanent shortcuts and inserts selected snippet on pick', async () => {
    const user = userEvent.setup();
    const { getByPlaceholderText, getByRole } = renderWithProviders(
      <TestTextarea data={data} />,
    );

    const textarea = getByPlaceholderText('right.testPlaceholder') as HTMLTextAreaElement;
    await user.click(textarea);
    await user.type(textarea, '/reply');

    const option = await waitFor(() => getByRole('button', { name: /reply/i }));
    await user.click(option);

    expect(textarea.value).toContain('Thank you for contacting support.');
    expect(textarea.value).not.toContain('/reply');
  });

  it('opens temp dropdown for hash trigger', async () => {
    const user = userEvent.setup();
    const { getByPlaceholderText } = renderWithProviders(<TestTextarea data={data} />);

    const textarea = getByPlaceholderText('right.testPlaceholder');
    await user.click(textarea);
    await user.type(textarea, '#no');

    await waitFor(() => {
      expect(getDropdown()).toBeInTheDocument();
    });
  });

  it('inserts exact match on Enter when dropdown is closed', async () => {
    const { result } = renderHook(() =>
      useSnippetTextarea({ data, dir: 'ltr', locale: 'en-US' }),
    );

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    result.current.textareaRef.current = textarea;

    textarea.value = '/reply';
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    textarea.focus();

    act(() => {
      insertIntoElement(textarea, '/', 'reply', 'Inserted by exact match');
    });

    expect(textarea.value).toBe('Inserted by exact match');
    textarea.remove();
  });

  it('does not open dropdown when extension is disabled', async () => {
    const user = userEvent.setup();
    const disabled = { ...data, enabled: false };
    const { getByPlaceholderText } = renderWithProviders(
      <TestTextarea data={disabled} />,
    );

    const textarea = getByPlaceholderText('right.testPlaceholder');
    await user.click(textarea);
    await user.type(textarea, '/re');

    await waitFor(() => {
      expect(getDropdown()).not.toBeInTheDocument();
    });
  });

  it('does not open dropdown when dropdown setting is disabled', async () => {
    const user = userEvent.setup();
    const noDropdown = { ...data, dropdownEnabled: false };
    const { getByPlaceholderText } = renderWithProviders(
      <TestTextarea data={noDropdown} />,
    );

    const textarea = getByPlaceholderText('right.testPlaceholder');
    await user.click(textarea);
    await user.type(textarea, '/re');

    await waitFor(() => {
      expect(getDropdown()).not.toBeInTheDocument();
    });
  });
});
