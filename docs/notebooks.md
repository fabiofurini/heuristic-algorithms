---
title: Notebooks
---

# The course notebooks

The code of the chapters on algorithms is in the **Colab notebooks**, one per chapter and per language: **Python** and **C++** (the MIP heuristics only in Python, with `gurobipy`). On the pages of the website the algorithms are written in pseudo-code; in the notebooks the same algorithms are implemented (with indices from 0) and run on every example of the chapter and on every instance of the exercises, checking the expected values, with a «Try it yourself» cell to run them on your own data.

- **What Colab is.** [Google Colab](https://colab.research.google.com/) runs the notebooks in the browser, on a Google machine: all you need is a Google account, nothing is installed on your computer.
- **How to open one.** Click a badge in the table, or the «Run in Colab» buttons below the pseudo-code on the chapter pages. To keep your changes: *File → Save a copy in Drive*.
- **How to run it.** *Runtime → Run all* (Ctrl+F9) runs all the cells from top to bottom; a single cell runs with Shift+Enter.
- **C++.** Each file is written by one cell (`%%writefile`); the cell after `Main.cpp` compiles everything with `g++` and runs the examples: everything happens inside Colab.
- **One notebook per language.** The two notebooks of a chapter contain the same algorithms and print the same results.

The **.ipynb** link opens the notebook on GitHub, where you can download it (*Download raw file*) to use it with Jupyter on your own computer.

<div class="tabella-notebook" markdown>

| Chapter | Python | C++ |
|---|:---:|:---:|
| [2. Constructive heuristics](constructive-heuristics/index.md) | [![Open in Colab (Python)](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/heuristic-algorithms/blob/main/notebooks/constructive-heuristics_python.ipynb) [.ipynb](https://github.com/fabiofurini/heuristic-algorithms/blob/main/notebooks/constructive-heuristics_python.ipynb) | [![Open in Colab (C++)](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/heuristic-algorithms/blob/main/notebooks/constructive-heuristics_cpp.ipynb) [.ipynb](https://github.com/fabiofurini/heuristic-algorithms/blob/main/notebooks/constructive-heuristics_cpp.ipynb) |
| [3. Local search](local-search/index.md) | [![Open in Colab (Python)](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/heuristic-algorithms/blob/main/notebooks/local-search_python.ipynb) [.ipynb](https://github.com/fabiofurini/heuristic-algorithms/blob/main/notebooks/local-search_python.ipynb) | [![Open in Colab (C++)](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/heuristic-algorithms/blob/main/notebooks/local-search_cpp.ipynb) [.ipynb](https://github.com/fabiofurini/heuristic-algorithms/blob/main/notebooks/local-search_cpp.ipynb) |
| [4. Metaheuristics](metaheuristics/index.md) | [![Open in Colab (Python)](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/heuristic-algorithms/blob/main/notebooks/metaheuristics_python.ipynb) [.ipynb](https://github.com/fabiofurini/heuristic-algorithms/blob/main/notebooks/metaheuristics_python.ipynb) | [![Open in Colab (C++)](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/heuristic-algorithms/blob/main/notebooks/metaheuristics_cpp.ipynb) [.ipynb](https://github.com/fabiofurini/heuristic-algorithms/blob/main/notebooks/metaheuristics_cpp.ipynb) |
| [5. MIP heuristics for the classical problems](mip-heuristics-classical.md) | [![Open in Colab (Python)](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/fabiofurini/heuristic-algorithms/blob/main/notebooks/mip-heuristics-classical_python.ipynb) [.ipynb](https://github.com/fabiofurini/heuristic-algorithms/blob/main/notebooks/mip-heuristics-classical_python.ipynb) |  |

</div>
