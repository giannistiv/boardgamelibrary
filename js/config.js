const CUBBY_CONFIG = {
  "1-5": {tall:true},
  "3-1": {tall:true},
  "4-3": {tall:true},
  "2-5": {skip:true},
  "4-1": {skip:true},
  "5-3": {skip:true},
};

const CATEGORIES = [
  "Strategy","Euro","Thematic","Family",
  "Deck Building","Worker Placement","Engine Building",
  "Card Game","Deduction","Area Control","Dice",
  "Solo","Puzzle","Party","Abstract","Adventure","Racing"
];
const EXPANSION_IDS = new Set(["mu_asgard", "mu_panther", "mu_spider", "mu_deadpool", "mu_xmen_gold", "mu_gotg", "mu_xmen_blue", "rove_xulc", "crimson_scales", "caverna_forgotten", "spirit_island_je", "spirit_ff", "spirit_bc", "feast_for_odin_exp", "heat_heavy_rain", "dune_immortality", "witcher_skellige", "witcher_wild_hunt", "kelp_expansion", "planet_unknown_super", "mdt_deadpool", "witcher_monster_trail_os", "witcher_mages_os", "witcher_legend_hunt_os", "etherfields_harpy_os", "earthborne_legacy_os", "gh_forgotten_circles_os", "on_mars_alien_os", "alchemists_golem_os", "hegemony_crisis_os", "crimson_scales_os", "dune_rise_ix_os", "kingdom_legacy_os", "auztralia_taz_os", "thunder_road_cc_os", "gh_buttons_bugs_os", "smartphone_update_os", "paleo_new_beg_os", "final_girl_ht_os", "azul_crystal_os", "magic_maze_ms_os", "paint_roses_esc_os", "abyss_leviathan_os", "underwater_data_os", "detective_bullets_os", "detective_saints_os", "sherlock_thames_os", "cthulhu_dmd_s2", "targi_exp_os"]);


// ── Shared render helpers ──
// The one HTML-escape used everywhere: null/undefined → '', escapes & < > " '.
function _escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// A player's chip in a play's score line (winner star, name, score, role).
// Shared by the game modal's play history and Explore's recent plays.
function _playScoreChipHtml(s) {
  const cls = s.w ? ' winner' : '';
  const trophy = s.w ? '<span class="trophy">&#9733;</span>' : '';
  const score = s.s ? ` (${s.s})` : '';
  const roleHtml = s.r ? `<span class="play-role">${s.r}</span>` : '';
  return `<span class="play-score${cls}"><span class="play-player"><span class="play-player-name">${trophy}${s.n}${score}</span>${roleHtml}</span></span>`;
}

