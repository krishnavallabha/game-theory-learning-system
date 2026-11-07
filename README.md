# Game Theory — Learning & Exam Preparation System

An interactive, single-page study dashboard for **Game Theory and Strategy (ms4023)**, IIT Madras BS programme.
It teaches every syllabus concept from first principles, maps every past-paper question to the concept it tests, and tracks your progress with spaced repetition.

**Current coverage:** Quiz 1, Weeks 1–4.
**Planned:** Weeks 5–8 (Quiz 2), Weeks 9–12, and a cumulative end-term mode (see [Roadmap](#roadmap)).

---

## Features

| Area | What you get |
|---|---|
| **Concepts** | 40 concepts, each taught with a 10-part framework: intuition, why it matters, formal definition, mathematics, three graded worked examples, visuals, connections, misconceptions, exam perspective and an interactive checkpoint |
| **Past papers** | 86 previous-year questions from five Quiz 1 papers (2024 T2 – 2026 T2), each with the original wording, a verified key, a step-by-step solution, per-option analysis, traps and a labelled variation |
| **Practice** | MCQ, MSQ, numeric (fractions accepted) and self-graded short answers; answers stay hidden until you submit |
| **Mock exams** | Per-week and cumulative mocks with configurable length, difficulty and question pool; score, solutions, topic-wise performance and revision advice after submission |
| **Revision** | Leitner spaced repetition (0, 0, 1, 3, 7, 15 days), an error notebook, 119 flashcards and weekly revision sheets |
| **Reference** | Formula handbook, comparison tables, a 77-term glossary and a worked-problem library |
| **Exam intelligence** | Topic, question-type and difficulty frequencies computed live from the mapped papers. Past frequency does not guarantee future questions |
| **App** | Global search, light/dark themes, mobile layout and math rendering (MathJax). Progress is saved in your browser and can be reset |

## Quick start

No install is needed to *use* it: open `public/index.html` in any browser.

To edit content and rebuild:

```bash
python build.py          # src/  ->  public/index.html
node scripts/check.js    # validate content (exits 1 on any error)
```

To preview locally:

```bash
python -m http.server 8000 --directory public
```

Then open http://localhost:8000.

## Project structure

```
.
├── build.py              # concatenates src/ into one self-contained HTML file
├── render.yaml           # Render static-site blueprint
├── public/
│   └── index.html        # built dashboard (committed, served by Render)
├── scripts/
│   └── check.js          # content validator
└── src/
    ├── index.tpl.html    # page shell (CSS/JS are injected here)
    ├── styles.css        # light/dark theme and layout
    ├── helpers.js        # rendering helpers (payoff matrices, trees, math)
    ├── data_core.js      # registries + WEEKS syllabus structure
    ├── data_w1.js … data_w4.js   # concepts and checkpoints, one file per week
    ├── data_pyq.js       # past-paper questions and variations
    ├── data_extra.js     # glossary, formulas, comparisons, flashcards, sheets, reports
    └── app.js            # routing, question engine, mocks, tracking
```

## Adding a new week (e.g. Week 5)

1. **Syllabus:** add the week to `WEEKS` in `src/data_core.js`, giving its topics and concept ids.
2. **Content:** create `src/data_w5.js` and register concepts with `C({...})` and checkpoints with `Q({...})`. Copy the shape of an existing week.
3. **Build list:** add `'data_w5.js'` after `'data_w4.js'` in the `JS` list in `build.py`.
4. **Past papers:** add questions to `src/data_pyq.js` using `PQ(paper, qno, marks, type, {...})`.
5. **Reference data:** add glossary, formulas and flashcards in `src/data_extra.js`.
6. **Check and rebuild:** run `node scripts/check.js && python build.py`.
7. **Commit and push.** Render redeploys automatically.

## Content rules

- **Source priority:** course material, then personal notes, then the prescribed textbook (Dixit, Skeath & Reiley, *Games of Strategy*), then lecture notes, then general knowledge. Disagreements are listed on the in-app **Sources** page.
- **Labels:** generated questions are never labelled as past-paper questions. Each question carries one of `PYQ`, `ASSIGNMENT`, `NEW` or `VARIATION`.
- **Keys:** every answer key is re-derived independently, and keys that could not be checked against the paper are marked *derived*.
- **Citations:** no page numbers or timestamps are cited unless they appear in the source.


## Roadmap

- [x] Quiz 1: Weeks 1–4 (simultaneous and sequential games, pure and mixed strategies)
- [ ] Quiz 2: Weeks 5–8
- [ ] Weeks 9–12
- [ ] End-term mode: cumulative mocks and revision across all 12 weeks
- [ ] Exam selector (Quiz 1 / Quiz 2 / End-term) on the home page

## Known limitations

- MathJax and the fonts load from CDNs; offline, formulas show as raw TeX.
- Progress lives in each browser's `localStorage`, so it does not sync across devices.
- Short-answer questions are self-assessed.
- Mocks sample questions one at a time across concepts; past-paper comprehension blocks are not kept together.

## License

Personal study project. Textbooks and official question papers are **not** included in this repository.
