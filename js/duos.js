// ── Best duo / best team, on a co-op game's page (Plays tab) ──
// Each exact line-up that has played the game together, with how often it
// won: the best one on top, then everyone else's percentages. "Duo" when the
// game is only ever played by two, "team" otherwise. Ranked by the win rate
// shown (more games first on a tie), counting teams with 3+ games together so
// one lucky night doesn't top the list. Shown only when at least two teams
// qualify. Leviathan Wilds is left out.

const DUO_SKIP = new Set([358737]);
const DUO_MIN_GAMES = 3;   // games together before a team is ranked

function buildBestTeamsHtml(game, plays) {
  const id = Number(game && game.bggId);
  if (!id || DUO_SKIP.has(id) || !plays || plays.length < 4 || isNoResultGame(id)) return '';
  if (!_recIsCoop(game, plays)) return '';
  // a two-player game (Sky Team) is about duos, even if a play was logged with a third
  const range = typeof _gbPlayerRange === 'function' ? _gbPlayerRange(game.players) : null;
  const twoOnly = !!range && range[1] === 2;
  const teams = new Map();
  let n = 0, won = 0, big = false;
  for (const p of plays) {
    const sc = (p.sc || []).filter(s => s && s.n);
    const names = [...new Set(sc.map(s => s.n))].sort((a, b) => a.localeCompare(b));
    if (names.length < 2 || (twoOnly && names.length > 2) || isNoResultPlay(p, id)) continue;
    const w = sc.filter(s => s.w).length;
    if (w && w < sc.length) continue;   // played competitively that time
    const key = names.join('\u0000');
    const t = teams.get(key) || { names, n: 0, w: 0 };
    t.n++; if (w) t.w++;
    teams.set(key, t);
    n++; if (w) won++;
  }
  const ranked = [...teams.values()].filter(t => t.n >= DUO_MIN_GAMES);
  if (ranked.length < 2) return '';
  big = ranked.some(t => t.names.length > 2);
  const base = won / n;
  ranked.forEach(t => { t.rate = t.w / t.n; });
  ranked.sort((a, b) => b.rate - a.rate || b.n - a.n);
  const once = teams.size - ranked.length;
  const word = big ? 'team' : 'duo';
  const me = typeof _ptViewer === 'function' ? _ptViewer() : null;
  const esc = _escapeHtml;
  const pct = (t) => Math.round(t.rate * 100);
  const names = (t) => t.names.map(esc).join(big ? ', ' : ' &amp; ');
  const row = (t, i) => `
          <div class="bt-row${t.names.includes(me) ? ' mine' : ''}${i === 0 ? ' best' : ''}">
            <span class="bt-names">${i === 0 ? '&#127942; ' : ''}${names(t)}</span>
            <span class="bt-val">${t.w}/${t.n} &middot; <b>${pct(t)}%</b></span>
            <span class="pt-p-bar bt-bar"><i style="width:${Math.max(3, pct(t))}%"></i></span>
          </div>`;
  return `
        <div class="gi-block bt-block">
          <div class="gr-title">Best ${word}</div>
          <div class="gi-sub">How often each ${word} won, for the ${ranked.length} with ${DUO_MIN_GAMES}+ games together${once ? ` (${once} more with fewer)` : ''}. Usually ${Math.round(base * 100)}% here.</div>
          ${ranked.map(row).join('')}
        </div>`;
}
