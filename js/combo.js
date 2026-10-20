// ── A text field with its own list of choices ──
// The browser's suggestion lists (datalist) only show what matches the text
// already in the field, and on some phones draw half see-through over the
// page. This one shows every choice when the field is tapped, narrows them
// as you type, and closes (putting the keyboard away) once one is picked.
//   comboAttach(input, { options: () => [string], onPick: (value) => {}, max })

function comboAttach(input, opts) {
  if (!input || input._combo) return;
  // the list hangs right under the field: the field gets a wrapper of its own
  const wrap = document.createElement('div');
  wrap.className = 'combo-wrap';
  input.insertAdjacentElement('beforebegin', wrap);
  wrap.appendChild(input);
  const list = document.createElement('div');
  list.className = 'combo-list';
  list.hidden = true;
  list.setAttribute('role', 'listbox');
  input.insertAdjacentElement('afterend', list);
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-expanded', 'false');
  let typed = false;   // narrow the list only once something's been typed since the tap
  let active = -1;

  const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const render = () => {
    const q = typed ? fold(input.value.trim()) : '';
    const all = (opts.options() || []).filter(Boolean);
    const shown = (q ? all.filter(o => fold(o).includes(q)) : all).slice(0, opts.max || 200);
    active = -1;
    list.innerHTML = shown.map((o, i) => `<button type="button" class="combo-opt" role="option" data-i="${i}" tabindex="-1">${_escapeHtml(o)}</button>`).join('');
    list._shown = shown;
    list.hidden = !shown.length;
    input.setAttribute('aria-expanded', String(!list.hidden));
  };
  const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); };
  const pick = (value) => {
    input.value = value;
    close();
    input.blur();   // the choice is made: put the keyboard away
    input.dispatchEvent(new Event('input', { bubbles: true }));
    if (opts.onPick) opts.onPick(value);
  };

  input.addEventListener('focus', () => { typed = false; render(); });
  input.addEventListener('click', () => { if (list.hidden) { typed = false; render(); } });
  input.addEventListener('input', (e) => { if (e.isTrusted) { typed = true; render(); } });
  input.addEventListener('blur', () => setTimeout(close, 150));
  input.addEventListener('keydown', (e) => {
    const opts2 = [...list.querySelectorAll('.combo-opt')];
    if (e.key === 'Escape' && !list.hidden) { e.stopPropagation(); close(); return; }
    if (!opts2.length || list.hidden) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + opts2.length) % opts2.length;
      opts2.forEach((b, i) => b.classList.toggle('on', i === active));
      opts2[active].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      e.stopPropagation();
      pick(list._shown[active]);
    }
  });
  // a press on a choice mustn't blur the field first (that would close the list)
  list.addEventListener('pointerdown', (e) => e.preventDefault());
  list.addEventListener('click', (e) => {
    const b = e.target.closest('.combo-opt');
    if (b) pick(list._shown[Number(b.dataset.i)]);
  });
  input._combo = { close, render };
}
