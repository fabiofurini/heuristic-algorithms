---
title: Heuristic Algorithms
hide:
  - navigation
  - toc
---

<div class="hero" markdown>

# Heuristic Algorithms

<!-- collana-riga -->
<p class="collana-riga" markdown>A course of the <b>Operations Research and Mathematics</b> series · [all the courses](#the-series)</p>
<!-- /collana-riga -->

Teaching material conceived and developed by **[Fabio Furini](https://fabiofurini.github.io/)**, associate
professor at [DIAG](https://www.diag.uniroma1.it/), Sapienza University of Rome.

**The course lecture notes, online**: heuristic algorithms for combinatorial optimization problems, that is, primal and dual bounds and the evaluation of heuristics, constructive heuristics, local search, metaheuristics and MIP heuristics, applied to knapsack, packing, routing, scheduling and coloring problems; with definitions, examples worked out step by step, exercises with solutions, Colab notebooks and interactive apps.

Prerequisites: [Combinatorial Optimization](https://fabiofurini.github.io/combinatorial-optimization/) for the problems, their instances and their formulations.

[Start :material-arrow-right:](heuristics.md){ .md-button .md-button--primary }
[:material-pencil: Exercises](exercises/index.md){ .md-button }
[:material-gesture-tap: Lab](lab/index.md){ .md-button }
[:material-clipboard-check-outline: Quiz](self-assessment.md){ .md-button }
[:material-download: Downloads](downloads.md){ .md-button }

</div>

<!-- collana-app -->
## Try it now

The TSP with nearest neighbour and 2-opt: the tour is built city by city, then 2-opt improves it; drag the cities in the plane.

<div class="gi" data-grafico="oc-tsp"></div>

[:material-gesture-tap: More apps in the lab](lab/index.md){ .md-button }
<!-- /collana-app -->

## The parts of the course

The chapters of the course, the same as in the lecture notes and in the menu.

<div class="grid cards" markdown>

-   :material-scale-balance: **1. Heuristic algorithms: definitions**

    ---

    *Chapter 1*

    The problems and the assumptions · Primal and dual bounds · Classification of heuristic algorithms · Solution representation and search space

    [:octicons-arrow-right-24: Read the chapter](heuristics.md) · [Exercises](exercises/heuristics.md)

-   :material-hammer-wrench: **2. Constructive heuristics**

    ---

    *Chapter 2*

    The problems and the assumptions · The greedy paradigm · The 0/1 knapsack problem: which order? · The bin packing problem: first sort, then pack

    [:octicons-arrow-right-24: Read the chapter](constructive-heuristics/index.md) · [Exercises](exercises/constructive-heuristics.md)

-   :material-magnify: **3. Local search**

    ---

    *Chapter 3*

    The problems, the assumptions and the starting solutions · Local search: the scheme · Neighbourhoods for the four problems · First improvement and best improvement

    [:octicons-arrow-right-24: Read the chapter](local-search/index.md) · [Exercises](exercises/local-search.md)

-   :material-fire: **4. Metaheuristics**

    ---

    *Chapter 4*

    The problems and the assumptions · How to escape from a local optimum · Simulated annealing · Tabu search

    [:octicons-arrow-right-24: Read the chapter](metaheuristics/index.md) · [Exercises](exercises/metaheuristics.md)

-   :material-function-variant: **5. MIP heuristics for the classical problems**

    ---

    *Chapter 5*

    MIP-based heuristics · The problems and their MIP models · Rounding · Diving

    [:octicons-arrow-right-24: Read the chapter](mip-heuristics-classical.md) · [Exercises](exercises/mip-heuristics-classical.md)

</div>

<!-- collana-da-non-perdere -->
## Don't miss

<div class="grid cards" markdown>

-   :material-pencil-box-multiple: **Exercises with solutions**

    ---

    Exercises for every chapter, each with its worked solution that opens with a click.

    [:octicons-arrow-right-24: The exercises](exercises/index.md)

-   :material-clipboard-check-outline: **Self-assessment quiz**

    ---

    A new mock exam at every start: 13 questions, 33 points, with the solution and the link to the notes. Downloads also has the full question bank.

    [:octicons-arrow-right-24: Test yourself](self-assessment.md)

-   :material-gesture-tap: **Interactive lab**

    ---

    Apps running in the browser: move the parameters and watch the ideas of the course at work, one step at a time.

    [:octicons-arrow-right-24: The lab](lab/index.md)

-   :material-download: **Lecture notes in PDF**

    ---

    Lecture notes, exercise books and slides in PDF, with the same numbering as the website.

    [:octicons-arrow-right-24: Downloads](downloads.md)

-   :material-language-python: **Notebooks in Colab**

    ---

    The code of the course running in the browser, with nothing to install.

    [:octicons-arrow-right-24: The notebooks](notebooks.md)

-   :material-format-list-numbered: **Full index**

    ---

    All the chapters with their sections on one page, and how each chapter is organized.

    [:octicons-arrow-right-24: The index](full-index.md)

</div>
<!-- /collana-da-non-perdere -->

---

<!-- collana -->
## The series

Ten courses built the same way: lecture notes online and in PDF, exercises with solutions, an interactive lab and self-assessment quizzes.

<div class="grid cards" markdown>

-   :material-function-variant: **[Mathematical Analysis 1](https://fabiofurini.github.io/mathematical-analysis-1/)**

    real numbers, functions, limits, derivatives and series, with interactive graphs

-   :material-matrix: **[Linear Algebra](https://fabiofurini.github.io/linear-algebra/)**

    vectors, matrices, determinants, linear systems and eigenvalues, with the computation lab

-   :material-code-braces: **[Algorithms](https://fabiofurini.github.io/algorithms/)**

    number representation, pseudo-code, sorting and searching, analysis and recursive algorithms

-   :material-vector-triangle: **[Linear Programming](https://fabiofurini.github.io/linear-programming/)**

    polyhedra, the simplex algorithm, duality and the dual simplex, with the interactive lab

-   :material-dots-grid: **[Integer Linear Programming](https://fabiofurini.github.io/integer-linear-programming/)**

    LP relaxation, valid inequalities, cutting planes, branch-and-bound and branch-and-cut

-   :material-vector-curve: **[Convex Optimization](https://fabiofurini.github.io/convex-optimization/)**

    convex sets and functions, convex optimization problems, with interactive graphs

-   :material-graph-outline: **[Network Optimization](https://fabiofurini.github.io/network-optimization/)**

    graphs, spanning trees, shortest paths, network flows, the network simplex and project management

-   :material-hexagon-multiple-outline: **[Combinatorial Optimization](https://fabiofurini.github.io/combinatorial-optimization/)**

    knapsack, bin packing, coloring, TSP, scheduling and lot sizing, solved in every way

-   :material-map-marker-path: **Heuristic Algorithms** · *this course*

    constructive heuristics, local search, metaheuristics and MIP heuristics for combinatorial optimization problems

-   :material-approximately-equal: **[Approximation Algorithms](https://fabiofurini.github.io/approximation-algorithms/)**

    performance guarantees, approximation schemes and limits of approximation for combinatorial problems

-   :material-vector-polygon: **[MIP Modelling](https://fabiofurini.github.io/mip-modelling/)**

    integer linear programming models, from the formulation to the solution with solvers

-   :material-chart-timeline-variant: **[Operations Research Lab](https://fabiofurini.github.io/operations-research-lab/)**

    modelling and solving optimization problems with Python and solvers

</div>
<!-- /collana -->

---

Teaching material by **[Fabio Furini](https://fabiofurini.github.io/)** —
[DIAG](https://www.diag.uniroma1.it/), Sapienza University of Rome.

*This website is also available in [Italian](https://fabiofurini.github.io/algoritmi-euristici/).*
