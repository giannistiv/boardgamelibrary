// ── The Rules tab on a game page: a one-screen reference card ──
// For the games you play (campaign games aside: you know those by heart),
// written from each game's official rulebook into data/rules.js and loaded
// only when the tab is first opened. The same layout for every game: the
// goal, your turn, the actions, the end of a round, the end of the game and
// its scoring, and what's easy to forget (a card may rename the turn and round
// headings, e.g. Kansas City or the harvest). The shared notes follow underneath.
// Expansions you own get a fold-out "With …" section on the base game's card,
// listing only what changes; an expansion's own page shows that card with its
// section already open.

let _rules = null, _rulesLoading = null;
function _loadRules() {
  if (_rules) return Promise.resolve(_rules);
  if (!_rulesLoading) {
    _rulesLoading = fetch('data/rules.js', { cache: 'no-cache' })
      .then(r => r.text())
      .then(src => (_rules = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1))))
      .catch(() => { _rulesLoading = null; return null; });   // offline with no saved copy
  }
  return _rulesLoading;
}

function buildRulesPanelHtml(game) {
  return `<div class="rules-card" data-rules-for="${game.bggId}"><div class="rules-wait">Loading the rules…</div></div>
    ${buildNotesHtml(game.bggId)}`;
}

// Fill the card in once the tab is showing.
async function wireRulesPanel(root, game) {
  const box = root && root.querySelector(`[data-rules-for="${game.bggId}"]`);
  if (!box || box.dataset.filled) return;
  const all = await _loadRules();
  if (!box.isConnected) return;
  if (!all) {
    box.innerHTML = '<div class="rules-none">The rules couldn\'t load. Check the connection and open the tab again.</div>';
    return;
  }
  box.dataset.filled = '1';
  let r = all[game.bggId], open = null, base = null;
  if (!r) {
    // an expansion: show its base game's card with this expansion folded out
    const id = Object.keys(all).find(k => (all[k].exp || []).some(e => e.id === game.bggId));
    if (id) { r = all[id]; open = game.bggId; base = (typeof GAMES !== 'undefined' && GAMES.find(g => g.bggId === Number(id))) || null; }
  }
  box.innerHTML = rulesCardHtml(game, r, open, base);
}

// **bold** in the card's text, everything else plain
const _rulesText = (t) => _escapeHtml(String(t || '')).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

function rulesCardHtml(game, r, openExp, base) {
  const aids = `https://boardgamegeek.com/boardgame/${game.bggId}/files`;
  if (!r) {
    return `<div class="rules-none">No rules card for this game yet.
      <a href="${aids}" target="_blank" rel="noopener">Player aids on BGG &#8599;</a></div>`;
  }
  const list = (items) => `<ul>${items.map(x => `<li>${_rulesText(x)}</li>`).join('')}</ul>`;
  const steps = (items) => `<ol>${items.map(x => `<li>${_rulesText(x)}</li>`).join('')}</ol>`;
  const sec = (title, body) => body ? `<section class="rules-sec"><h4>${title}</h4>${body}</section>` : '';
  const actions = r.actions && r.actions.length
    ? `<dl class="rules-acts">${r.actions.map(([name, what]) => `<dt>${_rulesText(name)}</dt><dd>${_rulesText(what)}</dd>`).join('')}</dl>` : '';
  const exps = (r.exp || []).map(e => `<details class="rules-exp"${e.id === openExp ? ' open' : ''}>
      <summary>With ${_rulesText(e.name)}</summary>${list(e.lines || [])}
      <div class="rules-exp-src">From ${_rulesText(e.src || 'its rulebook')}.</div></details>`).join('');
  return `<div class="rules-head"><span class="rules-title">&#128220; Rules</span><span class="rules-sub">quick reference</span></div>
    ${base ? `<p class="rules-base">This expansion's changes are folded out under ${_escapeHtml(base.name)}'s card below.</p>` : ''}
    ${r.goal ? `<p class="rules-goal">${_rulesText(r.goal)}</p>` : ''}
    ${sec(_rulesText(r.turnTitle || 'On your turn'), r.turn && r.turn.length ? steps(r.turn) : '')}
    ${sec('Actions', actions)}
    ${sec(_rulesText(r.roundTitle || 'End of a round'), r.round && r.round.length ? list(r.round) : '')}
    ${sec('End of the game', r.end && r.end.length ? list(r.end) : '')}
    ${sec('Easy to forget', r.forget && r.forget.length ? list(r.forget) : '')}
    ${sec('Expansions', exps)}
    <div class="rules-src">From ${_rulesText(r.src || 'the rulebook')}. Spot a mistake? Add a note below. &middot; <a href="${aids}" target="_blank" rel="noopener">Player aids on BGG &#8599;</a></div>`;
}
