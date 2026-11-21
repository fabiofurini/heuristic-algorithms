// Autovalutazione — domande generate del modulo «Algoritmi euristici» (heuristic-algorithms).
// Copiate dalla banca di Ottimizzazione combinatoria il 21/11/2026 (i generatori dei capitoli delle euristiche).
// Formato: QUIZ_SPEC.md. Ogni generatore riceve rng() in [0,1) e la lingua ("it" | "en") e restituisce
// { testo, opzioni[4], corretta, spiegazione, _v }. Il campo _v (dati dell'istanza e valori delle opzioni)
// serve solo al gemello di verifica in Python (quiz/verifica/): il motore lo ignora.
// Nessuna dipendenza esterna, niente Math.random: solo rng.
window.QUIZ_GEN = window.QUIZ_GEN || {};
(function () {
  "use strict";
  var MOD = "heuristic-algorithms";
  var EN = "https://fabiofurini.github.io/heuristic-algorithms/";
  var IT = "https://fabiofurini.github.io/algoritmi-euristici/";
  function L(en, it) { return { en: EN + en, it: IT + it }; }

  // ---------------------------------------------------------------- aiuti
  function ri(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function pickOne(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function fr(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; return { n: n / g, d: d / g }; }
  function frAdd(a, b) { return fr(a.n * b.d + b.n * a.d, a.d * b.d); }
  function frTex(f) { return f.d === 1 ? String(f.n) : (f.n < 0 ? "-" : "") + "\\frac{" + Math.abs(f.n) + "}{" + f.d + "}"; }
  function frKey(f) { return f.n + "/" + f.d; }
  function floorDiv(a, b) { return Math.floor(a / b); }
  function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
  function T(lingua, it, en) { return lingua === "it" ? it : en; }
  function vec(a) { return "(" + a.join(",") + ")"; }
  function set(a) { return a.length ? "\\{" + a.slice().sort(function (x, y) { return x - y; }).join(",") + "\\}" : "\\emptyset"; }
  function range1(n) { var r = []; for (var i = 1; i <= n; i++) r.push(i); return r; }
  // tabella orizzontale: righe = [[etichetta, valori...], ...]
  function tab(head, rows) {
    var cols = head.length - 1, s = "$\\begin{array}{c|" + new Array(cols + 1).join("c") + "}" + head.join(" & ") + "\\\\ \\hline ";
    s += rows.map(function (r) { return r.join(" & "); }).join("\\\\ ") + "\\end{array}$";
    return s;
  }
  // matrice delle distanze (simmetrica, d[i][j] con indici 1..n)
  function distTab(d, n) {
    var s = "$\\begin{array}{c|" + new Array(n + 1).join("c") + "} d_{ij} & " + range1(n).join(" & ") + "\\\\ \\hline ";
    var rows = [];
    for (var i = 1; i <= n; i++) {
      var r = [String(i)];
      for (var j = 1; j <= n; j++) r.push(i === j ? "-" : String(d[i][j]));
      rows.push(r.join(" & "));
    }
    return s + rows.join("\\\\ ") + "\\end{array}$";
  }
  // costruisce le 4 opzioni: corretta + 3 distrattori distinti (chiavi), nell'ordine dato da rng
  // cand: lista di {k: chiave, t: testo}; restituisce null se non bastano
  function build(rng, giusta, cand) {
    var used = {}, usedT = {}; used[giusta.k] = 1; usedT[giusta.t] = 1; var ds = [];
    for (var i = 0; i < cand.length && ds.length < 3; i++) {
      var c = cand[i];
      if (c && c.k !== undefined && c.t !== undefined && !used[c.k] && !usedT[c.t]) { used[c.k] = 1; usedT[c.t] = 1; ds.push(c); }
    }
    if (ds.length < 3) return null;
    var all = shuffle(rng, [giusta].concat(ds));
    var idx = 0; for (var j = 0; j < 4; j++) if (all[j] === giusta) idx = j;
    var testi = all.map(function (o) { return o.t; });
    var seen = {}; for (j = 0; j < 4; j++) { if (seen[testi[j]]) return null; seen[testi[j]] = 1; }
    return { opzioni: testi, corretta: idx, valori: all.map(function (o) { return o.k; }) };
  }
  function num(v) { return { k: String(v), t: "$" + v + "$" }; }
  function numF(f) { return { k: frKey(f), t: "$" + frTex(f) + "$" }; }
  function retry(f) {
    return function (rng, lingua) {
      for (var it = 0; it < 500; it++) { var r = f(rng, lingua); if (r) return r; }
      throw new Error("generatore senza istanza valida");
    };
  }
  function add(g) { g.genera = retry(g.genera); (QUIZ_GEN[MOD] = QUIZ_GEN[MOD] || []).push(g); }

  // bin packing: restituisce vettore bin (1-based) seguendo l'ordine dato
  function packing(w, c, rule, order) {
    order = order || range1(w.length).map(function (i) { return i - 1; });
    var loads = [], bin = new Array(w.length);
    order.forEach(function (i) {
      var b = -1;
      if (rule === "NF") { if (loads.length && loads[loads.length - 1] + w[i] <= c) b = loads.length - 1; }
      else {
        for (var k = 0; k < loads.length; k++) {
          if (loads[k] + w[i] > c) continue;
          if (b < 0) { b = k; if (rule === "FF") break; continue; }
          if (rule === "BF" && c - loads[k] < c - loads[b]) b = k;
          if (rule === "WF" && c - loads[k] > c - loads[b]) b = k;
        }
      }
      if (b < 0) { loads.push(0); b = loads.length - 1; }
      loads[b] += w[i]; bin[i] = b + 1;
    });
    return { bin: bin, nb: loads.length, loads: loads };
  }
  function decOrder(w) { return range1(w.length).map(function (i) { return i - 1; }).sort(function (a, b) { return w[b] - w[a] || a - b; }); }
  function listSched(t, m, order) {
    var Lm = []; for (var i = 0; i < m; i++) Lm.push(0);
    var mach = new Array(t.length);
    order.forEach(function (j) { var b = 0; for (var h = 1; h < m; h++) if (Lm[h] < Lm[b]) b = h; Lm[b] += t[j]; mach[j] = b + 1; });
    return { mach: mach, loads: Lm, cmax: Math.max.apply(null, Lm) };
  }
  function gcColor(adj, n, lambda) { // lambda: vertici 1..n
    var col = new Array(n + 1).fill(0);
    lambda.forEach(function (v) { var U = {}; adj[v].forEach(function (u) { if (col[u]) U[col[u]] = 1; }); var c = 1; while (U[c]) c++; col[v] = c; });
    return col.slice(1);
  }
  function dsatur(adj, n) {
    var col = new Array(n + 1).fill(0), seq = [];
    for (var step = 0; step < n; step++) {
      var best = -1, bs = -1, bd = -1;
      for (var v = 1; v <= n; v++) {
        if (col[v]) continue;
        var S = {}, ns = 0, du = 0;
        adj[v].forEach(function (u) { if (col[u]) { if (!S[col[u]]) { S[col[u]] = 1; ns++; } } else du++; });
        if (ns > bs || (ns === bs && du > bd)) { best = v; bs = ns; bd = du; }
      }
      var U = {}; adj[best].forEach(function (u) { if (col[u]) U[col[u]] = 1; }); var c = 1; while (U[c]) c++;
      col[best] = c; seq.push(best);
    }
    return { col: col.slice(1), seq: seq, nc: Math.max.apply(null, col) };
  }
  function randGraph(rng, n, pEdge) {
    var adj = [[]], E = [];
    for (var v = 1; v <= n; v++) adj.push([]);
    for (var a = 1; a <= n; a++) for (var b = a + 1; b <= n; b++) if (rng() < pEdge) { adj[a].push(b); adj[b].push(a); E.push([a, b]); }
    return { adj: adj, E: E };
  }
  function edgeTex(E) { return "$E=\\{" + E.map(function (e) { return "\\{" + e[0] + "," + e[1] + "\\}"; }).join(",") + "\\}$"; }
  function randDist(rng, n, lo, hi) {
    var d = []; for (var i = 0; i <= n; i++) { d.push([]); for (var j = 0; j <= n; j++) d[i].push(0); }
    for (i = 1; i <= n; i++) for (j = i + 1; j <= n; j++) { d[i][j] = d[j][i] = ri(rng, lo, hi); }
    return d;
  }
  function nn(d, n, s) { // restituisce {tour, len, open}
    var vis = {}, tour = [s], cur = s; vis[s] = 1; var len = 0;
    for (var k = 1; k < n; k++) {
      var b = -1; for (var j = 1; j <= n; j++) if (!vis[j] && (b < 0 || d[cur][j] < d[cur][b])) b = j;
      len += d[cur][b]; vis[b] = 1; tour.push(b); cur = b;
    }
    return { tour: tour, open: len, len: len + d[cur][s] };
  }
  function tourLen(d, t) { var s = 0; for (var i = 0; i < t.length; i++) s += d[t[i]][t[(i + 1) % t.length]]; return s; }
  function ulsCost(d, sc, vc, hc, j, t) { // c_{j,t}, periodi 1-based
    var g = sc[j - 1] + vc[j - 1] * d[j - 1], u = vc[j - 1];
    for (var k = j + 1; k <= t; k++) { u += hc[k - 2]; g += u * d[k - 1]; }
    return g;
  }
  function ww(d, sc, vc, hc) {
    var m = d.length, v = [0], arg = [0];
    for (var t = 1; t <= m; t++) {
      var b = Infinity, bj = 0;
      for (var j = 1; j <= t; j++) { var x = v[j - 1] + ulsCost(d, sc, vc, hc, j, t); if (x < b) { b = x; bj = j; } }
      v.push(b); arg.push(bj);
    }
    var runs = [], t2 = m; while (t2 > 0) { runs.unshift(arg[t2]); t2 = arg[t2] - 1; }
    return { v: v, runs: runs };
  }
  function itemTab(lingua, p, w, lab) {
    var n = p.length, head = [lab || "j"].concat(range1(n).map(String));
    return tab(head, [["p_j"].concat(p), ["w_j"].concat(w)]);
  }

  // ---- 11. FFD e BFD (cap. 30)
  add({
    id: "eh-g-bpp-ffd", livello: "facile", capitolo: "constructive-heuristics",
    link: L("constructive-heuristics/the-bin-packing-problem-first-sort-then-pack/#sez-sec-FFD",
            "constructive-heuristics/il-problema-del-bin-packing-prima-ordinare-poi-riempire/#sez-sec-FFD"),
    genera: function (rng, lingua) {
      var n = 7, c = ri(rng, 10, 12), w = [];
      for (var j = 0; j < n; j++) w.push(ri(rng, 2, c - 2));
      var o = decOrder(w);
      var R = { FFD: packing(w, c, "FF", o), BFD: packing(w, c, "BF", o), FF: packing(w, c, "FF"), NFD: packing(w, c, "NF", o), BF: packing(w, c, "BF"), WFD: packing(w, c, "WF", o) };
      var a = pickOne(rng, ["FFD", "BFD"]);
      var key = function (x) { return { k: x, t: "$bin=" + vec(R[x].bin) + "$" }; };
      var b = build(rng, key(a), ["FFD", "BFD", "FF", "NFD", "WFD", "BF"].filter(function (x) { return x !== a; }).map(key));
      if (!b) return null;
      b.valori = b.valori.map(function (x) { return x + ":" + R[x].bin.join(","); });
      var nome = a === "FFD" ? "First Fit Decreasing (FFD)" : "Best Fit Decreasing (BFD)";
      return {
        testo: T(lingua, "Bin packing (BPP: oggetti in contenitori di capacità $c$, minimizzando i contenitori) con $c=" + c + "$ e pesi $w=" + vec(w) + "$ (oggetti $1,\\dots," + n + "$). L'ordinamento per peso non crescente rompe i pari merito con l'indice minore; i contenitori sono numerati nell'ordine di apertura. Quale vettore $bin$ (contenitore di ogni oggetto, nella numerazione originale) produce " + nome + "?",
          "Bin packing (BPP: items into bins of capacity $c$, minimizing the bins) with $c=" + c + "$ and weights $w=" + vec(w) + "$ (items $1,\\dots," + n + "$). The sorting by non-increasing weight breaks ties by smaller index; bins are numbered in order of opening. Which vector $bin$ (bin of each item, in the original numbering) does " + nome + " produce?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "Prima si ordinano gli oggetti per peso non crescente ($" + o.map(function (x) { return x + 1; }).join(",") + "$), poi si applica " + (a === "FFD" ? "First Fit" : "Best Fit") + ": $bin=" + vec(R[a].bin) + "$, $" + R[a].nb + "$ contenitori. Errori tipici: dimenticare l'ordinamento o usare l'altra regola di scelta.",
          "First the items are sorted by non-increasing weight ($" + o.map(function (x) { return x + 1; }).join(",") + "$), then " + (a === "FFD" ? "First Fit" : "Best Fit") + " is applied: $bin=" + vec(R[a].bin) + "$, $" + R[a].nb + "$ bins. Typical mistakes: forgetting the sorting or using the other selection rule."),
        _v: { dati: { w: w, c: c, alg: a }, valori: b.valori }
      };
    }
  });

  // ---- 13. colorazione greedy con una lista (cap. 30)
  add({
    id: "eh-g-vcp-gc", livello: "facile", capitolo: "constructive-heuristics",
    link: L("constructive-heuristics/vertex-coloring-greedy-and-dsatur/#sez-sec-GC",
            "constructive-heuristics/colorazione-dei-vertici-greedy-e-dsatur/#sez-sec-GC"),
    genera: function (rng, lingua) {
      var n = 6, G = randGraph(rng, n, 0.5);
      if (G.E.length < 6) return null;
      var lam = shuffle(rng, range1(n));
      var key = function (col) { return { k: col.join(","), t: "$col=" + vec(col) + "$" }; };
      var c0 = gcColor(G.adj, n, lam), c1 = gcColor(G.adj, n, range1(n)), c2 = gcColor(G.adj, n, lam.slice().reverse()), c3 = dsatur(G.adj, n).col;
      var b = build(rng, key(c0), [key(c1), key(c2), key(c3)]);
      if (!b) return null;
      return {
        testo: T(lingua, "Grafo $G=(V,E)$ con $V=\\{1,\\dots," + n + "\\}$ e " + edgeTex(G.E) + ". La colorazione greedy $GC$ esamina i vertici nell'ordine della lista $\\lambda=" + vec(lam) + "$ e dà a ciascuno il colore (intero $\\ge 1$) più piccolo non usato dai vicini già colorati. Quale colorazione $col=(col[1],\\dots,col[" + n + "])$ restituisce?",
          "Graph $G=(V,E)$ with $V=\\{1,\\dots," + n + "\\}$ and " + edgeTex(G.E) + ". The greedy coloring $GC$ examines the vertices in the order of the list $\\lambda=" + vec(lam) + "$ and gives each the smallest color (integer $\\ge 1$) not used by its already colored neighbors. Which coloring $col=(col[1],\\dots,col[" + n + "])$ does it return?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "Si esaminano i vertici nell'ordine di $\\lambda$ e si dà a ognuno il colore più piccolo non usato dai vicini già colorati: $col=" + vec(c0) + "$. L'ordine conta: con la lista $(1,\\dots," + n + ")$ si ottiene $" + vec(c1) + "$.",
          "The vertices are examined in the order of $\\lambda$ and each one gets the smallest color not used by its colored neighbours: $col=" + vec(c0) + "$. The order matters: with the list $(1,\\dots," + n + ")$ one gets $" + vec(c1) + "$."),
        _v: { dati: { n: n, E: G.E, lam: lam }, valori: b.valori }
      };
    }
  });

  // ---- 14. DSATUR: ordine di colorazione (cap. 30)
  add({
    id: "eh-g-vcp-dsatur", livello: "facile", capitolo: "constructive-heuristics",
    link: L("constructive-heuristics/vertex-coloring-greedy-and-dsatur/#sez-sec-DSATUR",
            "constructive-heuristics/colorazione-dei-vertici-greedy-e-dsatur/#sez-sec-DSATUR"),
    genera: function (rng, lingua) {
      var n = 6, G = randGraph(rng, n, 0.5);
      if (G.E.length < 6) return null;
      var D = dsatur(G.adj, n);
      // varianti sbagliate: pari merito per indice minore (senza grado); grado statico; pari merito per grado totale
      function variant(mode) {
        var col = new Array(n + 1).fill(0), seq = [];
        var deg = G.adj.map(function (a) { return a.length; });
        if (mode === "static") {
          return range1(n).sort(function (a, b) { return deg[b] - deg[a] || a - b; });
        }
        for (var st = 0; st < n; st++) {
          var best = -1, bs = -1, bd = -1;
          for (var v = 1; v <= n; v++) {
            if (col[v]) continue;
            var S = {}, ns = 0, du = 0;
            G.adj[v].forEach(function (u) { if (col[u]) { if (!S[col[u]]) { S[col[u]] = 1; ns++; } } else du++; });
            var d2 = mode === "total" ? deg[v] : 0;
            if (ns > bs || (ns === bs && d2 > bd)) { best = v; bs = ns; bd = d2; }
          }
          var U = {}; G.adj[best].forEach(function (u) { if (col[u]) U[col[u]] = 1; }); var c = 1; while (U[c]) c++;
          col[best] = c; seq.push(best);
        }
        return seq;
      }
      var key = function (s) { return { k: s.join(","), t: "$" + vec(s) + "$" }; };
      var b = build(rng, key(D.seq), [key(variant("index")), key(variant("static")), key(variant("total"))]);
      if (!b) return null;
      return {
        testo: T(lingua, "Grafo $G=(V,E)$ con $V=\\{1,\\dots," + n + "\\}$ e " + edgeTex(G.E) + ". $DSATUR$ colora a ogni passo il vertice non colorato di grado di saturazione massimo (numero di colori diversi fra i vicini già colorati), con il colore più piccolo libero; pari merito: più vicini non colorati, poi indice minimo. In quale ordine colora i vertici?",
          "Graph $G=(V,E)$ with $V=\\{1,\\dots," + n + "\\}$ and " + edgeTex(G.E) + ". At every step $DSATUR$ colors the uncolored vertex of maximum saturation degree (number of distinct colors among its colored neighbors), with the smallest free color; ties: more uncolored neighbors, then smallest index. In which order does it color the vertices?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "A ogni passo si sceglie il vertice non colorato con più colori diversi fra i vicini: ordine $" + vec(D.seq) + "$, con $" + D.nc + "$ colori. Il grado di spareggio è quello verso i vertici non ancora colorati, aggiornato a ogni passo.",
          "At each step the uncolored vertex with the most different colors among its neighbours is chosen: order $" + vec(D.seq) + "$, with $" + D.nc + "$ colors. The tie-breaking degree counts the vertices not yet colored, and it is updated at each step."),
        _v: { dati: { n: n, E: G.E }, valori: b.valori }
      };
    }
  });

  // ---- 15. nearest neighbour (cap. 30)
  add({
    id: "eh-g-tsp-nn", livello: "facile", capitolo: "constructive-heuristics",
    link: L("constructive-heuristics/the-travelling-salesman-problem-append-or-insert/#sez-sec-NN",
            "constructive-heuristics/il-problema-del-commesso-viaggiatore-accodare-o-inserire/#sez-sec-NN"),
    genera: function (rng, lingua) {
      var n = 5, d = randDist(rng, n, 2, 12);
      var s = ri(rng, 1, n), r = nn(d, n, s), other = nn(d, n, s === 1 ? 2 : 1);
      var id = range1(n), lid = tourLen(d, id);
      var b = build(rng, num(r.len), [num(r.open), num(other.len), num(lid), num(r.len + 1)]);
      if (!b) return null;
      return {
        testo: T(lingua, "TSP simmetrico (giro più corto che visita tutte le città) con le distanze " + distTab(d, n) + ". L'euristica $NN$ (nearest neighbour) parte dalla città $" + s + "$, va ogni volta alla città non visitata più vicina (pari merito: indice minore) e alla fine torna alla partenza. Qual è la lunghezza del giro?",
          "Symmetric TSP (shortest tour visiting all cities) with distances " + distTab(d, n) + ". The $NN$ (nearest neighbour) heuristic starts from city $" + s + "$, always moves to the closest unvisited city (ties: smaller index) and finally returns to the start. What is the length of the tour?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "$NN$ visita $" + vec(r.tour) + "$ e torna in $" + s + "$: lunghezza $" + r.len + "$. Errore tipico: dimenticare l'arco di ritorno (si otterrebbe $" + r.open + "$).",
          "$NN$ visits $" + vec(r.tour) + "$ and goes back to $" + s + "$: length $" + r.len + "$. Typical mistake: forgetting the closing edge (one would get $" + r.open + "$)."),
        _v: { dati: { d: d, n: n, s: s }, valori: b.valori }
      };
    }
  });

  // ---- 16. 2-opt, best improvement (cap. 31) — media
  add({
    id: "eh-g-tsp-2opt", livello: "media", capitolo: "local-search",
    link: L("local-search/evaluating-a-move-incrementally/#box-4-prop-twoopt",
            "local-search/valutare-una-mossa-in-modo-incrementale/#box-4-prop-twoopt"),
    genera: function (rng, lingua) {
      var n = 6, d = randDist(rng, n, 2, 12);
      var sig = [1].concat(shuffle(rng, [2, 3, 4, 5, 6])), L0 = tourLen(d, sig);
      var best = null, first = null, wrongBest = null;
      for (var i = 1; i <= n - 2; i++) for (var j = i + 2; j <= n; j++) {
        if (i === 1 && j === n) continue;
        var u1 = sig[i - 1], v1 = sig[i], u2 = sig[j - 1], v2 = sig[j % n];
        var D = d[u1][u2] + d[v1][v2] - d[u1][v1] - d[u2][v2];
        var Dw = d[u1][v2] + d[v1][u2] - d[u1][v1] - d[u2][v2];
        if (D < 0 && !first) first = { D: D, i: i, j: j };
        if (!best || D < best.D) best = { D: D, i: i, j: j };
        if (!wrongBest || Dw < wrongBest.D) wrongBest = { D: Dw };
      }
      if (best.D >= 0 || !first) return null;
      var bb = build(rng, num(L0 + best.D), [num(L0 + first.D), num(L0 - best.D), num(L0 + wrongBest.D), num(L0)]);
      if (!bb) return null;
      return {
        testo: T(lingua, "TSP simmetrico con le distanze " + distTab(d, n) + ". Il giro corrente è $\\sigma=" + vec(sig) + "$, di lunghezza $" + L0 + "$. Una mossa 2-opt toglie due lati non adiacenti del giro e ricollega i due cammini nell'altro modo possibile; con la regola best improvement si applica la mossa che riduce di più la lunghezza. Qual è la lunghezza del giro dopo un'iterazione?",
          "Symmetric TSP with distances " + distTab(d, n) + ". The current tour is $\\sigma=" + vec(sig) + "$, of length $" + L0 + "$. A 2-opt move removes two non-adjacent edges of the tour and reconnects the two paths in the other possible way; with the best-improvement rule the move that reduces the length the most is applied. What is the tour length after one iteration?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "Per ogni mossa $\\Delta=d_{u_1u_2}+d_{v_1v_2}-d_{u_1v_1}-d_{u_2v_2}$; la migliore ha $\\Delta=" + best.D + "$ (posizioni $i=" + best.i + "$, $j=" + best.j + "$), quindi $" + L0 + best.D + "=" + (L0 + best.D) + "$. La prima mossa migliorante ($\\Delta=" + first.D + "$) è quella del first improvement.",
          "For every move $\\Delta=d_{u_1u_2}+d_{v_1v_2}-d_{u_1v_1}-d_{u_2v_2}$; the best one has $\\Delta=" + best.D + "$ (positions $i=" + best.i + "$, $j=" + best.j + "$), hence $" + L0 + best.D + "=" + (L0 + best.D) + "$. The first improving move ($\\Delta=" + first.D + "$) is the one of first improvement."),
        _v: { dati: { d: d, n: n, sig: sig }, valori: bb.valori }
      };
    }
  });

  // ---- 17. LPT (cap. 30)
  add({
    id: "eh-g-pcmax-lpt", livello: "facile", capitolo: "constructive-heuristics",
    link: L("constructive-heuristics/scheduling-on-parallel-machines-longest-jobs-first/#sez-sec-LPT",
            "constructive-heuristics/scheduling-su-macchine-parallele-prima-i-lavori-piu-lunghi/#sez-sec-LPT"),
    genera: function (rng, lingua) {
      var m = 3, n = 7, t = [];
      for (var j = 0; j < n; j++) t.push(ri(rng, 2, 9));
      var idx = range1(n).map(function (i) { return i - 1; });
      var lpt = listSched(t, m, decOrder(t)).cmax, lst = listSched(t, m, idx).cmax, spt = listSched(t, m, decOrder(t).reverse()).cmax;
      var lb = Math.max(Math.max.apply(null, t), Math.ceil(sum(t) / m));
      var b = build(rng, num(lpt), [num(lst), num(spt), num(lb), num(lpt + 1)]);
      if (!b) return null;
      return {
        testo: T(lingua, "Scheduling $P\\,||\\,C_{\\max}$: $m=" + m + "$ macchine identiche, tempi di lavorazione $t=" + vec(t) + "$, si minimizza il makespan (carico massimo). $LPT$ ordina i lavori per tempo non crescente e assegna ciascuno alla macchina di carico minimo (pari merito: indice minore). Qual è il makespan della soluzione di $LPT$?",
          "Scheduling $P\\,||\\,C_{\\max}$: $m=" + m + "$ identical machines, processing times $t=" + vec(t) + "$, the makespan (maximum load) is minimized. $LPT$ sorts the jobs by non-increasing time and assigns each to the least loaded machine (ties: smaller index). What is the makespan of the $LPT$ solution?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "$LPT$ ordina i lavori per tempo non crescente e assegna ciascuno a una macchina di carico minimo: makespan $" + lpt + "$. $LIST$ nell'ordine dato dà $" + lst + "$; il lower bound $\\max\\{\\max_j t_j,\\lceil\\sum_j t_j/m\\rceil\\}$ vale $" + lb + "$.",
          "$LPT$ sorts the jobs by non-increasing time and assigns each one to a least loaded machine: makespan $" + lpt + "$. $LIST$ in the given order gives $" + lst + "$; the lower bound $\\max\\{\\max_j t_j,\\lceil\\sum_j t_j/m\\rceil\\}$ is $" + lb + "$."),
        _v: { dati: { t: t, m: m }, valori: b.valori }
      };
    }
  });

  // ---- 19. ricerca locale move per P||Cmax (cap. 31)
  add({
    id: "eh-g-pcmax-move", livello: "facile", capitolo: "local-search",
    link: L("local-search/p-cmax-move-and-swap/#sez-sec-pcmax", "local-search/p-cmax-move-e-swap/#sez-sec-pcmax"),
    genera: function (rng, lingua) {
      var m = 3, n = 6, t = [], mach = [];
      for (var j = 0; j < n; j++) { t.push(ri(rng, 1, 9)); mach.push(ri(rng, 1, m)); }
      var Lm = [0, 0, 0]; for (j = 0; j < n; j++) Lm[mach[j] - 1] += t[j];
      var cmax = Math.max.apply(null, Lm);
      if (Lm.filter(function (x) { return x === cmax; }).length > 1) return null;
      var best = null, first = null, moves = [];
      for (j = 0; j < n; j++) for (var h = 1; h <= m; h++) {
        if (h === mach[j]) continue;
        var L2 = Lm.slice(); L2[mach[j] - 1] -= t[j]; L2[h - 1] += t[j];
        var F = Math.max.apply(null, L2) - cmax;
        moves.push({ j: j + 1, h: h, F: F });
        if (F < 0 && !first) first = moves[moves.length - 1];
        if (!best || F < best.F) best = moves[moves.length - 1];
      }
      if (!best || best.F >= 0 || first === best) return null;
      var crit = Lm.indexOf(cmax) + 1, lmin = Lm.indexOf(Math.min.apply(null, Lm)) + 1;
      var big = -1; for (j = 0; j < n; j++) if (mach[j] === crit && (big < 0 || t[j] > t[big])) big = j;
      var key = function (mv) { return { k: mv.j + "->" + mv.h, t: T(lingua, "lavoro $" + mv.j + "$ sulla macchina $" + mv.h + "$", "job $" + mv.j + "$ to machine $" + mv.h + "$") }; };
      var nonCrit = null; for (j = 0; j < moves.length; j++) if (mach[moves[j].j - 1] !== crit) { nonCrit = moves[j]; break; }
      var Fof = function (mv) { for (var q = 0; q < moves.length; q++) if (moves[q].j === mv.j && moves[q].h === mv.h) return moves[q].F; return null; };
      var c2 = { j: big + 1, h: lmin === crit ? (crit % m) + 1 : lmin };
      var cands = [first, c2, nonCrit].filter(function (mv) { return mv && Fof(mv) !== null && Fof(mv) > best.F; }); // solo mosse strettamente peggiori
      var b = build(rng, key(best), cands.map(key));
      if (!b) return null;
      return {
        testo: T(lingua, "Scheduling $P\\,||\\,C_{\\max}$ (minimizzare il makespan, il carico massimo) con $m=3$ macchine, tempi $t=" + vec(t) + "$ e assegnamento corrente $\\mathrm{mach}=" + vec(mach) + "$ ($\\mathrm{mach}_j$ è la macchina del lavoro $j$; carichi $" + vec(Lm) + "$). L'intorno move sposta un lavoro $j$ su un'altra macchina $h$; best improvement sceglie la mossa che riduce di più il makespan (mosse esaminate per $j=1,\\dots,n$ e $h=1,\\dots,m$; a parità si tiene la prima). Quale mossa sceglie?",
          "Scheduling $P\\,||\\,C_{\\max}$ (minimize the makespan, the maximum load) with $m=3$ machines, times $t=" + vec(t) + "$ and current assignment $\\mathrm{mach}=" + vec(mach) + "$ ($\\mathrm{mach}_j$ is the machine of job $j$; loads $" + vec(Lm) + "$). The move neighborhood moves a job $j$ to another machine $h$; best improvement chooses the move that decreases the makespan the most (moves examined for $j=1,\\dots,n$ and $h=1,\\dots,m$; ties: the first one is kept). Which move does it choose?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "La variazione del makespan della mossa scelta è $" + best.F + "$, la più negativa (makespan da $" + cmax + "$ a $" + (cmax + best.F) + "$). La prima mossa migliorante (first improvement) ha variazione $" + first.F + "$; spostare un lavoro da una macchina non critica non riduce il makespan.",
          "The makespan change of the chosen move is $" + best.F + "$, the most negative (makespan from $" + cmax + "$ to $" + (cmax + best.F) + "$). The first improving move (first improvement) has change $" + first.F + "$; moving a job from a non-critical machine does not decrease the makespan."),
        _v: { dati: { t: t, mach: mach, m: m }, valori: b.valori }
      };
    }
  });
  // ================================================================ BATCH 4 (6 novembre 2026): almeno due generatori per capitolo con calcoli
  function L2(en, it, a) { var s = a ? "#" + a : ""; return L(en + "/" + s, it + "/" + s); }
  function twoEdgeSum(d, n) { var s = 0; for (var i = 1; i <= n; i++) { var r = []; for (var j = 1; j <= n; j++) if (j !== i) r.push(d[i][j]); r.sort(function (a, b) { return a - b; }); s += r[0] + r[1]; } return s; }

  // ---- B4.37 gap del nearest neighbour (cap. 29)
  add({
    id: "eh-g-heur-gap", livello: "media", capitolo: "heuristics",
    link: L2("heuristics", "heuristics", "box-6-prop-gap"),
    genera: function (rng, lingua) {
      var n = 5, d = randDist(rng, n, 2, 15), N = nn(d, n, 1).len, lb = Math.ceil(twoEdgeSum(d, n) / 2);
      if (N === lb) return null;
      var g = fr(N - lb, lb);
      var bb = build(rng, numF(g), [numF(fr(N - lb, N)), num(N - lb), numF(fr(N, lb)), numF(fr(lb, N))]);
      if (!bb) return null;
      return {
        testo: T(lingua, "TSP simmetrico con $5$ città e distanze " + distTab(d, n) + ". Il nearest neighbour dalla città $1$ (ogni volta la città non visitata più vicina, a parità l'indice minore, poi ritorno in $1$) dà il giro $\\mathscr{A}(I)$; il bound $\\mathrm{LB}=\\left\\lceil\\frac12\\sum_i(a_i+b_i)\\right\\rceil$ usa le due distanze minime $a_i,b_i$ di ogni città. Quanto vale il gap $\\frac{\\mathscr{A}(I)-\\mathrm{LB}}{\\mathrm{LB}}$?",
          "Symmetric TSP with $5$ cities and distances " + distTab(d, n) + ". Nearest neighbour from city $1$ (each time the nearest unvisited city, ties smallest index, then back to $1$) gives the tour $\\mathscr{A}(I)$; the bound $\\mathrm{LB}=\\left\\lceil\\frac12\\sum_i(a_i+b_i)\\right\\rceil$ uses the two smallest distances $a_i,b_i$ of every city. What is the gap $\\frac{\\mathscr{A}(I)-\\mathrm{LB}}{\\mathrm{LB}}$?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "$\\mathscr{A}(I)=" + N + "$ e $\\mathrm{LB}=" + lb + "$: gap $" + frTex(g) + "$. L'errore relativo del giro rispetto all'ottimo non supera questo valore.",
          "$\\mathscr{A}(I)=" + N + "$ and $\\mathrm{LB}=" + lb + "$: gap $" + frTex(g) + "$. The relative error of the tour with respect to the optimum does not exceed this value."),
        _v: { dati: { d: d, n: n }, valori: bb.valori }
      };
    }
  });
  // ---- B4.38 intorno flip per il KP (cap. 29)
  add({
    id: "eh-g-heur-flip", livello: "facile", capitolo: "heuristics",
    link: L2("heuristics", "heuristics", "box-9-def-neigh"),
    genera: function (rng, lingua) {
      var n = 5, p = [], w = []; for (var j = 0; j < n; j++) { p.push(ri(rng, 3, 12)); w.push(ri(rng, 2, 7)); }
      var c = ri(rng, 10, 16), x = [], ww = 0, pp = 0;
      for (j = 0; j < n; j++) { var b = rng() < 0.4 && ww + w[j] <= c ? 1 : 0; x.push(b); if (b) { ww += w[j]; pp += p[j]; } }
      var bestF = -1, bestAny = -1;
      for (j = 0; j < n; j++) { var nw = ww + (x[j] ? -w[j] : w[j]), np = pp + (x[j] ? -p[j] : p[j]); if (np > bestAny) bestAny = np; if (nw <= c && np > bestF) bestF = np; }
      if (bestF <= pp || bestAny === bestF) return null;
      var bb = build(rng, num(bestF), [num(bestAny), num(pp), num(bestF + 1), num(pp + Math.max.apply(null, p))]);
      if (!bb) return null;
      return {
        testo: T(lingua, "Zaino 0-1 con capacità $c=" + c + "$ e oggetti " + itemTab(lingua, p, w) + ". La soluzione corrente è $x=" + vec(x) + "$; l'intorno flip contiene le soluzioni ammissibili ottenute cambiando una sola componente di $x$ (aggiungere o togliere un oggetto). Quanto vale il miglior vicino?",
          "0-1 knapsack with capacity $c=" + c + "$ and items " + itemTab(lingua, p, w) + ". The current solution is $x=" + vec(x) + "$; the flip neighbourhood contains the feasible solutions obtained by changing a single component of $x$ (adding or removing one item). What is the value of the best neighbour?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "La soluzione corrente vale $" + pp + "$ e pesa $" + ww + "$; fra i vicini ammissibili il migliore vale $" + bestF + "$. Ignorando la capacità si arriverebbe a $" + bestAny + "$, ma quel vicino non è ammissibile.",
          "The current solution is worth $" + pp + "$ and weighs $" + ww + "$; among the feasible neighbours the best is worth $" + bestF + "$. Ignoring the capacity one would reach $" + bestAny + "$, but that neighbour is infeasible."),
        _v: { dati: { p: p, w: w, c: c, x: x }, valori: bb.valori }
      };
    }
  });

  // ---- B4.39 simulated annealing (cap. 32)
  add({
    id: "eh-g-sa-prob", livello: "facile", capitolo: "metaheuristics",
    link: L2("metaheuristics/how-to-escape-from-a-local-optimum", "metaheuristics/come-uscire-da-un-ottimo-locale", "sez-sec-sa"),
    genera: function (rng, lingua) {
      var dl = ri(rng, 1, 12), Tt = ri(rng, 2, 10), f = fr(dl, Tt);
      var ek = function (q, neg) { return { k: (neg ? "-" : "+") + frKey(q), t: "$e^{" + (neg ? "-" : "") + frTex(q) + "}$" }; };
      var bb = build(rng, ek(f, true), [ek(fr(Tt, dl), true), { k: "1", t: "$1$" }, ek(fr(dl * Tt, 1), true), ek(f, false)]);
      if (!bb || f.n === f.d) return null;
      return {
        testo: T(lingua, "Nel simulated annealing per un problema di minimo, alla temperatura $T=" + Tt + "$ si propone un vicino che peggiora l'obiettivo di $\\delta=" + dl + "$. Con la regola di Metropolis, con quale probabilità è accettato?",
          "In simulated annealing for a minimization problem, at temperature $T=" + Tt + "$ a neighbour worsening the objective by $\\delta=" + dl + "$ is proposed. With the Metropolis rule, with which probability is it accepted?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "Un peggioramento $\\delta>0$ è accettato con probabilità $e^{-\\delta/T}=e^{-" + frTex(f) + "}$; un miglioramento sarebbe accettato con probabilità $1$.",
          "A worsening $\\delta>0$ is accepted with probability $e^{-\\delta/T}=e^{-" + frTex(f) + "}$; an improvement would be accepted with probability $1$."),
        _v: { dati: { delta: dl, T: Tt }, valori: bb.valori }
      };
    }
  });
  // ---- B4.40 crossover a un punto (cap. 32)
  add({
    id: "eh-g-ga-cross", livello: "facile", capitolo: "metaheuristics",
    link: L2("metaheuristics/population-based-methods-genetic-and-memetic-algorithms", "metaheuristics/metodi-basati-su-popolazioni-algoritmi-genetici-e-memetici", "sez-sec-ga"),
    genera: function (rng, lingua) {
      var n = 7, a = [], b = []; for (var j = 0; j < n; j++) { a.push(ri(rng, 0, 1)); b.push(ri(rng, 0, 1)); }
      var cut = ri(rng, 2, n - 2), ch = function (x, y, k) { return x.slice(0, k).concat(y.slice(k)); };
      var key = function (v) { return { k: v.join(""), t: "$" + vec(v) + "$" }; };
      var bb = build(rng, key(ch(a, b, cut)), [key(ch(b, a, cut)), key(ch(a, b, cut + 1)), key(ch(a, b, cut - 1)), key(ch(b, a, cut + 1))]);
      if (!bb) return null;
      return {
        testo: T(lingua, "Algoritmo genetico per lo zaino 0-1 con codifica binaria ($x_j=1$ se l'oggetto $j$ è scelto). Il crossover a un punto con taglio $cut=" + cut + "$ prende i geni $1,\\dots,cut$ dal primo genitore e i geni $cut+1,\\dots,n$ dal secondo. Genitori $" + vec(a) + "$ e $" + vec(b) + "$: quale figlio si ottiene?",
          "Genetic algorithm for the 0-1 knapsack with binary encoding ($x_j=1$ if item $j$ is chosen). One-point crossover with cut $cut=" + cut + "$ takes genes $1,\\dots,cut$ from the first parent and genes $cut+1,\\dots,n$ from the second. Parents $" + vec(a) + "$ and $" + vec(b) + "$: which child is obtained?"),
        opzioni: bb.opzioni, corretta: bb.corretta,
        spiegazione: T(lingua, "I primi $" + cut + "$ geni vengono da $" + vec(a) + "$ e gli altri da $" + vec(b) + "$: $" + vec(ch(a, b, cut)) + "$. Il figlio può superare la capacità e allora va riparato.",
          "The first $" + cut + "$ genes come from $" + vec(a) + "$ and the others from $" + vec(b) + "$: $" + vec(ch(a, b, cut)) + "$. The child may exceed the capacity and then must be repaired."),
        _v: { dati: { a: a, b: b, cut: cut }, valori: bb.valori }
      };
    }
  });

  // ---- C3. P||Cmax: discesa best improvement con l'intorno move e l'obiettivo ausiliario (parte 4, cap. 31) — complessa
  function moveDescent(t, m, mach0, best) { // minimizza sum L_h^2; restituisce {cmax, moves}
    var mach = mach0.slice(), L = []; for (var h = 0; h < m; h++) L.push(0);
    t.forEach(function (x, j) { L[mach[j] - 1] += x; });
    var moves = 0;
    for (var it = 0; it < 200; it++) {
      var bj = -1, bh = -1, bd = 0;
      for (var j = 0; j < t.length; j++) {
        for (h = 1; h <= m; h++) {
          if (h === mach[j]) continue;
          var a = mach[j] - 1, b = h - 1, d = 2 * t[j] * (L[b] - L[a] + t[j]); // variazione di sum L^2
          if (d < bd) { bd = d; bj = j; bh = h; if (!best) break; }
        }
        if (!best && bj >= 0) break;
      }
      if (bj < 0) break;
      L[mach[bj] - 1] -= t[bj]; L[bh - 1] += t[bj]; mach[bj] = bh; moves++;
    }
    return { cmax: Math.max.apply(null, L), moves: moves };
  }
  add({
    id: "eh-g-pcmax-descent", livello: "complessa", capitolo: "local-search",
    link: L2("local-search/p-cmax-move-and-swap", "local-search/p-cmax-move-e-swap", "sez-sec-pcmax"),
    genera: function (rng, lingua) {
      var n = 7, m = 3, t = [], mach = [];
      for (var j = 0; j < n; j++) { t.push(ri(rng, 2, 9)); mach.push(ri(rng, 1, 3)); }
      var L0 = [0, 0, 0]; t.forEach(function (x, k) { L0[mach[k] - 1] += x; });
      var R = moveDescent(t, m, mach, true), F1 = moveDescent(t, m, mach, false);
      if (R.moves < 2) return null;
      var c0 = Math.max.apply(null, L0);
      var key = function (a, b2) { return { k: a + "|" + b2, t: T(lingua, "makespan finale $" + a + "$, dopo $" + b2 + "$ mosse", "final makespan $" + a + "$, after $" + b2 + "$ moves") }; };
      var b = build(rng, key(R.cmax, R.moves), [key(F1.cmax, F1.moves), key(c0, 0), key(R.cmax + 1, R.moves), key(R.cmax, R.moves + 1), key(R.cmax, R.moves - 1)]);
      if (!b) return null;
      return {
        testo: T(lingua, "$P\\,||\\,C_{\\max}$ con $m=3$ macchine e lavori di durata $t=" + vec(t) + "$; la soluzione di partenza assegna i lavori alle macchine $" + vec(mach) + "$. Si applica la ricerca locale con l'intorno move (un lavoro passa a un'altra macchina) e l'obiettivo ausiliario $\\sum_hL_h^2$ da minimizzare ($L_h$ = carico della macchina $h$), con la regola best improvement: a ogni iterazione si applica la mossa che diminuisce di più $\\sum_hL_h^2$ (pari merito: lavoro di indice minore, poi macchina di indice minore), finché nessuna mossa lo diminuisce. Qual è il makespan finale e quante mosse si applicano?",
          "$P\\,||\\,C_{\\max}$ with $m=3$ machines and jobs of duration $t=" + vec(t) + "$; the starting solution assigns the jobs to the machines $" + vec(mach) + "$. Local search is applied with the move neighbourhood (one job goes to another machine) and the auxiliary objective $\\sum_hL_h^2$ to be minimized ($L_h$ = load of machine $h$), with the best improvement rule: at every iteration the move decreasing $\\sum_hL_h^2$ the most is applied (ties: smallest job index, then smallest machine index), until no move decreases it. What is the final makespan and how many moves are applied?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "Carichi iniziali $" + vec(L0) + "$, makespan $" + c0 + "$. Spostare il lavoro $j$ dalla macchina $a$ alla $b$ cambia $\\sum_hL_h^2$ di $2t_j(L_b-L_a+t_j)$; la discesa applica $" + R.moves + "$ mosse e si ferma con makespan $" + R.cmax + "$. Con first improvement la discesa sarebbe diversa ($" + F1.moves + "$ mosse, makespan $" + F1.cmax + "$).",
          "Initial loads $" + vec(L0) + "$, makespan $" + c0 + "$. Moving job $j$ from machine $a$ to $b$ changes $\\sum_hL_h^2$ by $2t_j(L_b-L_a+t_j)$; the descent applies $" + R.moves + "$ moves and stops with makespan $" + R.cmax + "$. With first improvement the descent would differ ($" + F1.moves + "$ moves, makespan $" + F1.cmax + "$)."),
        _v: { dati: { t: t, mach: mach }, valori: b.valori }
      };
    }
  });

  // ---- C4. TSP: nearest neighbour e poi 2-opt first improvement (parte 4, cap. 31) — complessa
  function twoOptFirst(d, tour) {
    var t = tour.slice(), n = t.length, moves = 0, again = true;
    while (again && moves < 100) {
      again = false;
      for (var i = 0; i < n - 1 && !again; i++) {
        for (var j = i + 2; j < n && !again; j++) {
          if (i === 0 && j === n - 1) continue;
          var a = t[i], b = t[i + 1], c = t[j], e = t[(j + 1) % n];
          if (d[a][c] + d[b][e] - d[a][b] - d[c][e] < 0) {
            var seg = t.slice(i + 1, j + 1).reverse();
            for (var k = 0; k < seg.length; k++) t[i + 1 + k] = seg[k];
            moves++; again = true;
          }
        }
      }
    }
    return { tour: t, len: tourLen(d, t), moves: moves };
  }
  add({
    id: "eh-g-tsp-nn2opt", livello: "complessa", capitolo: "local-search",
    link: L2("local-search/tsp-2-opt-and-or-opt", "local-search/tsp-2-opt-e-or-opt", "sez-sec-tsp"),
    genera: function (rng, lingua) {
      var n = 6, d = randDist(rng, n, 1, 9);
      var N = nn(d, n, 1), R = twoOptFirst(d, N.tour);
      if (R.moves < 1) return null;
      var key = function (a, b2) { return { k: a + "|" + b2, t: T(lingua, "lunghezza finale $" + a + "$, dopo $" + b2 + "$ mosse", "final length $" + a + "$, after $" + b2 + "$ moves") }; };
      var b = build(rng, key(R.len, R.moves), [key(N.len, 0), key(R.len, R.moves + 1), key(R.len + 1, R.moves), key(R.len - 1, R.moves), key(N.open, R.moves)]);
      if (!b) return null;
      return {
        testo: T(lingua, "TSP con $6$ città e distanze simmetriche " + distTab(d, n) + ". Si costruisce il giro nearest neighbour dalla città $1$ (pareggi: città di indice minore), scritto come sequenza $(t_1,\\dots,t_6)$ con $t_1=1$. Poi si applica 2-opt con la regola first improvement: si esaminano le coppie di posizioni $(i,j)$ con $i=1,\\dots,5$ e $j=i+2,\\dots,6$ (esclusa $(1,6)$); la mossa toglie i lati $\\{t_i,t_{i+1}\\}$ e $\\{t_j,t_{j+1}\\}$ (con $t_7=t_1$), aggiunge $\\{t_i,t_j\\}$ e $\\{t_{i+1},t_{j+1}\\}$ invertendo il tratto $t_{i+1},\\dots,t_j$, e si applica appena accorcia il giro; dopo ogni mossa l'esame riparte da $(1,3)$. Qual è la lunghezza del giro finale e quante mosse si applicano?",
          "TSP with $6$ cities and symmetric distances " + distTab(d, n) + ". The nearest neighbour tour from city $1$ is built (ties: smallest city index), written as a sequence $(t_1,\\dots,t_6)$ with $t_1=1$. Then 2-opt is applied with the first improvement rule: the pairs of positions $(i,j)$ with $i=1,\\dots,5$ and $j=i+2,\\dots,6$ (except $(1,6)$) are examined; the move removes the edges $\\{t_i,t_{i+1}\\}$ and $\\{t_j,t_{j+1}\\}$ (with $t_7=t_1$), adds $\\{t_i,t_j\\}$ and $\\{t_{i+1},t_{j+1}\\}$ reversing the stretch $t_{i+1},\\dots,t_j$, and is applied as soon as it shortens the tour; after every move the scan restarts from $(1,3)$. What is the length of the final tour and how many moves are applied?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "Nearest neighbour dà $" + vec(N.tour) + "$, lunghezza $" + N.len + "$. 2-opt applica $" + R.moves + "$ mosse e si ferma nell'ottimo locale $" + vec(R.tour) + "$, lunghezza $" + R.len + "$.",
          "Nearest neighbour gives $" + vec(N.tour) + "$, length $" + N.len + "$. 2-opt applies $" + R.moves + "$ moves and stops at the local optimum $" + vec(R.tour) + "$, length $" + R.len + "$."),
        _v: { dati: { d: d }, valori: b.valori }
      };
    }
  });
  // ---- arrotondamento per difetto della soluzione del rilassamento dello zaino (cap. 5, 21/11/2026)
  add({
    id: "eh-g-kp-round", livello: "facile", capitolo: "mip-heuristics-classical",
    link: L("mip-heuristics-classical/#sez-sec-rounding", "mip-heuristics-classical/#sez-sec-rounding"),
    genera: function (rng, lingua) {
      var n = 5, it0 = [];
      for (var j = 0; j < n; j++) { var wj = ri(rng, 2, 8); it0.push([wj * ri(rng, 1, 4) + ri(rng, 0, 3), wj]); }
      it0.sort(function (a, b) { return b[0] * a[1] - a[0] * b[1]; });   // efficienza non crescente
      var p = it0.map(function (x) { return x[0]; }), w = it0.map(function (x) { return x[1]; });
      for (j = 1; j < n; j++) if (p[j - 1] * w[j] === p[j] * w[j - 1]) return null;   // niente pari merito
      var c = ri(rng, 8, sum(w) - 2), tot = 0, s = -1;
      for (j = 0; j < n; j++) { if (tot + w[j] > c) { s = j; break; } tot += w[j]; }
      if (s <= 0) return null;
      var rc = c - tot; if (rc === 0) return null;
      var P0 = 0; for (j = 0; j < s; j++) P0 += p[j];
      var lp = fr(P0 * w[s] + rc * p[s], w[s]);
      var gr = P0, cap = rc; for (j = s + 1; j < n; j++) if (w[j] <= cap) { gr += p[j]; cap -= w[j]; }
      var b = build(rng, num(P0), [num(P0 + p[s]), numF(lp), num(gr), num(Math.floor(lp.n / lp.d) + 1)]);
      if (!b) return null;
      var xt = range1(n).map(function (k) { return k - 1 < s ? "1" : (k - 1 === s ? frTex(fr(rc, w[s])) : "0"); });
      return {
        testo: T(lingua, "Zaino 0/1 con capacità $c=" + c + "$ e oggetti già ordinati per efficienza $p_j/w_j$ non crescente: " + itemTab(lingua, p, w) + ". La soluzione ottima del rilassamento lineare di $\\mathrm{ILP}_{\\mathrm{KP}}$ è $\\tilde{\\vet x}=" + vec(xt) + "$. Quanto vale il profitto della soluzione $\\lfloor\\tilde{\\vet x}\\rfloor$ ottenuta arrotondando per difetto?",
          "0/1 knapsack with capacity $c=" + c + "$ and items already sorted by non-increasing efficiency $p_j/w_j$: " + itemTab(lingua, p, w) + ". The optimal solution of the linear relaxation of $\\mathrm{ILP}_{\\mathrm{KP}}$ is $\\tilde{\\vet x}=" + vec(xt) + "$. What is the profit of the solution $\\lfloor\\tilde{\\vet x}\\rfloor$ obtained by rounding down?"),
        opzioni: b.opzioni, corretta: b.corretta,
        spiegazione: T(lingua, "Arrotondando per difetto si tengono gli oggetti $1,\\dots," + s + "$ e si toglie l'oggetto frazionario $" + (s + 1) + "$: profitto $" + P0 + "$, ammissibile perché il peso solo diminuisce. $" + frTex(lp) + "$ è il valore del rilassamento; il greedy, che continua dopo l'oggetto che non entra, può fare di più.",
          "Rounding down keeps items $1,\\dots," + s + "$ and drops the fractional item $" + (s + 1) + "$: profit $" + P0 + "$, feasible because the weight only decreases. $" + frTex(lp) + "$ is the value of the relaxation; the greedy, which continues after the item that does not fit, may do better."),
        _v: { dati: { p: p, w: w, c: c }, valori: b.valori }
      };
    }
  });
})();
