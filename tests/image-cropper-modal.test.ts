/**
 * Regression Test Suite for ImageCropperModal (Bug 1 - Profile Picture Cropper Dead Button)
 *
 * Verifies:
 * 1. Data-URL / already-complete image: HTMLImageElement has complete=true and naturalWidth > 0.
 *    The open/reset effect or ref callback recognizes this, setting imageLoaded=true without
 *    needing a newly dispatched onLoad event.
 * 2. #cropper_apply_btn becomes enabled (disabled=false).
 * 3. Clicking #cropper_apply_btn invokes the crop path and calls onCropComplete with cropped output.
 * 4. Image error path: onError triggers visible error alert inside the dialog (#cropper_error_message)
 *    and Apply button remains disabled.
 */

import assert from 'node:assert';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ImageCropperModal } from '../src/components/common/ImageCropperModal';
import { LanguageProvider } from '../src/context/LanguageContext';

// ============================================================================
// Lightweight Browser DOM Simulation for React 19 Client Environment
// ============================================================================

class SimpleEventTarget {
  _listeners: Record<string, Array<(e: any) => void>> = {};

  addEventListener(type: string, fn: (e: any) => void) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push(fn);
  }

  removeEventListener(type: string, fn: (e: any) => void) {
    if (this._listeners[type]) {
      this._listeners[type] = this._listeners[type].filter((l) => l !== fn);
    }
  }

  dispatchEvent(event: any): boolean {
    const list = this._listeners[event.type];
    if (list) {
      for (const listener of [...list]) {
        listener.call(this, event);
      }
    }
    return true;
  }
}

class DOMNode extends SimpleEventTarget {
  static ELEMENT_NODE = 1;
  static TEXT_NODE = 3;
  static COMMENT_NODE = 8;
  static DOCUMENT_NODE = 9;

  nodeType: number = 1;
  nodeName: string = '';
  childNodes: DOMNode[] = [];
  parentNode: DOMNode | null = null;
  ownerDocument: any = null;

  override dispatchEvent(event: any): boolean {
    event.target = event.target || this;
    let curr: DOMNode | null = this;
    while (curr) {
      event.currentTarget = curr;
      const list = curr._listeners[event.type];
      if (list) {
        for (const listener of [...list]) {
          listener.call(curr, event);
          if (event._propagationStopped) return true;
        }
      }
      curr = curr.parentNode;
    }
    return true;
  }

  appendChild<T extends DOMNode>(child: T): T {
    child.parentNode = this;
    this.childNodes.push(child);
    return child;
  }

  removeChild<T extends DOMNode>(child: T): T {
    const idx = this.childNodes.indexOf(child);
    if (idx !== -1) {
      this.childNodes.splice(idx, 1);
    }
    child.parentNode = null;
    return child;
  }

  insertBefore<T extends DOMNode>(child: T, referenceNode: DOMNode | null): T {
    child.parentNode = this;
    const idx = referenceNode ? this.childNodes.indexOf(referenceNode) : -1;
    if (idx === -1) {
      this.childNodes.push(child);
    } else {
      this.childNodes.splice(idx, 0, child);
    }
    return child;
  }

  contains(other: DOMNode | null): boolean {
    let curr = other;
    while (curr) {
      if (curr === this) return true;
      curr = curr.parentNode;
    }
    return false;
  }

  querySelector(selector: string): DOMElement | null {
    for (const child of this.childNodes) {
      if (child.nodeType === 1) {
        const el = child as DOMElement;
        if (selector.startsWith('#')) {
          const targetId = selector.slice(1);
          if (el.id === targetId || el.getAttribute('id') === targetId) {
            return el;
          }
        } else if (selector.startsWith('.')) {
          const targetClass = selector.slice(1);
          if (el.className && el.className.split(' ').includes(targetClass)) {
            return el;
          }
        } else {
          if (el.tagName.toLowerCase() === selector.toLowerCase()) {
            return el;
          }
        }
        const found = el.querySelector(selector);
        if (found) return found;
      }
    }
    return null;
  }
}

