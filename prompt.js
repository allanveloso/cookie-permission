// Injected into the page with chrome.scripting.executeScript. It is serialized,
// so it must not reference anything outside its own body.
export function showPrompt(site, current, hasDecision) {
  const HOST_ID = 'cookie-permission-prompt-host';
  document.getElementById(HOST_ID)?.remove();

  const host = document.createElement('div');
  host.id = HOST_ID;
  // Follow the browser UI direction (where the toolbar icon is), not the page's.
  const dir = chrome.i18n.getMessage('@@bidi_dir') === 'rtl' ? 'rtl' : 'ltr';
  host.lang = chrome.i18n.getUILanguage();
  host.style.cssText =
    `all:initial;position:fixed;top:8px;inset-inline-end:8px;direction:${dir};z-index:2147483647;`;
  const root = host.attachShadow({ mode: 'closed' });

  const t = (key, subs) => chrome.i18n.getMessage(key, subs);
  const stateText = {
    allow: t('stateAllow'),
    session_only: t('stateSessionOnly'),
    block: t('stateBlock'),
  }[current] ?? t('stateBlock');

  root.innerHTML = `
    <style>
      :host { color-scheme: light dark; }
      .bubble {
        --bg: #ffffff; --fg: #1f1f1f; --muted: #5e5e5e; --line: #c7c7c7;
        --primary: #0b57d0; --on-primary: #ffffff; --hover: rgba(11,87,208,.08);
        box-sizing: border-box; width: 320px; max-width: calc(100vw - 16px);
        padding: 16px; border-radius: 12px; background: var(--bg); color: var(--fg);
        font: 13px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        box-shadow: 0 2px 6px rgba(0,0,0,.18), 0 8px 24px rgba(0,0,0,.14);
      }
      @media (prefers-color-scheme: dark) {
        .bubble {
          --bg: #292a2d; --fg: #e3e3e3; --muted: #a8a8a8; --line: #5f6368;
          --primary: #a8c7fa; --on-primary: #062e6f; --hover: rgba(168,199,250,.1);
        }
      }
      .head { display: flex; align-items: flex-start; gap: 8px; }
      .text { flex: 1; min-width: 0; }
      .title { font-size: 14px; font-weight: 500; margin: 0 0 4px; overflow-wrap: anywhere; }
      .state { margin: 0; color: var(--muted); }
      .close {
        flex: none; width: 24px; height: 24px; border: 0; border-radius: 50%;
        background: none; color: var(--muted); font-size: 18px; line-height: 24px; cursor: pointer;
      }
      .close:hover { background: var(--hover); }
      .actions { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
      button.choice {
        font: inherit; font-weight: 500; padding: 8px 16px; border-radius: 18px; cursor: pointer;
        border: 1px solid var(--line); background: none; color: var(--primary); text-align: center;
      }
      button.choice:hover { background: var(--hover); }
      button.choice[data-current="true"] { background: var(--primary); color: var(--on-primary); border-color: var(--primary); }
      button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
      .forget {
        margin-top: 12px; padding: 0; border: 0; background: none; font: inherit;
        color: var(--muted); text-decoration: underline; cursor: pointer;
      }
    </style>
    <div class="bubble" role="dialog" aria-labelledby="t" aria-describedby="s">
      <div class="head">
        <div class="text">
          <p class="title" id="t"></p>
          <p class="state" id="s"></p>
        </div>
        <button class="close">×</button>
      </div>
      <div class="actions">
        <button class="choice" data-setting="allow"></button>
        <button class="choice" data-setting="session_only"></button>
        <button class="choice" data-setting="block"></button>
      </div>
      ${hasDecision ? '<button class="forget"></button>' : ''}
    </div>`;

  // Isolate the domain (always LTR) so it doesn't scramble RTL sentences.
  root.getElementById('t').textContent = t('promptTitle', [`\u2068${site}\u2069`]);
  root.getElementById('s').textContent = stateText;
  root.querySelector('.close').setAttribute('aria-label', t('buttonClose'));
  root.querySelector('[data-setting="allow"]').textContent = t('buttonAllow');
  root.querySelector('[data-setting="session_only"]').textContent = t('buttonSessionOnly');
  root.querySelector('[data-setting="block"]').textContent = t('buttonBlock');
  const forgetButton = root.querySelector('.forget');
  if (forgetButton) forgetButton.textContent = t('buttonForget');

  const close = () => {
    host.remove();
    document.removeEventListener('keydown', onKey, true);
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey, true);

  root.querySelector('.close').addEventListener('click', close);

  root.querySelectorAll('button.choice').forEach((button) => {
    if (hasDecision && button.dataset.setting === current) button.dataset.current = 'true';
    button.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'cookie-permission:decide', setting: button.dataset.setting });
      close();
    });
  });

  root.querySelector('.forget')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'cookie-permission:forget' });
    close();
  });

  (document.body ?? document.documentElement).appendChild(host);
}
