export async function broadcastToTabs(message: unknown): Promise<void> {
  const tabs = await browser.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id) continue;
    try {
      await browser.tabs.sendMessage(tab.id, message);
    } catch {
      continue;
    }
  }
}
