function toBlob(data: BlobPart): Blob {
  if (data instanceof Blob) return data;
  return new Blob([data]);
}

export async function downloadFile(
  filename: string,
  data: BlobPart,
  mimeType: string,
): Promise<void> {
  const blob = toBlob(data);
  const typedBlob =
    blob.type === mimeType ? blob : new Blob([blob], { type: mimeType });
  const url = URL.createObjectURL(typedBlob);

  try {
    if (typeof chrome !== 'undefined' && chrome.downloads?.download) {
      const downloadId = await chrome.downloads.download({
        url,
        filename,
        saveAs: false,
      });
      if (downloadId !== undefined) {
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return;
      }
    }
  } catch {
    // Fall back to anchor download below.
  }

  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 1_000);
}