class DOMElement extends DOMNode {
  tagName: string;
  id: string = '';
  className: string = '';
  style: Record<string, any> = {};
  attributes: Record<string, any> = {};
  private _disabled: boolean = false;
  role?: string;

  constructor(tagName: string = 'div') {
    super();
    this.nodeType = 1;
    this.tagName = tagName.toUpperCase();
    this.nodeName = this.tagName;
  }

  get disabled(): boolean {
    return this._disabled || this.attributes['disabled'] !== undefined;
  }

  set disabled(val: boolean) {
    this._disabled = Boolean(val);
    if (val) this.attributes['disabled'] = '';
    else delete this.attributes['disabled'];
  }

  setAttribute(name: string, value: any) {
    this.attributes[name] = String(value);
    if (name === 'id') this.id = String(value);
    if (name === 'class') this.className = String(value);
    if (name === 'role') this.role = String(value);
    if (name === 'disabled') this._disabled = true;
  }

  getAttribute(name: string): string | null {
    if (name === 'id') return this.id || null;
    if (name === 'class') return this.className || null;
    if (name === 'role') return this.role || null;
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  removeAttribute(name: string) {
    delete this.attributes[name];
    if (name === 'id') this.id = '';
    if (name === 'class') this.className = '';
    if (name === 'role') this.role = undefined;
    if (name === 'disabled') this._disabled = false;
  }

  getBoundingClientRect() {
    return {
      width: 288,
      height: 288,
      top: 0,
      left: 0,
      right: 288,
      bottom: 288,
      x: 0,
      y: 0,
      toJSON: () => {},
    };
  }

  setPointerCapture() {}
  releasePointerCapture() {}

  click() {
    this.dispatchEvent({
      type: 'click',
      target: this,
      currentTarget: this,
      preventDefault: () => {},
      stopPropagation: () => {},
    });
  }
}

class MockHTMLElement extends DOMElement {}

class MockHTMLImageElement extends MockHTMLElement {
  static defaultComplete: boolean = true;
  static defaultNaturalWidth: number = 400;
  static defaultNaturalHeight: number = 400;

  src: string = '';
  complete: boolean = true;
  naturalWidth: number = 400;
  naturalHeight: number = 400;

  constructor() {
    super('img');
    this.complete = MockHTMLImageElement.defaultComplete;
    this.naturalWidth = MockHTMLImageElement.defaultNaturalWidth;
    this.naturalHeight = MockHTMLImageElement.defaultNaturalHeight;
  }
}

class MockHTMLCanvasElement extends MockHTMLElement {
  width: number = 512;
  height: number = 512;

  constructor() {
    super('canvas');
  }

  getContext(contextId: string) {
    if (contextId === '2d') {
      return {
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
        fillStyle: '#FFFFFF',
        fillRect: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        scale: () => {},
        drawImage: () => {},
      };
    }
    return null;
  }

  toBlob(callback: (blob: Blob | null) => void, type?: string, quality?: any) {
    const mockBlob = {
      size: 4096,
      type: type || 'image/jpeg',
      slice: () => mockBlob,
    } as unknown as Blob;
    callback(mockBlob);
  }

  toDataURL(type?: string, quality?: any): string {
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/mockCroppedImage';
  }
}

class MockHTMLButtonElement extends MockHTMLElement {
  constructor() {
    super('button');
  }
}

class MockHTMLIFrameElement extends MockHTMLElement {
  constructor() {
    super('iframe');
  }
}

class MockDocument extends DOMNode {
  defaultView: any = null;
  documentElement: DOMElement;
  body: DOMElement;

  constructor() {
    super();
    this.nodeType = 9;
    this.nodeName = '#document';
    this.documentElement = new MockHTMLElement('html');
    this.documentElement.ownerDocument = this;
    (this.documentElement as any).lang = 'en';
    (this.documentElement as any).dir = 'ltr';
    this.body = new MockHTMLElement('body');
    this.body.ownerDocument = this;
    this.documentElement.appendChild(this.body);
    this.appendChild(this.documentElement);
  }

