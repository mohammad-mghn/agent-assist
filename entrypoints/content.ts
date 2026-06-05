import { initSnippetAssistContentScript } from '@/lib/content-script/snippet-assist';

export default defineContentScript({
  matches: ['<all_urls>'],
  allFrames: true,
  runAt: 'document_idle',
  main() {
    initSnippetAssistContentScript();
  },
});
