/* Laboratorio di «Algoritmi euristici / Heuristic Algorithms»: metaeuristiche per il TSP.
 *
 *   oc-meta-tsp     simulated annealing e tabu search con il 2-opt (capitolo «Metaheuristics»): istanza di riferimento
 *                   (5 città), TSP20 e l'istanza a 6 città degli esercizi; numeri casuali di Park e Miller come nelle
 *                   note e nel codice C++ (SimulatedAnnealingTSP.cpp, TabuSearchTSP.cpp): con seed = 1 le prime
 *                   iterazioni rifanno l'esempio del capitolo (25 → 29 → 22 → 24 → 18).
 *
 * Copiato da Problemi di ottimizzazione combinatoria (gi-oc-f.js, sezioni 0 e 1) il 2026-11-21.
 * Formato delle ricette: commento in testa a interattivi.js; strumenti comuni in gi-comune.js e gi-oc-0.js.
 */
(function () {
  "use strict";
  const GI = window.GI, M = window.GI_MIP, O = window.GI_OC;
  const T = GI.T;
  const { PASSO, parPasso, vaiA, clamp, nuovoId, osservaDimensioni, nuovaVoce, dim, pix, disegno, daIndirizzo, chiedi, menuIstanze, mostraCursore, parkMiller, vetrina, scegliVoce } = O;
  window.GI_RICETTE = window.GI_RICETTE || {};

  // =================================================================
  // 0. STRUMENTI COMUNI
  // =================================================================
  /** numero con c decimali fissi: in TeX (virgola «{,}» in italiano) e in testo */
  const fx = (x, c) => { const s = (+x).toFixed(c); return GI.EN ? s : s.replace(".", "{,}"); };
  const fxt = (x, c) => { const s = (+x).toFixed(c); return GI.EN ? s : s.replace(".", ","); };
  const nt = (x) => GI.numTxt(x, 4);
  /** distanze euclidee arrotondate all'intero più vicino, come nelle note */
  const rotonda = (P) => P.map((a) => P.map((b) => Math.floor(Math.hypot(a[0] - b[0], a[1] - b[1]) + 0.5)));
  const lunghezza = (d, t) => t.reduce((s, c, i) => s + d[c][t[(i + 1) % t.length]], 0);
  const seq = (t) => "(" + t.map((c) => c + 1).join(", ") + ")";
  /** città su un cerchio, nell'ordine dato (in senso antiorario dall'alto), come il pentagono delle note */
  const sulCerchio = (ordine, r = 4) => {
    const P = [];
    ordine.forEach((c, k) => { const a = (90 + 360 * k / ordine.length) * Math.PI / 180; P[c] = [5 + r * Math.cos(a), 5 + r * Math.sin(a)]; });
    return P;
  };
  /** Held-Karp: giro ottimo (n <= 12) dalla città 0 */
  function heldKarp(d) {
    const n = d.length, N = 1 << n, dp = new Float64Array(N * n).fill(Infinity), pr = new Int8Array(N * n).fill(-1);
    dp[n] = 0;   // S = {0}, j = 0
    for (let S = 1; S < N; S += 2) for (let j = 0; j < n; j++) {
      const v0 = dp[S * n + j];
      if (!((S >> j) & 1) || v0 === Infinity) continue;
      for (let q = 1; q < n; q++) {
        if ((S >> q) & 1) continue;
        const S2 = S | (1 << q), v = v0 + d[j][q];
        if (v < dp[S2 * n + q]) { dp[S2 * n + q] = v; pr[S2 * n + q] = j; }
      }
    }
    let best = Infinity, last = -1;
    for (let j = 1; j < n; j++) { const v = dp[(N - 1) * n + j] + d[j][0]; if (v < best) { best = v; last = j; } }
    const t = [];
    let S = N - 1, j = last;
    while (j > 0) { t.push(j); const p = pr[S * n + j]; S ^= 1 << j; j = p; }
    t.push(0);
    t.reverse();
    if (t.length > 2 && t[1] > t[t.length - 1]) t.splice(1, t.length - 1, ...t.slice(1).reverse());   // verso come nelle note: (1,3,5,2,4)
    return { tour: t, len: best };
  }
  /** nearest neighbour dalla città 0 (pareggi sull'indice più piccolo), come NearestNeighbour.cpp */
  function vicino(d) {
    const n = d.length, p = [0], vis = new Array(n).fill(false);
    vis[0] = true;
    while (p.length < n) {
      const l = p[p.length - 1];
      let nx = -1;
      for (let j = 0; j < n; j++) if (!vis[j] && (nx < 0 || d[l][j] < d[l][nx])) nx = j;
      p.push(nx); vis[nx] = true;
    }
    return p;
  }
  /** pixel della città i dentro il riquadro [x0, y0, w, h] (y verso il basso), stessa scala sui due assi */
  function cornice(P, x0, y0, w, h, pad = 26) {
    const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
    const a = Math.min(...xs), b = Math.max(...xs), c = Math.min(...ys), e = Math.max(...ys);
    const s = Math.min((w - 2 * pad) / Math.max(b - a, 1e-9), (h - 2 * pad) / Math.max(e - c, 1e-9));
    const ox = x0 + (w - s * (b - a)) / 2, oy = y0 + (h - s * (e - c)) / 2;
    const q = (i) => [ox + s * (P[i][0] - a), oy + s * (e - P[i][1])];
    const cx = (a + b) / 2, cy = (c + e) / 2;
    q.fuori = (i, r = 15) => {   // spostamento dell'etichetta verso l'esterno
      const dx = P[i][0] - cx, dy = -(P[i][1] - cy), m = Math.hypot(dx, dy);
      if (m < 1e-9) return [r * 0.8, -r * 0.8];
      return [r * dx / m, r * dy / m];
    };
    return q;
  }
  /** città, segmenti (anche paralleli, per i multigrafi) ed etichette delle distanze, in pixel */
  function mappa(crea, H, C, q, n, piccole) {
    const d = disegno(crea, H);
    const fondo = M.scuro() ? "#0f1722" : "#fff";
    const seg = (i, j, attr, off = 0) => {
      let [x0, y0] = q(i), [x1, y1] = q(j);
      if (off) { const L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / L * off, ny = (x1 - x0) / L * off; x0 += nx; x1 += nx; y0 += ny; y1 += ny; }
      return d.line(x0, y0, x1, y1, Object.assign({ strokeColor: C.grigio, strokeWidth: 2 }, attr));
    };
    const freccia = (i, j, attr, off = 0) => {
      let [x0, y0] = q(i), [x1, y1] = q(j);
      const L = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / L, uy = (y1 - y0) / L;
      if (off) { x0 += -uy * off; x1 += -uy * off; y0 += ux * off; y1 += ux * off; }
      x1 -= ux * 9; y1 -= uy * 9; x0 += ux * 7; y0 += uy * 7;
      return crea("arrow", [[x0, H - y0], [x1, H - y1]], Object.assign({ fixed: true, highlight: false, strokeWidth: 4, lastArrow: { type: 2, size: 4 } }, attr));
    };
    const eti = (i, j, s, col) => {
      if (!piccole) return;
      const [x0, y0] = q(i), [x1, y1] = q(j);
      crea("text", [(x0 + x1) / 2, H - (y0 + y1) / 2, String(s)], { display: "html", fixed: true, highlight: false, anchorX: "middle", anchorY: "middle", fontSize: 13, strokeColor: col || C.testo, layer: 12,
        cssStyle: `font-weight:700;background:${fondo};padding:0 3px;border-radius:4px;border:1px solid ${col || C.line};line-height:1.15` });
    };
    const citta = (i, attr = {}, etichetta = true) => {
      const [x, y] = q(i);
      d.dot(x, y, attr.size || (n > 12 ? 3.5 : 5), Object.assign({ fillColor: fondo, strokeColor: C.muted, strokeWidth: 1.6, layer: 9 }, attr));
      if (etichetta) {
        const [ox, oy] = q.fuori(i, n > 12 ? 11 : 15);
        d.text(x + ox, y + oy, String(i + 1), { fontSize: n > 12 ? 11 : 14, strokeColor: C.testo, layer: 11, cssStyle: "font-weight:700" });
      }
    };
    return { d, seg, freccia, eti, citta, fondo };
  }
  /** piccolo grafico delle lunghezze: corrente e migliore fino al passo k, z(I) tratteggiato */
  function curva(crea, H, C, box, serie, k, z, K) {
    const d = disegno(crea, H), [x0, y0, w, h] = box;
    const tutte = serie.cur.concat(serie.best, z ? [z] : []);
    let lo = Math.min(...tutte), hi = Math.max(...tutte);
    if (hi - lo < 4) { hi += 2; lo -= 2; }
    const pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
    const X = (t) => x0 + w * t / Math.max(1, K), Y = (v) => y0 + h * (hi - v) / (hi - lo);
    d.rect(x0, y0, w, h, { strokeColor: C.line, strokeWidth: 1 });
    const fs = 11;
    d.text(x0 - 4, Y(hi - pad), String(Math.round(hi - pad)), { anchorX: "right", fontSize: fs, strokeColor: C.muted });
    d.text(x0 - 4, Y(lo + pad), String(Math.round(lo + pad)), { anchorX: "right", fontSize: fs, strokeColor: C.muted });
    d.text(x0, y0 + h + 10, "0", { fontSize: fs, strokeColor: C.muted });
    d.text(x0 + w, y0 + h + 10, String(K), { fontSize: fs, strokeColor: C.muted });
    d.text(x0 + w / 2, y0 + h + 10, T("iterazione", "iteration"), { fontSize: fs, strokeColor: C.muted, cssStyle: "font-style:italic" });
    d.text(x0, y0 - 9, T("lunghezza del giro", "tour length"), { anchorX: "left", fontSize: fs, strokeColor: C.muted, cssStyle: "font-style:italic" });
    if (z) {
      d.line(x0, Y(z), x0 + w, Y(z), { strokeColor: C.rosso, strokeWidth: 1.4, dash: 2 });
      d.text(x0 + w - 3, Y(z) - 8, `z(I) = ${z}`, { anchorX: "right", fontSize: fs, strokeColor: C.rosso });
    }
    const kk = Math.min(k, serie.cur.length - 1);
    const passo = Math.max(1, Math.ceil(kk / 2000));
    const pl = (v, attr) => {
      const xs = [], ys = [];
      for (let t = 0; t <= kk; t += passo) { xs.push(X(t)); ys.push(H - Y(v[t])); }
      if (xs.length && (kk % passo)) { xs.push(X(kk)); ys.push(H - Y(v[kk])); }
      if (xs.length === 1) { xs.push(xs[0]); ys.push(ys[0]); }
      crea("curve", [xs, ys], Object.assign({ fixed: true, highlight: false }, attr));
    };
    pl(serie.cur, { strokeColor: C.grigio, strokeWidth: 1.4 });
    pl(serie.best, { strokeColor: C.blu, strokeWidth: 2.6 });
    d.line(X(kk), y0, X(kk), y0 + h, { strokeColor: C.a, strokeWidth: 1.2, dash: 2 });
    d.dot(X(kk), Y(serie.cur[kk]), 3, { fillColor: C.a, strokeColor: C.a });
  }
  /** tabella HTML dentro la board (testo semplice, niente formule) */
  function tabellaBoard(crea, H, C, x, y, intest, righe, corrente, larg) {
    const bordo = M.scuro() ? "#2a3b52" : "#e3e8ef", ev = `color-mix(in srgb, ${C.a} 20%, transparent)`;
    const html = `<table class="gi-tab-f" style="display:table;margin:0;border:0;border-collapse:collapse;font-size:12px;line-height:1.25;color:${C.testo};${larg ? "width:" + larg + "px;" : ""}font-variant-numeric:tabular-nums">` +
      `<tr>${intest.map((t) => `<th style="padding:1px 5px;border-bottom:1px solid ${bordo};color:${C.muted};font-weight:600;text-align:right">${t}</th>`).join("")}</tr>` +
      righe.map((r, i) => `<tr style="${i === corrente ? `background:${ev};font-weight:700` : ""}">` +
        r.map((c) => `<td style="padding:1px 5px;text-align:right;white-space:nowrap">${c}</td>`).join("") + "</tr>").join("") + "</table>";
    return crea("text", [x, H - y, html], { display: "html", anchorX: "left", anchorY: "top", fixed: true, highlight: false, fontSize: 12, layer: 12 });
  }

  /** istanza iniziale da un link: #ist=2 (voce del menu «Istanza», da 1) e, per le famiglie, #n=9 */
  function istanzaDaIndirizzo(st, voci, carica) {
    if (st.dati.istHash) return;
    st.dati.istHash = true;
    const h = decodeURIComponent(location.hash || ""), m = /ist=(\d+)/.exec(h), nn = /[#&]n=(\d+)/.exec(h);
    setTimeout(() => {
      if (m && voci[+m[1] - 1]) carica(voci[+m[1] - 1], +m[1] - 1);
      if (nn && M.inputDi(st, "n")) st.imposta("n", +nn[1]);
    }, 20);
  }

  // =================================================================
  // 1. SIMULATED ANNEALING E TABU SEARCH CON IL 2-OPT
  // =================================================================
  const D_REF = [[0, 5, 2, 2, 9], [5, 0, 4, 3, 4], [2, 4, 0, 4, 7], [2, 3, 4, 0, 7], [9, 4, 7, 7, 0]];
  const XY20 = [[0, 18], [55, 35], [32, 11], [47, 47], [79, 20], [83, 11], [30, 20], [53, 17], [71, 4], [83, 40],
    [17, 52], [88, 18], [46, 16], [91, 32], [15, 0], [10, 37], [62, 28], [36, 16], [32, 33], [91, 39]];
  const OPT20 = [1, 16, 11, 19, 4, 2, 17, 10, 20, 14, 12, 5, 6, 9, 8, 13, 18, 7, 3, 15].map((c) => c - 1);
  const D_ES6 = [[0, 5, 1, 7, 7, 4], [5, 0, 4, 5, 2, 1], [1, 4, 0, 6, 6, 4], [7, 5, 6, 0, 7, 6], [7, 2, 6, 7, 0, 2], [4, 1, 4, 6, 2, 0]];
  const PAR_PICCOLE = { T0: 5, alpha: 0.8, L: 2, Tmin: 3, maxIt: 10 };
  const META_ES = [
    { nome: T("di riferimento (5 città)", "reference instance (5 cities)"), titolo: T("la matrice delle note, ottimo 18; SA con T0 = 5, α = 0,8, L = 2, Tmin = 3 (l'esempio del capitolo)", "the matrix of the notes, optimum 18; SA with T0 = 5, α = 0.8, L = 2, Tmin = 3 (the example of the chapter)"),
      mat: D_REF, P: sulCerchio([0, 2, 4, 1, 3]), par: PAR_PICCOLE },
    { nome: T("TSP20 (istanza media)", "TSP20 (medium instance)"), titolo: T("20 città nel piano, ottimo 291; SA con T0 = 20, α = 0,95, L = 100, Tmin = 0,5; TS con 200 iterazioni", "20 cities in the plane, optimum 291; SA with T0 = 20, α = 0.95, L = 100, Tmin = 0.5; TS with 200 iterations"),
      mat: rotonda(XY20), P: XY20, opt: { tour: OPT20, len: 291 }, par: { T0: 20, alpha: 0.95, L: 100, Tmin: 0.5, maxIt: 200 } },
    { nome: T("degli esercizi (6 città)", "of the exercises (6 cities)"), titolo: T("la matrice degli esercizi su SA e TS, ottimo 20", "the matrix of the exercises on SA and TS, optimum 20"),
      mat: D_ES6, P: sulCerchio([0, 2, 3, 1, 4, 5]), par: PAR_PICCOLE },
  ];
  const MOSSE = (n) => { const m = []; for (let i = 0; i < n - 1; i++) for (let j = i + 2; j < n; j++) if (!(i === 0 && j === n - 1)) m.push([i, j]); return m; };
  const applica = (t, i, j) => t.slice(0, i + 1).concat(t.slice(i + 1, j + 1).reverse(), t.slice(j + 1));
  const archiMossa = (t, i, j) => {
    const n = t.length, a = t[i], b = t[i + 1], c = t[j], e = t[(j + 1) % n];
    return { a, b, c, e, rimossi: [[a, b], [c, e]], aggiunti: [[a, c], [b, e]] };
  };
  /** SimulatedAnnealingTSP.cpp: due Rand() per iterazione (u sceglie la mossa, v il test di Metropolis) */
  function corsaSA(d, par, seed) {
    const r = parkMiller(seed), mosse = MOSSE(d.length), Mm = mosse.length, start = vicino(d), f0 = lunghezza(d, start);
    let cur = start, f = f0, fb = f0, bestAt = 0, Tt = par.T0;
    const it = [], serie = { cur: [f0], best: [f0] };
    while (Tt > par.Tmin && it.length < 60000) {
      for (let l = 0; l < par.L; l++) {
        const u = r(), k = Math.floor(u * Mm), [i, j] = mosse[k], A = archiMossa(cur, i, j);
        const de = d[A.a][A.c] + d[A.b][A.e] - d[A.a][A.b] - d[A.c][A.e];
        const v = r(), p = Math.exp(-de / Tt), acc = de <= 0 || v < p, prima = cur;
        if (acc) { cur = applica(cur, i, j); f += de; if (f < fb) { fb = f; bestAt = it.length + 1; } }
        it.push({ T: Tt, u, k, i, j, de, v, p, acc, prima, dopo: cur, f, fb, bestAt, A, temp: Math.round(Math.log(Tt / par.T0) / Math.log(par.alpha)) });
        serie.cur.push(f); serie.best.push(fb);
      }
      Tt = par.alpha * Tt;
    }
    return { start, f0, it, serie, M: Mm, mosse, fb, best: bestAt ? it[bestAt - 1].dopo : start };
  }
  /** TabuSearchTSP.cpp: la mossa migliore non tabu (o con aspirazione), anche se peggiora */
  function corsaTS(d, tenure, maxIt) {
    const n = d.length, tabu = Array.from({ length: n }, () => new Array(n).fill(0)), mosse = MOSSE(n), start = vicino(d), f0 = lunghezza(d, start);
    let cur = start, f = f0, fb = f0, bestAt = 0;
    const it = [], serie = { cur: [f0], best: [f0] };
    for (let k = 1; k <= maxIt; k++) {
      const lista = [];
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (tabu[a][b] >= k) lista.push([a, b, tabu[a][b]]);
      const vicini = [];
      let sc = -1;
      mosse.forEach(([i, j]) => {
        const A = archiMossa(cur, i, j), de = d[A.a][A.c] + d[A.b][A.e] - d[A.a][A.b] - d[A.c][A.e];
        const isTabu = tabu[A.a][A.c] >= k || tabu[A.b][A.e] >= k, asp = isTabu && f + de < fb, ok = !isTabu || asp;
        vicini.push({ i, j, de, isTabu, asp, ok, A });
        if (ok && (sc < 0 || de < vicini[sc].de)) sc = vicini.length - 1;
      });
      if (sc < 0) { it.push({ fermo: true, prima: cur, dopo: cur, vicini, lista, f, fb, bestAt }); serie.cur.push(f); serie.best.push(fb); break; }
      const m = vicini[sc], A = m.A;
      tabu[A.a][A.b] = tabu[A.b][A.a] = k + tenure;
      tabu[A.c][A.e] = tabu[A.e][A.c] = k + tenure;
      const prima = cur;
      cur = applica(cur, m.i, m.j); f += m.de;
      if (f < fb) { fb = f; bestAt = k; }
      it.push({ prima, dopo: cur, vicini, sc, i: m.i, j: m.j, de: m.de, A, lista, f, fb, bestAt, fino: k + tenure });
      serie.cur.push(f); serie.best.push(fb);
    }
    return { start, f0, it, serie, fb, best: bestAt ? it[bestAt - 1].dopo : start, tenure, maxIt };
  }
  function metaCasuale() {
    const n = M.casuale(8, 11), P = [];
    while (P.length < n) {
      const q = [M.casuale(0, 100), M.casuale(0, 60)];
      if (P.every((r) => Math.hypot(q[0] - r[0], q[1] - r[1]) >= 12)) P.push(q);
    }
    return { nome: T("casuale", "random"), mat: rotonda(P), P, par: { T0: 20, alpha: 0.9, L: 20, Tmin: 0.5, maxIt: 30 } };
  }
  const META_FUNZ = {
    sa: { etichetta: "<span title=\"simulated annealing\">Simulated annealing (SA)</span>" },
    ts: { etichetta: "<span title=\"tabu search\">Tabu search (TS)</span>" },
  };
  const SEED = "text{seed}", TEN = "text{tenure}";

  function metaStato(st) {
    const D = st.dati;
    if (!D.I) { D.I = Object.assign({ id: nuovoId(), es: 0 }, META_ES[0]); }
    const I = D.I, alg = st.chiave();
    if (!I.opt) I.opt = heldKarp(I.mat);
    M.intervallo(st, SEED, 1, 100); M.intervallo(st, TEN, 0, 20);
    const seed = M.intero(st, SEED), ten = M.intero(st, TEN);
    const firma = [I.id, alg, alg === "sa" ? seed : ten, JSON.stringify(I.par)].join("|");
    if (D.mFirma !== firma) {
      D.mFirma = firma;
      D.run = alg === "sa" ? corsaSA(I.mat, I.par, seed) : corsaTS(I.mat, ten, I.par.maxIt);
      D.runId = nuovoId();
    }
    const R = D.run, K = R.it.length + 1, k = M.passoK(st, K, PASSO);
    return { D, I, alg, R, K, k, E: k >= 1 && k <= R.it.length ? R.it[k - 1] : null, seed, ten, n: I.mat.length };
  }

  window.GI_RICETTE["oc-meta-tsp"] = {
    titolo: T("TSP: simulated annealing e tabu search", "TSP: simulated annealing and tabu search"),
    funzioni: META_FUNZ,
    etichettaFunzioni: T("Metaeuristica, con l'intorno 2-opt", "Metaheuristic, with the 2-opt neighbourhood"),
    parametri: [
      { k: SEED, nome: "\\" + SEED, min: 1, max: 100, step: 1, val: 1, colore: "b", cifre: 0, descr: T("seme del generatore Rand (SA)", "seed of the generator Rand (SA)") },
      { k: TEN, nome: "\\" + TEN, min: 0, max: 20, step: 1, val: 2, colore: "d", cifre: 0, descr: T("iterazioni in cui gli archi tolti restano tabu (TS)", "iterations during which the removed edges stay tabu (TS)") },
      parPasso(T("◀ ▶ un'iterazione alla volta, «Esegui» per vederle tutte", "◀ ▶ one iteration at a time, «Run» to watch them all"), 1),
    ],
    assi: false,
    opzioniBoard: M.OPZ,
    vista: [0, 10, 10, 0],
    legenda: (st) => {
      const C = M.COL(st), ts = st.chiave() === "ts";
      return [
        [C.a, T("giro corrente", "current tour"), ""],
        [C.grigio, T("archi tolti dalla mossa", "edges removed by the move"), "dashed"],
        [C.viola, ts ? T("archi aggiunti (mossa scelta)", "edges added (chosen move)") : T("archi aggiunti (mossa estratta)", "edges added (drawn move)"), ""],
        ...(ts ? [[C.rosso, T("archi tabu", "tabu edges"), "dashed"]] : []),
        [C.blu, T("giro ottimo; nel grafico: miglior giro", "optimal tour; in the plot: best tour"), "pieno"],
      ];
    },
    monta(board, st) {
      const D = st.dati;
      nuovaVoce(st);
      const carica = (I, es) => { D.I = Object.assign({ id: nuovoId(), es }, I); if (D.menu) D.menu.value = String(es); D.mFirma = null; vaiA(st, 1); M.ferma(st); st.aggiorna(); };
      M.comandi(st, [
        ["⏩", T("avanti di una temperatura (SA, L iterazioni) o di 10 iterazioni (TS)", "jump ahead by one temperature (SA, L iterations) or by 10 iterations (TS)"), () => {
          const i = M.inputDi(st, PASSO);
          if (!i) return;
          const salto = st.chiave() === "sa" ? D.I.par.L : 10;
          st.imposta(PASSO, Math.min(+i.max, Math.round(+i.value) + salto));
        }],
        [T("Casuale", "Random"), T("da 8 a 11 città casuali nel piano", "8 to 11 random cities in the plane"), () => carica(metaCasuale(), -1)],
        [T("Modifica…", "Edit…"), T("cambia i parametri: T0, α, L, Tmin (SA) e il numero di iterazioni (TS)", "change the parameters: T0, α, L, Tmin (SA) and the number of iterations (TS)"), () => {
          const p = D.I.par;
          const s = chiedi(T("Parametri separati da «;»: T0 ; α ; L ; Tmin ; iterazioni di TS (per esempio 5 ; 0.8 ; 2 ; 3 ; 10)", "Parameters separated by «;»: T0 ; α ; L ; Tmin ; iterations of TS (for example 5 ; 0.8 ; 2 ; 3 ; 10)"),
            [p.T0, p.alpha, p.L, p.Tmin, p.maxIt].join(" ; "));
          if (!s) return;
          const v = s.split(";").map((x) => parseFloat(String(x).replace(",", ".")));
          const [T0, alpha, L, Tmin, maxIt] = v;
          const nT = v.length === 5 && T0 > Tmin && Tmin > 0 && alpha > 0 && alpha < 1 ? Math.ceil(Math.log(Tmin / T0) / Math.log(alpha)) : 0;
          if (!(nT >= 1 && Number.isInteger(L) && L >= 1 && nT * L <= 20000 && Number.isInteger(maxIt) && maxIt >= 1 && maxIt <= 1000)) {
            window.alert(T("Parametri non validi: T0 > Tmin > 0, 0 < α < 1, L intero, al più 20000 iterazioni di SA e 1000 di TS.", "Invalid parameters: T0 > Tmin > 0, 0 < α < 1, integer L, at most 20000 iterations of SA and 1000 of TS."));
            return;
          }
          carica(Object.assign({}, D.I, { par: { T0, alpha, L, Tmin, maxIt } }), D.I.es);
        }],
      ], { k: PASSO });
      menuIstanze(st, META_ES.map((e) => [e.nome, e.titolo]), () => (D.I ? D.I.es : 0), (i) => carica(META_ES[i], i));
      istanzaDaIndirizzo(st, META_ES, carica);
      osservaDimensioni(board, st);
      daIndirizzo(st);
      // home della collana: data-vetrina="istanza | voce" (numero dell'istanza nel menu, da 1; voce sa o ts), ultima iterazione
      vetrina(st, (v) => {
        const [i, voce] = v.split("|").map((x) => x.trim());
        scegliVoce(st, voce);
        if (META_ES[+i - 1]) carica(META_ES[+i - 1], +i - 1);
      });
    },
    aggiorna(board, st) {
      const S = metaStato(st), C = M.COL(st), [W, H] = dim(board), { I, R, K, k, E, alg, n } = S;
      mostraCursore(st, SEED, alg === "sa");
      mostraCursore(st, TEN, alg === "ts");
      M.ridisegna(board, st, [S.D.runId, k, M.scuro(), W, H].join("|"), (crea) => {
        pix(board);
        const largo = W >= 1.35 * H && W > 700;
        const box = largo ? [0, 22, W * 0.52, H - 22] : [0, 22, W, H * 0.62 - 22];
        const q = cornice(I.P, ...box), piccole = n <= 7;
        const G = mappa(crea, H, C, q, n, piccole);
        const fine = k === K;
        // giro ottimo in trasparenza
        const o = I.opt.tour;
        o.forEach((c, i) => G.seg(c, o[(i + 1) % n], { strokeColor: C.blu, strokeWidth: 10, strokeOpacity: M.scuro() ? 0.32 : 0.18, lineCap: "round" }));
        const tour = fine ? R.best : E ? E.prima : R.start;
        const toglie = E && !E.fermo ? E.A.rimossi : [], mette = E && !E.fermo ? E.A.aggiunti : [];
        const rifiutata = alg === "sa" && E && !E.acc;
        const tolto = (a, b) => !rifiutata && toglie.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
        tour.forEach((c, i) => { const b = tour[(i + 1) % n]; if (!tolto(c, b)) G.seg(c, b, { strokeColor: C.a, strokeWidth: 3.2 }); });
        if (alg === "ts" && E) for (const [a, b] of E.lista) G.seg(a, b, { strokeColor: C.rosso, strokeWidth: 2, dash: 2 });
        for (const [a, b] of toglie) { G.seg(a, b, { strokeColor: C.grigio, strokeWidth: 2.4, dash: 2 }); G.eti(a, b, I.mat[a][b], C.muted); }
        for (const [a, b] of mette) { G.seg(a, b, { strokeColor: C.viola, strokeWidth: rifiutata ? 2.4 : 5, strokeOpacity: rifiutata ? 0.7 : 1, dash: rifiutata ? 2 : 0 }); G.eti(a, b, I.mat[a][b], C.viola); }
        for (let i = 0; i < n; i++) G.citta(i, i === 0 ? { fillColor: C.a, strokeColor: C.a } : {});
        // titoletto del disegno
        const tit = fine ? T(`miglior giro: L = ${R.fb}`, `best tour: L = ${R.fb}`) : k === 0 ? T(`giro iniziale (nearest neighbour): L = ${R.f0}`, `starting tour (nearest neighbour): L = ${R.f0}`)
          : T(`iterazione ${k}: giro corrente L = ${R.serie.cur[k - 1]}`, `iteration ${k}: current tour L = ${R.serie.cur[k - 1]}`);
        G.d.text(box[0] + 10, 14, tit, { anchorX: "left", fontSize: 13, strokeColor: C.testo, cssStyle: "font-weight:700" });
        // grafico delle lunghezze e tabella delle iterazioni
        const pb = largo ? [W * 0.52 + 48, 30, W * 0.48 - 64, Math.min(H * 0.36, 220)] : [48, H * 0.62 + 24, W - 70, H * 0.38 - 50];
        curva(crea, H, C, pb, R.serie, Math.min(k, R.it.length), I.opt.len, R.it.length);
        if (largo) {
          const y0 = pb[1] + pb[3] + 34, righeMax = clamp(Math.floor((H - y0 - 10) / 17) - 1, 3, 14);
          if (alg === "sa") {
            const a = Math.max(1, Math.min(k, R.it.length) - righeMax + 1), b = Math.min(Math.max(k, 1), R.it.length);
            const righe = [];
            for (let t = Math.max(1, Math.min(a, b - righeMax + 1)); t <= b; t++) {
              const x = R.it[t - 1];
              righe.push([t, nt(x.T), fxt(x.u, 4), `${x.k + 1}:(${x.i + 1},${x.j + 1})`, x.de, x.de > 0 ? fxt(x.v, 4) : "—", x.de > 0 ? fxt(x.p, 4) : "—",
                x.acc ? T("accetta", "accept") : T("rifiuta", "reject"), x.f]);
            }
            const cor = righe.findIndex((r) => r[0] === k);
            tabellaBoard(crea, H, C, pb[0] - 40, y0, ["it", "T", "u", T("mossa", "move"), "δ", "v", "e<sup>−δ/T</sup>", T("esito", "decision"), "L"], righe, cor);
          } else if (E) {
            const vic = E.vicini.map((v, idx) => Object.assign({ idx }, v));
            const sel = n <= 6 ? vic : vic.slice().sort((x, y) => x.de - y.de || x.idx - y.idx).slice(0, righeMax);
            const righe = sel.map((v) => [`(${v.i + 1},${v.j + 1})`, (v.de > 0 ? "+" : "") + v.de, E.f - (E.fermo ? 0 : E.de) + v.de,
              v.idx === E.sc ? (v.asp ? T("scelta (aspirazione)", "chosen (aspiration)") : T("scelta", "chosen")) : v.asp ? T("tabu, aspirazione", "tabu, aspiration") : v.isTabu ? "tabu" : ""]);
            const cor = sel.findIndex((v) => v.idx === E.sc);
            G.d.text(pb[0] - 40, y0 - 10, n <= 6 ? T("tutte le mosse dell'iterazione", "all the moves of the iteration") : T(`le ${sel.length} mosse migliori su ${vic.length}`, `the ${sel.length} best moves out of ${vic.length}`),
              { anchorX: "left", fontSize: 11, strokeColor: C.muted, cssStyle: "font-style:italic" });
            tabellaBoard(crea, H, C, pb[0] - 40, y0, [T("mossa", "move"), "δ", T("L nuovo", "new L"), T("stato", "status")], righe, cor);
          }
        }
      });
    },
    formula(p, st) {
      const S = metaStato(st), { R, K, k, E, alg } = S;
      if (k === 0) return T(`\\text{giro iniziale: nearest neighbour da 1, } L = ${R.f0}`, `\\text{starting tour: nearest neighbour from 1, } L = ${R.f0}`);
      if (k === K) return `${alg === "sa" ? "SA" : "TS"}(I) = ${R.fb} \\qquad z(I) = ${S.I.opt.len}`;
      if (alg === "sa") {
        const test = E.de <= 0 ? `\\delta = ${E.de} \\le 0` : `\\delta = ${E.de} \\quad v = ${fx(E.v, 4)} ${E.acc ? "<" : "\\ge"} e^{-\\delta/T} = ${fx(E.p, 4)}`;
        if (st.board && st.board.canvasWidth < 620) return `T = ${GI.num(E.T, 4)} \\quad ${E.de <= 0 ? test : `v ${E.acc ? "<" : "\\ge"} e^{-${E.de}/T}`} \\Rightarrow \\text{${E.acc ? T("accetta", "accept") : T("rifiuta", "reject")}}`;
        return `T = ${GI.num(E.T, 4)} \\quad u = ${fx(E.u, 4)} \\to ${E.k + 1}{:}\\,(${E.i + 1},${E.j + 1}) \\quad ${test} \\;\\Rightarrow\\; \\text{${E.acc ? T("accetta", "accept") : T("rifiuta", "reject")}}`;
      }
      if (E.fermo) return T("\\text{tutte le mosse sono tabu: stop}", "\\text{every move is tabu: stop}");
      return T(`\\text{mossa migliore ammissibile } (${E.i + 1},${E.j + 1}):\\ \\delta = ${E.de} \\quad L = ${E.f} \\quad L_{\\text{migliore}} = ${E.fb}`,
        `\\text{best admissible move } (${E.i + 1},${E.j + 1}):\\ \\delta = ${E.de} \\quad L = ${E.f} \\quad L_{\\text{best}} = ${E.fb}`);
    },
    letture(p, st) {
      const S = metaStato(st), { I, R, K, k, E, alg } = S, C = M.COL(st), z = I.opt.len, pr = I.par;
      const ar = ([a, b]) => `(${a + 1}, ${b + 1})`;
      let nota;
      if (alg === "sa") {
        const nT = R.it.length / pr.L;
        if (k === 0) nota = T(`Si parte dal giro del nearest neighbour ${seq(R.start)}, lungo \\(${R.f0}\\). Parametri: \\(T_0 = ${GI.num(pr.T0, 3)}\\), \\(\\alpha = ${GI.num(pr.alpha, 3)}\\), \\(L = ${pr.L}\\), \\(T_{\\min} = ${GI.num(pr.Tmin, 3)}\\): ${nT} temperature, ${R.it.length} iterazioni. Le \\(M = ${R.M}\\) mosse 2-opt sono numerate in ordine lessicografico; a ogni iterazione \\(u = \\textsc{Rand}()\\) sceglie la mossa \\(1 + \\lfloor ${R.M}\\,u \\rfloor\\) e \\(v = \\textsc{Rand}()\\) serve al test di Metropolis.`,
          `Start from the nearest neighbour tour ${seq(R.start)}, of length \\(${R.f0}\\). Parameters: \\(T_0 = ${GI.num(pr.T0, 3)}\\), \\(\\alpha = ${GI.num(pr.alpha, 3)}\\), \\(L = ${pr.L}\\), \\(T_{\\min} = ${GI.num(pr.Tmin, 3)}\\): ${nT} temperatures, ${R.it.length} iterations. The \\(M = ${R.M}\\) 2-opt moves are numbered in lexicographic order; at each iteration \\(u = \\textsc{Rand}()\\) chooses the move \\(1 + \\lfloor ${R.M}\\,u \\rfloor\\) and \\(v = \\textsc{Rand}()\\) is used in the Metropolis test.`);
        else if (k === K) nota = T(`Temperatura sotto \\(T_{\\min}\\): fine. Il miglior giro visitato, ${seq(R.best)}, è lungo ${M.tinta(C.blu, R.fb)}${R.fb === z ? ": è ottimo" : `, \\(${GI.num(100 * (R.fb - z) / z, 1)}\\,\\%\\) sopra \\(z(I) = ${z}\\)`}.`,
          `Temperature below \\(T_{\\min}\\): stop. The best tour visited, ${seq(R.best)}, has length ${M.tinta(C.blu, R.fb)}${R.fb === z ? ": it is optimal" : `, \\(${GI.num(100 * (R.fb - z) / z, 1)}\\,\\%\\) above \\(z(I) = ${z}\\)`}.`);
        else {
          const peggiora = E.de > 0;
          const esito = !peggiora ? T(`\\(\\delta \\le 0\\): ${M.tinta(C.viola, "accettata")} senza test (il numero \\(v = ${fx(E.v, 4)}\\) è estratto lo stesso).`, `\\(\\delta \\le 0\\): ${M.tinta(C.viola, "accepted")} without the test (the number \\(v = ${fx(E.v, 4)}\\) is drawn anyway).`)
            : E.acc ? T(`Peggiora di \\(${E.de}\\), ma \\(v < e^{-${E.de}/${GI.num(E.T, 3)}}\\): ${M.tinta(C.viola, "accettata")}.`, `It is worse by \\(${E.de}\\), but \\(v < e^{-${E.de}/${GI.num(E.T, 3)}}\\): ${M.tinta(C.viola, "accepted")}.`)
              : T(`Peggiora di \\(${E.de}\\) e \\(v \\ge e^{-${E.de}/${GI.num(E.T, 3)}}\\): ${M.tinta(C.muted, "rifiutata")}, il giro resta lo stesso.`, `It is worse by \\(${E.de}\\) and \\(v \\ge e^{-${E.de}/${GI.num(E.T, 3)}}\\): ${M.tinta(C.muted, "rejected")}, the tour stays the same.`);
          nota = T(`Mossa ${E.k + 1}: \\((${E.i + 1},${E.j + 1})\\) toglie ${E.A.rimossi.map(ar).join(" e ")} e mette ${E.A.aggiunti.map(ar).join(" e ")}. ${esito}`,
            `Move ${E.k + 1}: \\((${E.i + 1},${E.j + 1})\\) removes ${E.A.rimossi.map(ar).join(" and ")} and adds ${E.A.aggiunti.map(ar).join(" and ")}. ${esito}`);
        }
        const righe = E && k < K ? [
          [T("temperatura \\(T\\)", "temperature \\(T\\)"), `\\(${GI.num(E.T, 4)}\\)`],
          [T("\\(u\\) e la mossa", "\\(u\\) and the move"), `\\(${fx(E.u, 4)} \\to ${E.k + 1}{:}\\,(${E.i + 1},${E.j + 1})\\)`],
          ["\\(\\delta\\)", `\\(${E.de}\\)`],
          ["\\(v\\)", E.de > 0 ? `\\(${fx(E.v, 4)}\\)` : "—"],
          ["\\(e^{-\\delta/T}\\)", E.de > 0 ? `\\(${fx(E.p, 4)}\\)` : "—"],
          [T("giro corrente", "current tour"), `${seq(E.dopo)}, \\(L = ${E.f}\\)`],
          [T("miglior giro", "best tour"), `\\(${E.fb}\\)`],
          ["\\(z(I)\\)", `\\(${z}\\)`],
        ] : [
          [T("giro iniziale", "starting tour"), `\\(${R.f0}\\)`],
          [T("miglior giro", "best tour"), k === K ? `\\(${R.fb}\\)` : "—"],
          ["\\(z(I)\\)", `\\(${z}\\)`],
        ];
        return nota + M.tab([T("iterazione", "iteration") + (E && k < K ? " " + k : ""), T("valore", "value")], righe, -1, C.a);
      }
      // tabu search
      if (k === 0) nota = T(`Si parte dal giro del nearest neighbour ${seq(R.start)}, lungo \\(${R.f0}\\). A ogni iterazione si valutano tutte le mosse 2-opt e si esegue la migliore ammissibile, anche se peggiora; i due archi tolti restano tabu per \\(${R.tenure}\\) iterazioni (non si possono rimettere), salvo che la mossa dia un giro migliore del migliore (aspirazione). Al più ${R.maxIt} iterazioni.`,
        `Start from the nearest neighbour tour ${seq(R.start)}, of length \\(${R.f0}\\). At each iteration all the 2-opt moves are evaluated and the best admissible one is performed, even if it is worse; the two removed edges stay tabu for \\(${R.tenure}\\) iterations (they may not be added back), unless the move gives a tour better than the best one (aspiration). At most ${R.maxIt} iterations.`);
      else if (k === K) nota = T(`Fine. Il miglior giro visitato, ${seq(R.best)}, è lungo ${M.tinta(C.blu, R.fb)}${R.fb === z ? ": è ottimo" : `, \\(${GI.num(100 * (R.fb - z) / z, 1)}\\,\\%\\) sopra \\(z(I) = ${z}\\)`}.`,
        `End. The best tour visited, ${seq(R.best)}, has length ${M.tinta(C.blu, R.fb)}${R.fb === z ? ": it is optimal" : `, \\(${GI.num(100 * (R.fb - z) / z, 1)}\\,\\%\\) above \\(z(I) = ${z}\\)`}.`);
      else if (E.fermo) nota = T("Tutte le mosse sono tabu e nessuna soddisfa l'aspirazione: la ricerca si ferma.", "Every move is tabu and none satisfies the aspiration criterion: the search stops.");
      else {
        const m = E.vicini[E.sc], peggio = E.de > 0 ? T(" (peggiora: la tabu search si muove comunque)", " (it is worse: tabu search moves anyway)") : E.de === 0 ? T(" (stessa lunghezza)", " (same length)") : "";
        nota = T(`La mossa migliore ammissibile è \\((${E.i + 1},${E.j + 1})\\), con \\(\\delta = ${E.de}\\)${peggio}${m.asp ? ", tabu ma ammessa per aspirazione" : ""}. Toglie ${E.A.rimossi.map(ar).join(" e ")}, che diventano ${M.tinta(C.rosso, "tabu")} fino all'iterazione ${E.fino}; il giro ora è ${seq(E.dopo)}, \\(L = ${E.f}\\).`,
          `The best admissible move is \\((${E.i + 1},${E.j + 1})\\), with \\(\\delta = ${E.de}\\)${peggio}${m.asp ? ", tabu but allowed by aspiration" : ""}. It removes ${E.A.rimossi.map(ar).join(" and ")}, which become ${M.tinta(C.rosso, "tabu")} until iteration ${E.fino}; the tour is now ${seq(E.dopo)}, \\(L = ${E.f}\\).`);
      }
      let out = nota;
      if (E && k < K) {
        const lista = E.lista.length ? E.lista.map(([a, b, f]) => [`(${a + 1}, ${b + 1})`, `\\(${f}\\)`]) : [[T("vuota", "empty"), ""]];
        out += M.tab([T(`lista tabu all'iterazione ${k}`, `tabu list at iteration ${k}`), T("tabu fino a", "tabu until")], lista, -1, C.rosso);
      }
      out += M.tab(["", T("valore", "value")], [
        [T("giro corrente", "current tour"), `\\(${k === 0 ? R.f0 : k === K ? R.serie.cur[R.serie.cur.length - 1] : E.f}\\)`],
        [T("miglior giro", "best tour"), `\\(${k === 0 ? R.f0 : k === K ? R.fb : E.fb}\\)`],
        ["\\(z(I)\\)", `\\(${z}\\)`],
      ], -1, C.a);
      return out;
    },
    domanda: T("SA, istanza di riferimento, seme 1: alle iterazioni 1 e 3 si accetta un giro peggiore; cambia il seme e guarda se si arriva ancora a 18. Su TSP20 confronta la tabu search con tenure 0 (si blocca a 319) e con tenure 1 o 2.",
      "SA, reference instance, seed 1: at iterations 1 and 3 a worse tour is accepted; change the seed and check whether 18 is still reached. On TSP20 compare tabu search with tenure 0 (it gets stuck at 319) and with tenure 1 or 2."),
  };

  window.GI_OC_F = { corsaSA, corsaTS, heldKarp, META_ES, metaCasuale };
})();
