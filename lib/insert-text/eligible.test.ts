import { describe, expect, it } from 'vitest';
import {
  findEditableInFrame,
  getDeepActiveElement,
  resolveEligibleElement,
} from '@/lib/insert-text/eligible';

describe('getDeepActiveElement', () => {
  it('traverses into same-origin iframe active elements', () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);

    const doc = frame.contentDocument!;
    doc.open();
    doc.write('<body contenteditable="true"></body>');
    doc.close();

    const editableBody = doc.body;
    editableBody.innerHTML = '<p>Hello</p>';
    editableBody.focus();

    frame.focus();
    expect(getDeepActiveElement()).toBe(editableBody);

    frame.remove();
  });
});

describe('findEditableInFrame', () => {
  it('finds a contenteditable body inside a wysiwyg iframe', () => {
    const frame = document.createElement('iframe');
    frame.className = 'cke_wysiwyg_frame cke_reset';
    document.body.appendChild(frame);

    const doc = frame.contentDocument!;
    doc.open();
    doc.write(
      '<body contenteditable="true" class="cke_editable cke_editable_themed"></body>',
    );
    doc.close();

    expect(findEditableInFrame(frame)).toBe(doc.body);

    frame.remove();
  });

  it('finds designMode document bodies', () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);

    const doc = frame.contentDocument!;
    doc.designMode = 'on';

    expect(findEditableInFrame(frame)).toBe(doc.body);

    frame.remove();
  });
});

describe('resolveEligibleElement', () => {
  it('resolves iframe targets to the editable body inside', () => {
    const frame = document.createElement('iframe');
    frame.className = 'cke_wysiwyg_frame';
    document.body.appendChild(frame);

    const doc = frame.contentDocument!;
    doc.open();
    doc.write('<body contenteditable="true" class="cke_editable"></body>');
    doc.close();

    expect(resolveEligibleElement(frame)).toBe(doc.body);

    frame.remove();
  });

  it('resolves nested contenteditable nodes to the host body', () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);

    const doc = frame.contentDocument!;
    doc.open();
    doc.write('<body contenteditable="true" class="cke_editable"></body>');
    doc.close();

    const paragraph = document.createElement('p');
    paragraph.textContent = 'test';
    doc.body.appendChild(paragraph);
    paragraph.focus();

    expect(resolveEligibleElement(paragraph)).toBe(doc.body);

    frame.remove();
  });
});
