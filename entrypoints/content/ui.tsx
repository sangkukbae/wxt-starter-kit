import { useEffect, useState, type FC } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { createShadowRootUi } from 'wxt/client';
import type { ContentScriptContext } from 'wxt/client';

interface UiController {
  updateSelection: (value: string) => void;
  flashMessage: (text: string) => void;
  destroy: () => void;
}

export async function createShadowRootUI(ctx: ContentScriptContext): Promise<UiController> {
  const mountNodes = new WeakMap<Root, HTMLElement>();
  const control: {
    setSelection: (value: string) => void;
    toast: (text: string) => void;
  } = {
    setSelection: () => undefined,
    toast: () => undefined,
  };

  const App: FC = () => {
    const [selection, setSelection] = useState('');
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
      control.setSelection = setSelection;
      control.toast = (text: string) => {
        setToast(text);
        setTimeout(() => setToast(null), 2400);
      };
    }, []);

    return (
      <div className="wxt-starter shadow-panel">
        <header>
          <strong>WXT Starter Helper</strong>
          <span className="badge">Content Script</span>
        </header>
        <section>
          <h4>Current Selection</h4>
          <p className={selection ? '' : 'empty'}>{selection || 'No selection detected'}</p>
        </section>
        {toast && <div className="toast">{toast}</div>}
      </div>
    );
  };

  const ui = await createShadowRootUi<Root>(ctx, {
    name: 'wxt-starter-panel',
    position: 'inline',
    mode: 'open',
    onMount: (container) => {
      const mountNode = document.createElement('div');
      container.append(mountNode);

      const root = createRoot(mountNode);
      mountNodes.set(root, mountNode);

      root.render(<App />);
      return root;
    },
    onRemove: (root) => {
      if (!root) return;

      root.unmount();
      mountNodes.get(root)?.remove();
      mountNodes.delete(root);
    },
  });

  ui.mount();

  return {
    updateSelection: (value) => control.setSelection(value),
    flashMessage: (text) => control.toast(text),
    destroy: () => {
      ui.remove();
    },
  };
}