  createElement(tagName: string): DOMElement {
    const lower = tagName.toLowerCase();
    let el: DOMElement;
    if (lower === 'img') {
      el = new MockHTMLImageElement();
    } else if (lower === 'canvas') {
      el = new MockHTMLCanvasElement();
    } else if (lower === 'button') {
      el = new MockHTMLButtonElement();
    } else if (lower === 'iframe') {
      el = new MockHTMLIFrameElement();
    } else {
      el = new MockHTMLElement(tagName);
    }
    el.ownerDocument = this;
    return el;
  }

  createElementNS(_ns: string, tagName: string): DOMElement {
    return this.createElement(tagName);
  }

  createTextNode(text: string): DOMNode {
    const node = new DOMNode();
    node.nodeType = 3;
    node.nodeName = '#text';
    (node as any).nodeValue = text;
    (node as any).data = text;
    node.ownerDocument = this;
    return node;
  }

  createComment(data: string): DOMNode {
    const node = new DOMNode();
    node.nodeType = 8;
    node.nodeName = '#comment';
    (node as any).data = data;
    node.ownerDocument = this;
    return node;
  }
}

// Setup global browser simulation environment for React
const mockDocument = new MockDocument();
const mockWindowEvents = new SimpleEventTarget();
const mockWindow: any = {
  document: mockDocument,
  EventTarget: SimpleEventTarget,
  Node: DOMNode,
  Element: DOMElement,
  HTMLElement: MockHTMLElement,
  HTMLImageElement: MockHTMLImageElement,
  HTMLCanvasElement: MockHTMLCanvasElement,
  HTMLButtonElement: MockHTMLButtonElement,
  HTMLIFrameElement: MockHTMLIFrameElement,
  addEventListener: (t: string, fn: any) => mockWindowEvents.addEventListener(t, fn),
  removeEventListener: (t: string, fn: any) => mockWindowEvents.removeEventListener(t, fn),
  dispatchEvent: (e: any) => mockWindowEvents.dispatchEvent(e),
};
mockDocument.defaultView = mockWindow;

(global as any).window = mockWindow;
(global as any).document = mockDocument;
(global as any).EventTarget = SimpleEventTarget;
(global as any).Node = DOMNode;
(global as any).Element = DOMElement;
(global as any).HTMLElement = MockHTMLElement;
(global as any).HTMLImageElement = MockHTMLImageElement;
(global as any).HTMLCanvasElement = MockHTMLCanvasElement;
(global as any).HTMLButtonElement = MockHTMLButtonElement;
(global as any).HTMLIFrameElement = MockHTMLIFrameElement;
(global as any).IS_REACT_ACT_ENVIRONMENT = true;

// ============================================================================
// Test Suite Execution
// ============================================================================

async function runImageCropperModalSuite() {
  console.log('--- Running ImageCropperModal Regression Test Suite (Bug 1 P0) ---');

  // --------------------------------------------------------------------------
  // TEST 1: Data URL already complete image enables #cropper_apply_btn
  // --------------------------------------------------------------------------
  console.log('\n[Test 1] Testing already-complete image decoding & Apply button enablement...');

  const container1 = mockDocument.createElement('div');
  const root1 = createRoot(container1 as any);

  let cropResultBlob: Blob | null = null;
  let cropResultDataUrl: string | null = null;
  let closeCalled = false;

  const testDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/testImageString';

  // Mount ImageCropperModal with already complete image (complete = true, naturalWidth = 400)
  await act(async () => {
    root1.render(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(ImageCropperModal, {
          isOpen: true,
          imageSrc: testDataUrl,
          onClose: () => {
            closeCalled = true;
          },
          onCropComplete: (blob, dataUrl) => {
            cropResultBlob = blob;
            cropResultDataUrl = dataUrl;
          },
        })
      )
    );
  });

