/* Laboratorio di «Algoritmi euristici / Heuristic Algorithms»: colorazione dei vertici.
 *
 *   oc-coloring      colorazione dei vertici: greedy (lista data o grado decrescente) e DSATUR, passo per passo
 *
 * Grafi: grafo di Petersen e grafo a corona G_4 (vertici u_i = 2i-1, v_i = 2i, spigoli {2i-1, 2j} con i ≠ j).
 * Le funzioni di calcolo sono anche in window.GI_OC_A, per le prove.
 * Copiato da Problemi di ottimizzazione combinatoria (gi-oc-a.js, sezione 3) il 2026-11-21.
 */
(function () {
  "use strict";
  const GI = window.GI, M = window.GI_MIP, O = window.GI_OC;
  const T = GI.T;
  const { PASSO, parPasso, vaiA, clamp, lista, nuovoId, osservaDimensioni, nuovaVoce, dim, daIndirizzo } = O;
  window.GI_RICETTE = window.GI_RICETTE || {};

  // =================================================================
  // 1. COLORAZIONE DEI VERTICI
  // =================================================================
  const LATO = 10;
  const ang = (i, r, a0 = 90) => [5 + r * Math.cos((a0 + 72 * i) * Math.PI / 180), 5 + r * Math.sin((a0 + 72 * i) * Math.PI / 180)];
  const PETERSEN = {
    n: 10,
    E: [[1, 2], [1, 5], [1, 6], [2, 3], [2, 7], [3, 4], [3, 8], [4, 5], [4, 9], [5, 10], [6, 8], [6, 9], [7, 9], [7, 10], [8, 10]].map(([a, b]) => [a - 1, b - 1]),
    P: [0, 1, 2, 3, 4].map((i) => ang(i, 4.3)).concat([0, 1, 2, 3, 4].map((i) => ang(i, 2.1))),
    nome: "Petersen",
  };
  const CORONA = (() => {
    const E = [];
    for (let i = 1; i <= 4; i++) for (let j = 1; j <= 4; j++) if (i !== j) E.push([2 * i - 2, 2 * j - 1]);
    const P = [];
    for (let i = 1; i <= 4; i++) { P[2 * i - 2] = [2.5, 9 - 2.5 * (i - 1)]; P[2 * i - 1] = [7.5, 9 - 2.5 * (i - 1)]; }
    return { n: 8, E, P, nome: "crown" };
  })();
  const adiacenze = (G) => { const A = Array.from({ length: G.n }, () => new Set()); for (const [a, b] of G.E) { A[a].add(b); A[b].add(a); } return A; };
  function grafoCasuale() {
    const n = M.casuale(7, 10), E = [], P = [];
    for (let i = 0; i < n; i++) { let q; for (let t = 0; t < 200; t++) { q = [M.casuale(0, LATO), M.casuale(0, LATO)]; if (P.every((r) => Math.hypot(q[0] - r[0], q[1] - r[1]) >= 2.4)) break; } P.push(q); }
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]) < 5.2 && Math.random() < 0.65) E.push([i, j]);
    const A = adiacenze({ n, E });
    for (let i = 0; i < n; i++) if (!A[i].size) { let b = (i + 1) % n, dm = 1e9; for (let j = 0; j < n; j++) if (j !== i) { const dd = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]); if (dd < dm) { dm = dd; b = j; } } E.push([i, b]); A[i].add(b); A[b].add(i); }
    return { n, E, P, nome: "random" };
  }
  /** passi di GC (lista data o grado decrescente) e di DSATUR; colori da 0 */
  function colTraccia(G, regola) {
    const n = G.n, A = adiacenze(G), grado = A.map((s) => s.size), col = new Array(n).fill(-1);
    const ord = regola === "gcg" ? [...Array(n).keys()].sort((i, j) => grado[j] - grado[i] || i - j) : [...Array(n).keys()];
    const passi = [{ col: col.slice(), cur: null, ord }];
    for (let s = 0; s < n; s++) {
      let v, cand = null;
      if (regola === "dsatur") {
        cand = [];
        for (let u = 0; u < n; u++) if (col[u] < 0) {
          const sat = new Set([...A[u]].filter((w) => col[w] >= 0).map((w) => col[w])).size;
          cand.push({ u, sat, du: [...A[u]].filter((w) => col[w] < 0).length });
        }
        v = cand.reduce((b, x) => (x.sat > b.sat || (x.sat === b.sat && x.du > b.du) ? x : b), cand[0]).u;
      } else v = ord[s];
      const forb = [...new Set([...A[v]].filter((w) => col[w] >= 0).map((w) => col[w]))].sort((a, b) => a - b);
      let c = 0;
      while (forb.includes(c)) c++;
      col[v] = c;
      passi.push({ col: col.slice(), cur: v, forb, c, cand, vicini: [...A[v]].sort((a, b) => a - b) });
    }
    return { passi, nc: Math.max(...col) + 1 };
  }
  /** numero cromatico (n <= 10) e numero di clique, per enumerazione */
  function cromatico(G) {
    const n = G.n, A = adiacenze(G), col = new Array(n).fill(-1);
    let best = n;
    const dfs = (v, usati) => {
      if (usati >= best) return;
      if (v === n) { best = usati; return; }
      for (let c = 0; c <= usati && c < best; c++) {
        if ([...A[v]].some((w) => w < v && col[w] === c)) continue;
        col[v] = c; dfs(v + 1, Math.max(usati, c + 1)); col[v] = -1;
      }
    };
    dfs(0, 0);
    let om = 1;
    for (let m = 1; m < 1 << n; m++) {
      const S = []; for (let i = 0; i < n; i++) if (m & (1 << i)) S.push(i);
      if (S.length > om && S.every((a, i) => S.slice(i + 1).every((b) => A[a].has(b)))) om = S.length;
    }
    return { chi: best, omega: om };
  }
  function colStato(st) {
    const D = st.dati;
    if (!D.G) { D.G = PETERSEN; D.Gid = nuovoId(); D.P = PETERSEN.P.map((q) => q.slice()); }
    if (D.cFirma !== D.Gid) {
      D.cFirma = D.Gid;
      D.ctr = {}; for (const r of ["gc", "gcg", "dsatur"]) D.ctr[r] = colTraccia(D.G, r);
      D.cro = cromatico(D.G);
    }
    const regola = st.chiave(), R = D.ctr[regola], K = D.G.n, k = M.passoK(st, K, PASSO);
    return { D, G: D.G, regola, R, K, k, E: R.passi[k] };
  }
  const COL_FUNZ = {
    gc: { etichetta: T("Greedy (lista 1…n)", "Greedy (list 1…n)") },
    gcg: { etichetta: T("Greedy (grado decrescente)", "Greedy (decreasing degree)") },
    dsatur: { etichetta: "DSATUR" },
  };
  const NOME_COL = { gc: T("Greedy, lista 1…n", "Greedy, list 1…n"), gcg: T("Greedy, grado decrescente", "Greedy, decreasing degree"), dsatur: "DSATUR" };

  window.GI_RICETTE["oc-coloring"] = {
    titolo: T("Colorazione dei vertici: greedy e DSATUR", "Vertex coloring: greedy and DSATUR"),
    funzioni: COL_FUNZ,
    etichettaFunzioni: T("Algoritmo", "Algorithm"),
    parametri: [parPasso(T("◀ ▶ un vertice alla volta, «Esegui» per vederli tutti", "◀ ▶ one vertex at a time, «Run» to watch them all"))],
    assi: false,
    stessaScala: true,
    opzioniBoard: M.OPZ,
    vista: [-1, LATO + 1, LATO + 1, -1],
    legenda: (st) => {
      const C = M.COL(st);
      return [
        [C.a, T("vertice appena colorato (bordo spesso)", "vertex just colored (thick border)"), "punto"],
        [C.muted, T("spigoli del vertice corrente", "edges of the current vertex"), ""],
        [C.grigio, T("non ancora colorato (bianco)", "not yet colored (white)"), "punto"],
      ];
    },
    monta(board, st) {
      const D = st.dati;
      nuovaVoce(st);
      D.ptsBoard = null;
      const nuovo = (G) => { D.G = G; D.Gid = nuovoId(); D.P = G.P.map((q) => q.slice()); vaiA(st, 1); M.ferma(st); st.aggiorna(); };
      M.comandi(st, [
        [T("Petersen", "Petersen"), T("il grafo di Petersen, istanza di riferimento del corso", "the Petersen graph, the reference instance of the course"), () => nuovo(PETERSEN)],
        [T("Grafo a corona", "Crown graph"), T("\\(G_4\\): il greedy con la lista 1…8 usa 4 colori, DSATUR 2", "G_4: greedy with the list 1…8 uses 4 colors, DSATUR 2"), () => nuovo(CORONA)],
        [T("Casuale", "Random"), T("un grafo casuale di 7–10 vertici", "a random graph with 7–10 vertices"), () => nuovo(grafoCasuale())],
      ], { k: PASSO });
      osservaDimensioni(board, st);
      daIndirizzo(st);
    },
    aggiorna(board, st) {
      const S = colStato(st), D = st.dati, C = M.COL(st), { G, E, k } = S, P = D.P, PAL = O.PALETTE(C);
      // i vertici: punti trascinabili
      if (D.ptsBoard !== board || D.pts.length !== G.n) {
        if (D.ptsBoard === board) for (const o of D.pts) { try { board.removeObject(o); } catch (e) { /* già tolto */ } }
        D.ptsBoard = board;
        D.pts = P.map((q, i) => {
          const pt = board.create("point", q.slice(), {
            name: String(i + 1), withLabel: false, size: 11, showInfobox: false, fillColor: "#fff", strokeColor: C.muted, strokeWidth: 2.5,
            highlightFillColor: C.grigio, highlightStrokeColor: C.a, snapToGrid: true, snapSizeX: 0.25, snapSizeY: 0.25,
          });
          pt.on("drag", () => {
            const X = clamp(pt.X(), 0, LATO), Y = clamp(pt.Y(), 0, LATO);
            if (X !== pt.X() || Y !== pt.Y()) pt.moveTo([X, Y]);
            P[i] = [pt.X(), pt.Y()];
            st.aggiorna();
          });
          return pt;
        });
      } else D.pts.forEach((pt, i) => { if (Math.abs(pt.X() - P[i][0]) > 1e-9 || Math.abs(pt.Y() - P[i][1]) > 1e-9) pt.moveTo(P[i]); });
      D.pts.forEach((pt, i) => {
        const c = E.col[i], cur = i === E.cur;
        pt.setAttribute({
          fillColor: c >= 0 ? (PAL[c] || C.muted) : (M.scuro() ? "#1b2636" : "#ffffff"),
          strokeColor: cur ? C.testo : c >= 0 ? (PAL[c] || C.muted) : C.muted, strokeWidth: cur ? 5 : 2.5, size: cur ? 13 : 11,
        });
      });
      const [W, H] = dim(board);
      if (D.dim !== W + "x" + H) { D.dim = W + "x" + H; M.adatta(board, -0.8, LATO + 0.9, LATO + 0.8, -0.8); }
      M.ridisegna(board, st, [D.Gid, k, S.regola, P.map((q) => q[0].toFixed(2) + q[1].toFixed(2)).join(";"), M.scuro(), W, H].join("|"), (crea) => {
        for (const [a, b] of G.E) {
          const sul = E.cur != null && (a === E.cur || b === E.cur);
          M.linea(crea, P[a][0], P[a][1], P[b][0], P[b][1], { strokeColor: sul ? C.testo : C.muted, strokeWidth: sul ? 3.2 : 1.8, strokeOpacity: sul ? 0.9 : 0.7 });
        }
        // il numero di ogni vertice sopra il punto, e il numero del colore accanto ai vertici colorati
        P.forEach((q, i) => M.scritta(crea, q[0], q[1], String(i + 1), { fontSize: 15, layer: 10, strokeColor: E.col[i] >= 0 ? "#ffffff" : C.testo, cssStyle: "font-weight:800;pointer-events:none" }));
        P.forEach((q, i) => { if (E.col[i] >= 0) M.scritta(crea, q[0] + 0.48, q[1] + 0.5, "c" + (E.col[i] + 1), { fontSize: 14, strokeColor: PAL[E.col[i]] || C.muted, cssStyle: "font-weight:800" }); });
      });
    },
    formula(p, st) {
      const S = colStato(st), { E, k, K, R, D } = S;
      const usati = E.col.some((c) => c >= 0) ? Math.max(...E.col) + 1 : 0;
      if (k === K) return T(`\\text{colori usati} = ${R.nc} \\qquad \\omega(G) = ${D.cro.omega} \\;\\le\\; \\chi(G) = ${D.cro.chi} \\;\\le\\; ${R.nc}`, `\\text{colors used} = ${R.nc} \\qquad \\omega(G) = ${D.cro.omega} \\;\\le\\; \\chi(G) = ${D.cro.chi} \\;\\le\\; ${R.nc}`);
      return T(`\\text{passo } ${k}/${K}:\\quad \\text{colori usati} = ${usati}`, `\\text{step } ${k}/${K}:\\quad \\text{colors used} = ${usati}`);
    },
    letture(p, st) {
      const S = colStato(st), { E, k, K, R, D, regola, G } = S, C = M.COL(st), PAL = O.PALETTE(C);
      const col = (c) => M.tinta(PAL[c] || C.muted, "c" + (c + 1));
      let nota;
      if (k === 0) nota = regola === "dsatur"
        ? T("DSATUR: a ogni passo si colora, con il colore libero più piccolo, il vertice non colorato con più colori diversi fra i vicini (grado di saturazione); a pari saturazione, il maggior numero di vicini non colorati, poi l'indice più piccolo.",
          "DSATUR: at each step color, with the smallest free color, the uncolored vertex with the most different colors among its neighbours (saturation degree); on a tie, the most uncolored neighbours, then the smallest index.")
        : T(`Greedy: i vertici si guardano nella lista ${lista(R.passi[0].ord.map((v) => v + 1))}; ognuno prende il colore libero più piccolo.`,
          `Greedy: the vertices are examined in the list ${lista(R.passi[0].ord.map((v) => v + 1))}; each takes the smallest free color.`);
      else {
        const v = E.cur + 1, vic = E.vicini.map((x) => x + 1);
        const proibiti = E.forb.length ? lista(E.forb.map((c) => col(c))) : T("nessuno", "none");
        nota = T(`Vertice ${v}, vicini ${lista(vic)}; colori già usati dai vicini: ${proibiti}. Il colore libero più piccolo è ${col(E.c)}.`,
          `Vertex ${v}, neighbours ${lista(vic)}; colors already used by the neighbours: ${proibiti}. The smallest free color is ${col(E.c)}.`);
        if (regola === "dsatur") {
          const prima = E.cand, scelto = prima.find((x) => x.u === E.cur);
          nota += `<br>${T("Scelta: fra i non colorati", "Choice: among the uncolored")}, ${prima.map((x) => `${x.u + 1}: (sat ${x.sat}, ${T("gr", "deg")} ${x.du})`).join("; ")} → ${T("vertice", "vertex")} ${scelto.u + 1}.`;
        }
        if (k === K) nota += T(` Fine: ${M.tinta(C.a, R.nc + " colori")}, un upper bound su \\(\\chi(G)\\).`, ` End: ${M.tinta(C.a, R.nc + " colors")}, an upper bound on \\(\\chi(G)\\).`);
      }
      const righe = [
        [T("colori usati dall'algoritmo", "colors used by the algorithm"), k === K ? `\\(${R.nc}\\)` : "—"],
        ...["gc", "gcg", "dsatur"].map((r) => [NOME_COL[r], `\\(${D.ctr[r].nc}\\)`]),
        [T("\\(\\chi(G)\\) (esatto)", "\\(\\chi(G)\\) (exact)"), `\\(${D.cro.chi}\\)`],
        [T("\\(\\omega(G)\\), lower bound", "\\(\\omega(G)\\), lower bound"), `\\(${D.cro.omega}\\)`],
      ];
      return nota + M.tab([T("colorazione", "coloring"), T("colori", "colors")], righe, -1, C.a);
    },
    domanda: T("Sul grafo a corona confronta il greedy con la lista 1…8 e DSATUR: perché DSATUR trova subito 2 colori? Poi trascina i vertici: cambia il risultato? (No: dipende solo dal grafo.) Con «Casuale» cerca un grafo in cui DSATUR usa più di \\(\\chi(G)\\) colori.",
      "On the crown graph compare greedy with the list 1…8 and DSATUR: why does DSATUR find 2 colors at once? Then drag the vertices: does the result change? (No: it depends only on the graph.) With «Random» look for a graph where DSATUR uses more than \\(\\chi(G)\\) colors."),
  };

  window.GI_OC_A = { colTraccia, cromatico, PETERSEN, CORONA };
})();
