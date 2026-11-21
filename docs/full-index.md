# Full index

<!-- collana-organizzazione -->
## How to use these notes

- **Website and PDF.** Each chapter of the website is a chapter of the lecture notes, with the same numbers and the same colors; long chapters are split into one page per section.
- **At the top of each chapter** a bar with the PDF of the lecture notes, the slides, the exercises and the apps of the chapter; at the bottom, the link to the exercises.
- **The problems.** Definitions, instances and formulations of the problems are in the course [Combinatorial Optimization Problems](https://fabiofurini.github.io/combinatorial-optimization/): the chapters link to them.
- **The code.** On the pages the algorithms are in pseudo-code; the «Run in Colab» buttons open the notebook with the code in Python and C++.

The boxes have the same colors as in the lecture notes:

<div class="grid" markdown>

!!! definizione "Definition"
    The precise meaning of a new concept.

!!! teorema "Theorem, proposition, observation"
    A result to remember, with its hypotheses.

!!! esempio "Example"
    A computation worked out in full, one step at a time.

!!! formula "Formula"
    In pink the formulas to keep at hand.

!!! algoritmo "Algorithm"
    The pseudo-code, step by step as in the lecture notes.

!!! chiave ""
    **In green** the key point to take away.

</div>

??? dimostrazione "Proof: opens with a click"
    All proofs are included, but folded: first read the statement, then open the proof when you want to study it. The same holds for the solutions of the exercises.
<!-- /collana-organizzazione -->

All the pages of the website, in the order of the menu: the chapters with their sections and the other pages.

## [Heuristic Algorithms](heuristics.md)

- **[1. Heuristic algorithms: definitions](heuristics.md)** · [Exercises](exercises/heuristics.md)
    - [1.1 Heuristic algorithms](heuristics.md#11-heuristic-algorithms)
    - [1.2 The problems and the assumptions](heuristics.md#sez-sec-problems)
    - [1.3 Primal and dual bounds](heuristics.md#13-primal-and-dual-bounds)
    - [1.4 Classification of heuristic algorithms](heuristics.md#14-classification-of-heuristic-algorithms)
    - [1.5 Solution representation and search space](heuristics.md#15-solution-representation-and-search-space)
    - [1.6 Neighbourhoods and local optima](heuristics.md#16-neighbourhoods-and-local-optima)
    - [1.7 Intensification and diversification](heuristics.md#17-intensification-and-diversification)
    - [1.8 How to evaluate a heuristic algorithm](heuristics.md#sez-sec-evaluation)
    - [1.9 Typical mistakes](heuristics.md#19-typical-mistakes)
    - [1.10 In summary](heuristics.md#110-in-summary)
- **[2. Constructive heuristics](constructive-heuristics/index.md)** · [Exercises](exercises/constructive-heuristics.md)
    - [2.1 Constructive heuristics](constructive-heuristics/index.md#sez-sec-constructive)
    - [2.2 The problems and the assumptions](constructive-heuristics/the-problems-and-the-assumptions.md#sez-sec-problems)
    - [2.3 The greedy paradigm](constructive-heuristics/the-problems-and-the-assumptions.md#sez-sec-greedy)
    - [2.4 The 0/1 knapsack problem: which order?](constructive-heuristics/the-0-1-knapsack-problem-which-order.md)
    - [2.5 The bin packing problem: first sort, then pack](constructive-heuristics/the-bin-packing-problem-first-sort-then-pack.md)
    - [2.6 Scheduling on parallel machines: longest jobs first](constructive-heuristics/scheduling-on-parallel-machines-longest-jobs-first.md)
    - [2.7 The travelling salesman problem: append or insert?](constructive-heuristics/the-travelling-salesman-problem-append-or-insert.md)
    - [2.8 Vertex coloring: greedy and DSATUR](constructive-heuristics/vertex-coloring-greedy-and-dsatur.md)
    - [2.9 Randomized construction](constructive-heuristics/randomized-construction.md)
    - [2.10 Look-ahead and regret](constructive-heuristics/look-ahead-and-regret.md)
    - [2.11 What constructive heuristics give, and what they do not](constructive-heuristics/what-constructive-heuristics-give-and-what-they-do-not.md)
    - [2.12 Typical mistakes](constructive-heuristics/typical-mistakes.md#212-typical-mistakes)
    - [2.13 In summary](constructive-heuristics/typical-mistakes.md#213-in-summary)
- **[3. Local search](local-search/index.md)** · [Exercises](exercises/local-search.md)
    - [3.1 Local search](local-search/index.md#sez-sec-ls)
    - [3.2 The problems, the assumptions and the starting solutions](local-search/the-problems-the-assumptions-and-the-starting-solutions.md)
    - [3.3 Local search: the scheme](local-search/local-search-the-scheme.md#sez-sec-scheme)
    - [3.4 Neighbourhoods for the four problems](local-search/local-search-the-scheme.md#sez-sec-neigh)
    - [3.5 First improvement and best improvement](local-search/first-improvement-and-best-improvement.md)
    - [3.6 Evaluating a move incrementally](local-search/evaluating-a-move-incrementally.md)
    - [3.7 TSP: 2-opt and Or-opt](local-search/tsp-2-opt-and-or-opt.md)
    - [3.8 $P\,||\,C_{\max}$: move and swap](local-search/p-cmax-move-and-swap.md)
    - [3.9 Flat landscapes and auxiliary objectives](local-search/flat-landscapes-and-auxiliary-objectives.md)
    - [3.10 KP: feasibility and penalties](local-search/kp-feasibility-and-penalties.md)
    - [3.11 Variable neighbourhood descent](local-search/variable-neighbourhood-descent.md)
    - [3.12 Multi-start local search](local-search/multi-start-local-search.md)
    - [3.13 Typical mistakes](local-search/typical-mistakes.md#313-typical-mistakes)
    - [3.14 In summary](local-search/typical-mistakes.md#314-in-summary)
- **[4. Metaheuristics](metaheuristics/index.md)** · [Exercises](exercises/metaheuristics.md)
    - [4.1 Metaheuristics](metaheuristics/index.md#sez-sec-metaheuristic)
    - [4.2 The problems and the assumptions](metaheuristics/the-problems-and-the-assumptions.md)
    - [4.3 How to escape from a local optimum](metaheuristics/how-to-escape-from-a-local-optimum.md#sez-sec-escape)
    - [4.4 Simulated annealing](metaheuristics/how-to-escape-from-a-local-optimum.md#sez-sec-sa)
    - [4.5 Tabu search](metaheuristics/tabu-search.md)
    - [4.6 Iterated local search](metaheuristics/iterated-local-search.md)
    - [4.7 Variable neighbourhood search](metaheuristics/variable-neighbourhood-search.md)
    - [4.8 GRASP](metaheuristics/grasp.md)
    - [4.9 Large neighbourhood search](metaheuristics/large-neighbourhood-search.md)
    - [4.10 Population-based methods: genetic and memetic algorithms](metaheuristics/population-based-methods-genetic-and-memetic-algorithms.md)
    - [4.11 Comparison and conclusions](metaheuristics/comparison-and-conclusions.md)
    - [4.12 Typical mistakes](metaheuristics/typical-mistakes.md#412-typical-mistakes)
    - [4.13 In summary](metaheuristics/typical-mistakes.md#413-in-summary)
- **[5. MIP heuristics for the classical problems](mip-heuristics-classical.md)** · [Exercises](exercises/mip-heuristics-classical.md)
    - [5.1 MIP-based heuristics](mip-heuristics-classical.md#sez-sec-intro)
    - [5.2 The problems and their MIP models](mip-heuristics-classical.md#sez-sec-models)
    - [5.3 Rounding](mip-heuristics-classical.md#sez-sec-rounding)
    - [5.4 Diving](mip-heuristics-classical.md#sez-sec-diving)
    - [5.5 The feasibility pump](mip-heuristics-classical.md#sez-sec-fp)
    - [5.6 RINS, local branching and proximity search](mip-heuristics-classical.md#sez-sec-submip)
    - [5.7 Relax-and-fix and fix-and-optimize on lot sizing](mip-heuristics-classical.md#sez-sec-rf)
    - [5.8 Heuristics inside the solver](mip-heuristics-classical.md#sez-sec-gurobi)
    - [5.9 What the MIP-based heuristics give](mip-heuristics-classical.md#sez-sec-give)
    - [5.10 Typical mistakes](mip-heuristics-classical.md#sez-sec-mistakes)
    - [5.11 In summary](mip-heuristics-classical.md#sez-sec-summary)

## Other pages

- [Exercises](exercises/index.md)
- [Lab](lab/index.md)
- [Downloads](downloads.md)
- [Colab notebooks](notebooks.md)
- [Self-assessment](self-assessment.md)