  const applyBtn = container1.querySelector('#cropper_apply_btn');
  assert(applyBtn, '#cropper_apply_btn must exist in rendered cropper dialog');

  // Crucial P0 assertion: button MUST be enabled when image is already complete
  assert.strictEqual(
    applyBtn.disabled,
    false,
    '#cropper_apply_btn must be enabled (disabled === false) for an already complete decoded image'
  );
  console.log('  ✅ #cropper_apply_btn successfully enabled for already-complete data-URL image');

  // --------------------------------------------------------------------------
  // TEST 2: Clicking #cropper_apply_btn invokes the crop path and calls onCropComplete
  // --------------------------------------------------------------------------
  console.log('\n[Test 2] Testing #cropper_apply_btn click execution and onCropComplete callback...');

  await act(async () => {
    applyBtn.click();
  });

  assert(cropResultBlob !== null, 'onCropComplete must receive cropped Blob output');
  assert(cropResultDataUrl !== null, 'onCropComplete must receive cropped dataUrl string');
  assert.strictEqual(
    cropResultDataUrl,
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/mockCroppedImage',
    'Cropped dataUrl must match canvas export output'
  );
  console.log('  ✅ onCropComplete successfully called with valid cropped Blob and dataUrl');

  // Unmount container1
  await act(async () => {
    root1.unmount();
  });

  // --------------------------------------------------------------------------
  // TEST 3: Broken image triggers onError -> visible error banner & button remains disabled
  // --------------------------------------------------------------------------
  console.log('\n[Test 3] Testing image error handling & visible error banner...');

  const container2 = mockDocument.createElement('div');
  const root2 = createRoot(container2 as any);

  // For this test, images are incomplete initially
  MockHTMLImageElement.defaultComplete = false;
  MockHTMLImageElement.defaultNaturalWidth = 0;

  await act(async () => {
    root2.render(
      React.createElement(
        LanguageProvider,
        null,
        React.createElement(ImageCropperModal, {
          isOpen: true,
          imageSrc: 'https://broken.domain.test/nonexistent.jpg',
          onClose: () => {},
          onCropComplete: () => {},
        })
      )
    );
  });

  const applyBtnIncomplete = container2.querySelector('#cropper_apply_btn');
  const imgEl = container2.querySelector('img');
  assert(applyBtnIncomplete, '#cropper_apply_btn must exist in dialog');
  assert.strictEqual(
    applyBtnIncomplete.disabled,
    true,
    '#cropper_apply_btn must remain disabled while image is incomplete'
  );

  assert(imgEl, '<img> element must exist in cropper viewport');

  await act(async () => {
    imgEl.dispatchEvent({ type: 'error' });
  });

  // Verify visible error alert is shown in the dialog
  const errorMsgEl = container2.querySelector('#cropper_error_message');
  assert(errorMsgEl, '#cropper_error_message must be rendered when image fails to load');
  assert.strictEqual(
    errorMsgEl.getAttribute('role'),
    'alert',
    '#cropper_error_message must have role="alert" for accessibility'
  );

  // Apply button must remain disabled on error
  assert.strictEqual(
    applyBtnIncomplete.disabled,
    true,
    '#cropper_apply_btn must remain disabled when image fails to load'
  );
  console.log('  ✅ Visible error banner displayed and Apply button securely remains disabled');

  // Restore MockHTMLImageElement defaults
  MockHTMLImageElement.defaultComplete = true;
  MockHTMLImageElement.defaultNaturalWidth = 400;

  await act(async () => {
    root2.unmount();
  });

  console.log('\n======================================================');
  console.log('🎉 ALL ImageCropperModal (Bug 1 P0) TESTS PASSED');
  console.log('======================================================');
}

runImageCropperModalSuite().catch((err) => {
  console.error('❌ ImageCropperModal test failed:', err);
  process.exit(1);
});
