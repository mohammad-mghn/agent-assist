import { initSnippetAssistContentScript } from '@/lib/content-script/snippet-assist';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    initSnippetAssistContentScript();
  },
});