// ── Filter helpers ──
function parseMaxTime(playTime) {
  // "60-120 min" → 120, "40 min" → 40
  const nums = playTime.replace(/[^0-9-]/g,'').split('-').map(Number);
  return Math.max(...nums);
}
function parseMinTime(playTime) {
  const nums = playTime.replace(/[^0-9-]/g,'').split('-').map(Number);
  return Math.min(...nums);
}
function parsePlayers(pStr) {
  // "2-4" → [2,3,4], "1" → [1], "2-6" → [2,3,4,5,6]
  const parts = pStr.split('-').map(Number);
  if (parts.length === 1) return [parts[0]];
  const arr = [];
  for (let i = parts[0]; i <= parts[1]; i++) arr.push(i);
  return arr;
}
function difficultyBucket(complexity) {
  if (complexity <= 2.1) return 'easy';
  if (complexity <= 3.1) return 'medium';
  if (complexity <= 4.1) return 'hard';
  return 'expert';
}
// Games that have no winners or losers at all (purely cooperative/zen builders
// with no win condition). Imported games carry no categories, so coop can't be
// auto-detected — list these explicitly so plays aren't scored as losses.
//   456440 = Cozy Stickerville
const NO_RESULT_GAMES = new Set([456440]);
function isNoResultGame(bggId) {
  return NO_RESULT_GAMES.has(Number(bggId));
}
// Campaign / legacy games played across a fixed number of stages. The current
// stage is parsed from each play's board/scenario tag (the `b` field).
// Two tag formats are supported:
//   'number'       → single number, e.g. "Year 1" / "Mission 6" / "Chapter 12"
//   'folder-clock' → "folder-clock", e.g. "2-1"  (index = (folder-1)*perFolder + clock)
// `wonOnly` counts only plays that were won (win-gated campaigns).
// `reached` controls the line under the bar: 'stage' = computed stage,
//   'tag' = the raw furthest tag (e.g. the full chapter name). `reachedPrefix`
//   is the lead-in word for that line.
// `complete` short-circuits to a finished 100% state (green bar) — for
//   campaigns the user has fully cleared, or ones whose plays carry no stage
//   tags to compute progress from. `completeText` is the line under the bar.
//   456440 = Cozy Stickerville (10 in-game years)
//   440540 = Take Time (10 folders × 4 clocks = 40 missions, win-gated)
//   413246 = Bomb Busters (66 missions, win-gated)
//   251661 = Oathsworn (21 chapters)
//   284083 = The Crew: Quest for Planet Nine (50 missions, win-gated)
//   429293 = Fellowship of the Ring trick-taking (18 chapters; tags mix
//            "Campaign N"/"Chapter N" — only the number matters)
//   291457 = Gloomhaven: Jaws of the Lion (campaign finished)
//   295770 = Frosthaven (campaign finished; plays carry no scenario tags)
//   241451 = Aeon's End: Legacy (legacy campaign finished)
const CAMPAIGN_PROGRESS = {
  456440: { total: 10, label: 'Year', format: 'number' },
  440540: { total: 40, perFolder: 4, format: 'folder-clock', wonOnly: true, reachedPrefix: 'Furthest won' },
  413246: { total: 66, label: 'Mission', format: 'number', wonOnly: true },
  251661: { total: 21, label: 'Chapter', format: 'number', reached: 'tag', reachedPrefix: 'Latest' },
  284083: { total: 50, label: 'Mission', format: 'number', wonOnly: true },
  429293: { total: 18, label: 'Chapter', format: 'number', wonOnly: true },
  291457: { complete: true, completeText: '✓ Campaign finished' },
  295770: { complete: true, completeText: '✓ Campaign finished' },
  241451: { complete: true, completeText: '✓ Legacy finished' },
};
function campaignProgress(bggId, plays) {
  const cfg = CAMPAIGN_PROGRESS[Number(bggId)];
  if (!cfg || !plays || !plays.length) return null;
  if (cfg.complete) {
    return {
      current: cfg.total || 0, total: cfg.total || 0, pct: 100, complete: true,
      stageText: cfg.completeStage || 'Complete',
      reachedText: cfg.completeText || '✓ Campaign complete',
    };
  }
  const fmt = cfg.format || 'number';
  const perFolder = cfg.perFolder || 1;
  let current = 0, bestTag = '';
  for (const p of plays) {
    if (cfg.wonOnly && !(p.sc || []).some(s => s.w)) continue;
    let idx = 0;
    if (fmt === 'folder-clock') {
      const m = String(p.b || '').match(/(\d+)\s*-\s*(\d+)/);
      if (m) idx = (parseInt(m[1], 10) - 1) * perFolder + parseInt(m[2], 10);
    } else {
      const m = String(p.b || '').match(/\d+(?:\.\d+)?/);
      if (m) idx = parseFloat(m[0]);
    }
    if (idx > current) { current = idx; bestTag = String(p.b || ''); }
  }
  if (current < 1) return null;
  const capped = Math.min(current, cfg.total);
  const pct = Math.round((capped / cfg.total) * 100);
  let stageText, reachedText = null;
  if (fmt === 'folder-clock') {
    const folder = Math.ceil(capped / perFolder);
    const clock = capped - (folder - 1) * perFolder;
    stageText = `${capped} of ${cfg.total}`;
    reachedText = `${cfg.reachedPrefix || 'Furthest'}: Folder ${folder}, clock ${clock}`;
  } else {
    stageText = `${cfg.label || 'Stage'} ${capped} of ${cfg.total}`;
    if (cfg.reached === 'tag' && bestTag) reachedText = `${cfg.reachedPrefix || 'Latest'}: ${bestTag}`;
    else if (cfg.reached === 'stage') reachedText = `${cfg.reachedPrefix || 'Furthest'}: ${cfg.label || ''} ${capped}`.trim();
  }
  return { current: capped, total: cfg.total, pct, stageText, reachedText };
}

// ── Sky Team airport checklist ──
// Sky Team isn't a linear campaign — instead every play is a landing at a
// specific airport at a specific difficulty. We show all airports from the
// official flight log, tinted by difficulty, with a tick on the ones landed
// (a play that was *won*). Difficulty colours: Easy/green, Medium/yellow,
// Hard/red, Extreme/(black→violet so it stays visible on the dark UI).
