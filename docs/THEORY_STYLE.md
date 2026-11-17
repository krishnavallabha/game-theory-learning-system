# Theory writing style (Weeks 5–12 and end-term)

**Feedback on Weeks 1–4:** the theory was *too short and too complex at the same time*.
**The fix:** write **longer but simpler** pages. Add steps; never compress them.

The reference model is the Hotelling page below. Every new concept page follows this shape.

---

## The six moves of a concept page

| # | Move | What it must do | Maps to concept field |
|---|---|---|---|
| 1 | **Intuition first** | A concrete scene (a beach, two sellers, customers) told in plain words. End with the question the concept answers and a hint of the surprise ("you might think… but that's not what happens"). | `intu` |
| 2 | **Formal setup** | Introduce notation one symbol per line: the players, the strategies, the payoffs. Each symbol comes with its plain-English meaning. | `formal` |
| 3 | **Visualise an example** | Real numbers plus an inline SVG diagram. Then **"Now suppose…"**: change one number and recompute, so the reader *sees* the incentive. | `ex[0]` + `vis` |
| 4 | **The result** | Box the answer ($\boxed{x_1=x_2=\tfrac12}$). Then **"Why?"**: check every possible deviation in one short line each. | `math` |
| 5 | **Connection** | A real-world reading (the median voter, firms clustering) and links to earlier and later concepts. | `conn` |
| 6 | **Exam lens** | How it is asked, the common traps, and the two remaining worked examples (moderate, then exam-level). | `exam`, `mis`, `ex[1..2]` |

## Sentence rules
- One idea per line. Short sentences. Bullets for lists of cases.
- No symbol before the reader has the intuition for it.
- Every formula is followed by a one-line "in words" reading.
- Every claim of the form "neither player gains by deviating" is backed by an explicit check.
- Use your own inline SVG diagrams; never hotlink images.

## Reference page (abridged)

> **1. Intuition first.** Imagine a beach 1 km long with two ice-cream sellers. Customers are spread evenly, and each buys from the closer seller. Where should the sellers stand? You might think they should spread out. They don't: both drift to the centre.
>
> **2. Formal setup.** The beach is $[0,1]$. Seller 1 chooses $x_1$ and Seller 2 chooses $x_2$. Each seller's payoff is their market share.
>
> **3. Visualise.** Take $x_1=0.25$ and $x_2=0.75$: the boundary is at $0.5$ and each seller gets half. *Now suppose* Seller 1 moves to $0.40$. The boundary becomes $\frac{0.40+0.75}{2}=0.575$, so Seller 1 now has 57.5%. Moving toward the rival pays.
>
> **4. Result.** $\boxed{x_1=x_2=\tfrac12}$. *Why?* If one seller steps left or right, the other captures more than half. No unilateral move helps.
>
> **5. Connection.** Two parties choosing positions on a left–right spectrum both move toward the median voter. This is the Median Voter Theorem.
