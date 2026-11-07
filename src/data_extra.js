/* ===================== REFERENCE MODULES ===================== */
const G = (term, week, rel, def, intu, key) => ({ term, week, rel, def, intu, key: !!key });
const GLOSSARY = [
  G('Game', 1, ['game-elements'], 'A situation of strategic interdependence: each player’s payoff depends on the actions of all players.', 'Your best move depends on what others do, and theirs on yours.', 1),
  G('Decision problem', 1, ['decision'], 'Choice by a single agent whose payoff depends only on her own action (and nature).', 'Optimising against a fixed environment.'),
  G('Player', 1, ['game-elements'], 'A decision-maker whose choices affect payoffs; must make a strategic choice in the model.', 'Inspector Vinod sets rules but is not a player.'),
  G('Action', 2, ['action-strategy'], 'A single move available to a player at a decision point.', 'One step, e.g. “bid 2”.'),
  G('Strategy (pure)', 2, ['action-strategy', 'ef-strategy'], 'A complete plan assigning an action to every information set of the player.', 'An instruction book covering every contingency, even unreached ones.', 1),
  G('Mixed strategy', 3, ['mixed-strategy'], 'A probability distribution over a player’s pure strategies.', 'Deliberate unpredictability.', 1),
  G('Support', 3, ['mixed-strategy', 'indifference'], 'The set of pure actions played with positive probability by a mixed strategy.', 'What you actually randomise over.'),
  G('Action profile', 1, ['game-elements'], 'A list $a=(a_1,\\dots,a_n)$ with one action per player.', 'One cell of the matrix.'),
  G('Deleted profile $a_{-i}$', 1, ['game-elements'], 'The profile of everyone’s actions except player $i$’s.', 'What “the others” do.', 1),
  G('Payoff function', 1, ['game-elements'], '$u_i:A\\to\\mathbb R$, giving player $i$’s utility for every action profile.', 'A number for every cell.'),
  G('Completeness', 1, ['prefs'], 'Any two outcomes can be compared: $x\\succsim y$ or $y\\succsim x$.', 'You are never stuck unable to rank.', 1),
  G('Transitivity', 1, ['prefs'], '$x\\succsim y$ and $y\\succsim z$ imply $x\\succsim z$.', 'No preference cycles (no money pump).', 1),
  G('Utility function', 1, ['prefs'], 'A function $u$ with $x\\succsim y\\iff u(x)\\ge u(y)$.', 'Numbers that encode a ranking.'),
  G('Ordinal payoff', 1, ['prefs'], 'Payoffs whose only meaning is the ranking; any increasing transformation is equivalent.', 'Enough for pure-strategy analysis.'),
  G('Expected (vNM) utility', 3, ['mixed-strategy', 'prefs'], 'Value of a lottery = probability-weighted average of utilities.', 'Needed once players randomise.'),
  G('Rationality', 1, ['assumptions'], 'Consistent (complete, transitive) preferences and choice that maximises (expected) utility given beliefs.', 'Doing the best for yourself given what you believe.', 1),
  G('Common knowledge', 1, ['assumptions'], 'Everyone knows X, everyone knows that everyone knows X, and so on ad infinitum.', 'Infinitely deep shared knowledge — the SMS story shows it is hard to reach.', 1),
  G('Mutual knowledge', 1, ['assumptions'], 'Everyone knows X (first level only).', 'Necessary but weaker than common knowledge.'),
  G('Perfect recall', 1, ['assumptions'], 'Players never forget their own past moves or information.', 'No amnesia.'),
  G('Static (simultaneous) game', 1, ['classify'], 'Players choose without observing each other’s choices.', 'Sealed envelopes.'),
  G('Dynamic (sequential) game', 1, ['classify', 'tree'], 'Some players observe earlier moves before choosing.', 'Chess.'),
  G('Complete information', 1, ['classify'], 'Players, actions and payoffs are common knowledge.', 'Everyone knows the rules and stakes.', 1),
  G('Perfect information', 4, ['info-sets', 'classify'], 'Every information set is a singleton: each mover knows the whole history.', 'You always see what happened before.', 1),
  G('Imperfect information', 4, ['info-sets'], 'Some information set contains two or more nodes.', 'You can’t tell where in the tree you are.'),
  G('Cooperative game', 1, ['coop'], 'Binding agreements are possible; analysis of coalitions and value division via $v(S)$.', 'Who teams up and how the pie is split.'),
  G('Non-cooperative game', 1, ['coop'], 'Individual players choose; agreements are not externally enforced.', 'Every player for herself — though interests may align.', 1),
  G('Characteristic function', 1, ['coop'], '$v(S)$: the total payoff coalition $S$ can secure.', 'Value of each team.'),
  G('Zero-sum game', 3, ['zero-sum'], '$u_1+u_2=0$ in every cell.', 'My gain is your loss.', 1),
  G('Constant-sum game', 3, ['zero-sum'], '$u_1+u_2=c$ in every cell; strategically equivalent to zero-sum.', 'The pie size is fixed (drug-dealer game: 100 trades).'),
  G('Strategic (normal) form', 1, ['normal-form'], 'Representation by players, strategy sets and payoff functions — a matrix for two players.', 'The table view.', 1),
  G('Extensive form', 4, ['tree'], 'Tree representation with order of moves, information and payoffs at terminal nodes.', 'The story view.', 1),
  G('Prisoner’s Dilemma', 1, ['pd'], 'Symmetric 2×2 game with $T>R>P>S$: defection strictly dominant, mutual defection inefficient.', 'Individually rational, collectively bad.', 1),
  G('Strict dominance', 1, ['dominance'], '$a_i$ strictly dominates $a_i\'$ if it gives a strictly higher payoff against every $a_{-i}$.', 'Always better.', 1),
  G('Weak dominance', 1, ['dominance', 'iewds'], 'Never worse against any $a_{-i}$ and strictly better against at least one.', 'Never worse, sometimes better.', 1),
  G('Dominant strategy', 1, ['dominance', 'dse'], 'A strategy that dominates every other strategy of the player.', 'Best no matter what.', 1),
  G('Dominant-strategy equilibrium', 2, ['dse'], 'Profile in which every player plays a dominant strategy (strict or weak).', 'Needs no predictions at all.', 1),
  G('IESDS', 2, ['iesds'], 'Iterated elimination of strictly dominated strategies; order-independent; never removes an NE.', 'Peel away what no rational player would do, repeatedly.', 1),
  G('IEWDS', 2, ['iewds'], 'Iterated elimination of weakly dominated strategies; may be order-dependent and may remove NE.', 'A more aggressive but less reliable peeling.'),
  G('Dominance solvable', 2, ['iesds'], 'Iterated elimination leaves a single profile.', 'The game “solves itself”.'),
  G('Best response', 2, ['best-response'], 'An action maximising a player’s payoff given the others’ actions (or beliefs).', 'Your optimal reply.', 1),
  G('Best-response correspondence', 3, ['br-graph'], 'The set-valued map from opponents’ (mixed) strategies to one’s best responses.', 'Can be a whole interval at indifference.'),
  G('Nash equilibrium', 2, ['nash'], 'A profile in which each player’s strategy is a best response to the others’.', 'No one regrets their choice given the others’.', 1),
  G('Strict Nash equilibrium', 2, ['nash'], 'Each player’s equilibrium action is the unique best response.', 'Every deviation strictly loses.'),
  G('Mixed-strategy Nash equilibrium', 3, ['mixed-strategy', 'indifference'], 'An NE in which some player randomises; each mix makes opponents indifferent over their supports.', 'Keep the other side guessing.', 1),
  G('Indifference principle', 3, ['indifference'], 'In an MSNE every action in a player’s support yields the same expected payoff.', 'You only randomise if you don’t care which.', 1),
  G('Exclusion rule', 3, ['indifference'], 'Actions outside the support yield no more than the equilibrium payoff.', 'Unused actions must not be better.'),
  G('Nash’s existence theorem', 3, ['nash-existence'], 'Every finite game has at least one mixed-strategy NE.', 'There is always somewhere to rest.', 1),
  G('Belief', 3, ['nbr'], 'A probability distribution over opponents’ action profiles.', 'Your forecast of others.'),
  G('Never a best response (NBR)', 3, ['nbr'], 'An action that is a best response to no belief; equivalent to strict domination by a (mixed) strategy.', 'Never sensible under any forecast.', 1),
  G('Battle of the Sexes', 2, ['classic-games'], 'Coordination game with conflicting preferences over which equilibrium.', 'Meet — but where?'),
  G('Stag Hunt', 2, ['classic-games'], 'Coordination between a payoff-dominant (risky) and a risk-dominant (safe) equilibrium.', 'Trust vs safety.'),
  G('Matching Pennies', 2, ['classic-games', 'zero-sum'], 'Zero-sum 2×2 game with cyclic best responses; unique MSNE (½,½).', 'Pure guessing game.'),
  G('Hawk–Dove (Chicken)', 2, ['classic-games'], 'Anti-coordination game: each wants the other to back down; two asymmetric pure NE and a symmetric mixed NE.', 'Who blinks first?', 1),
  G('Focal point', 2, ['ne-interpret'], 'An equilibrium that stands out by salience, convention or symmetry.', 'Meet at the clock tower.'),
  G('Braess’s paradox', 2, ['braess'], 'Adding capacity to a congestible network can raise everyone’s equilibrium travel time.', 'A new road makes everyone slower.', 1),
  G('Congestion game', 2, ['braess'], 'Players choose resources whose cost depends on how many use them.', 'Traffic.'),
  G('Hotelling model', 2, ['hotelling'], 'Location game on a line; with two sellers both locate at the median.', 'Ice-cream sellers in the middle of the beach.'),
  G('Cournot competition', 2, ['cournot'], 'Firms choose quantities simultaneously; price from inverse demand.', 'Quantity war.'),
  G('Bertrand competition', 2, ['continuous-ne'], 'Firms choose prices simultaneously.', 'Price war (here with differentiated products).'),
  G('Strategic complements / substitutes', 2, ['best-response', 'cournot'], 'Complements: BR increasing in rival’s action (Bertrand, Synergies). Substitutes: decreasing (Cournot).', 'Do you move with or against your rival?'),
  G('Bystander effect', 3, ['bystander'], 'In the symmetric MSNE of the crime-reporting game, reporting probability falls as witnesses increase.', 'Everyone waits for someone else.'),
  G('Game tree', 4, ['tree'], 'Graph with a root, decision nodes (labelled by mover), branches (actions) and terminal nodes (payoffs).', 'The storyboard of a game.', 1),
  G('Decision node', 4, ['tree'], 'A node at which a player chooses.', 'A fork in the road.'),
  G('Terminal node', 4, ['tree'], 'A node ending the game, carrying a payoff vector.', 'A leaf.', 1),
  G('History', 4, ['tree'], 'A sequence of actions from the root; terminal histories end the game.', 'A path in the tree.'),
  G('Information set', 4, ['info-sets'], 'A set of a player’s decision nodes she cannot distinguish; same actions at each.', 'Dotted lines join nodes you can’t tell apart.', 1),
  G('Backward induction', 4, ['backward'], 'Solving a finite perfect-information game from the last moves to the first.', 'Look forward, reason backward.', 1),
  G('Rollback equilibrium', 4, ['backward'], 'The strategy profile produced by backward induction.', 'Same as the SPE in perfect-information games.'),
  G('Subgame', 4, ['subgame'], 'Part of a tree starting at a singleton information set, containing all successors and no broken information sets.', 'A game within the game.', 1),
  G('Subgame-perfect equilibrium', 4, ['spe'], 'A profile inducing a Nash equilibrium in every subgame.', 'Rational even off the equilibrium path.', 1),
  G('Non-credible threat', 4, ['spe'], 'A threatened action that would not be optimal if the situation arose.', '“I’ll fight” — but fighting would hurt you too.', 1),
  G('Commitment (burning bridges)', 4, ['ef-apps', 'tree'], 'Removing one’s own options to change rivals’ expectations.', 'Fewer options can mean more power.'),
  G('Stackelberg model', 4, ['ef-apps'], 'Leader picks quantity first; follower observes and responds.', 'First-mover advantage in quantities.'),
  G('Ultimatum game', 4, ['ef-apps'], 'Proposer offers a split; responder accepts or rejects (both get 0).', 'Take it or leave it.'),
  G('Agenda setting', 4, ['ef-apps'], 'Choosing the order of pairwise votes to influence the outcome under cyclic majorities.', 'Whoever sets the order picks the winner.'),
  G('Condorcet paradox', 4, ['ef-apps'], 'Majority preferences can be cyclic even if each voter is transitive.', 'A beats B beats C beats A.'),
  G('Mechanism design', 1, ['game-elements'], 'Designing rules so that equilibrium play yields desired outcomes.', 'Reverse game theory.')
];

const F = (name, week, cs, tex, sym, cond, note, ex, key) => ({ name, week, cs, tex, sym, cond, note, ex, key: !!key });
const FORMULAS = [
  F('Number of action profiles', 1, ['game-elements'], R`$$|A|=\prod_{i=1}^n|A_i|$$`, R`$|A_i|$ = number of actions of player $i$.`, 'Finite games.', '', '2×3×4 = 24 profiles.'),
  F('Non-empty coalitions', 1, ['coop'], R`$$2^n-1$$`, '$n$ players.', 'Cooperative games.', '$2^n$ counts the empty set too.', '4 players → 15.', 1),
  F('Prisoner’s Dilemma condition', 1, ['pd'], R`$$T>R>P>S$$`, 'Temptation, Reward, Punishment, Sucker (row payoffs).', 'Symmetric 2×2 games.', 'Lecture letters: b > a > d > c.', '(4,3,1,0) traffic game.', 1),
  F('Strict dominance', 1, ['dominance'], R`$$u_i(a_i,a_{-i})>u_i(a_i',a_{-i})\ \ \forall a_{-i}$$`, '', 'Compare two strategies of the same player.', 'Weak: ≥ everywhere, > somewhere.', 'Auction: b₂=2 vs b₂=0.', 1),
  F('Mixed strategy payoff vs pure profile', 1, ['mixed-dom'], R`$$U_i(\sigma_i,a_{-i})=\sum_{a}\sigma_i(a)\,u_i(a,a_{-i})$$`, R`$\sigma_i$ = mixed strategy.`, 'Testing domination by a mixture.', 'Need strict inequality in every column.', '½(3,0)+½(0,3)=(1.5,1.5)>(1,1).'),
  F('Nash equilibrium', 2, ['nash'], R`$$u_i(a_i^*,a_{-i}^*)\ge u_i(a_i,a_{-i}^*)\ \ \forall a_i,\forall i$$`, '', 'Any strategic game.', 'Equivalently $a_i^*\\in B_i(a_{-i}^*)$.', '', 1),
  F('Best response via FOC', 2, ['best-response'], R`$$\frac{\partial u_i(a_i,a_{-i})}{\partial a_i}=0,\quad \frac{\partial^2u_i}{\partial a_i^2}<0$$`, '', 'Continuous, concave payoffs; check corners.', 'Differentiate before imposing symmetry.', 'Synergies: $a+e_j-2e_i=0$.', 1),
  F('Synergies best response & NE', 2, ['continuous-ne'], R`$$v_i=(a+e_j)e_i-ce_i^2\ \Rightarrow\ BR_i=\frac{a+e_j}{2c},\quad e^*=\frac{a}{2c-1}$$`, R`$c$ = cost coefficient.`, '$2c>1$.', 'c = 1: e* = a, payoff a²; c = 2: e* = a/3.', 'PYQs 2024 T3, 2025 T2, 2026 T2.', 1),
  F('Bertrand (differentiated) BR & NE', 2, ['continuous-ne'], R`$$q_i=10-P_i+P_j\Rightarrow BR_i=5+\frac{P_j}{2},\ P^*=10,\ \pi^*=100$$`, '', 'Zero cost.', 'With unit cost c: BR = (10+c)/2 + P_j/2.', 'PYQs 2025 T3, 2026 T2.', 1),
  F('Linear BR fixed point', 2, ['continuous-ne'], R`$$x=\alpha+\beta x\Rightarrow x^*=\frac{\alpha}{1-\beta}\quad(|\beta|<1)$$`, '', 'Symmetric games with linear BRs.', 'Unique when |β| < 1.', 'α=5, β=½ → 10.'),
  F('Cournot duopoly', 2, ['cournot'], R`$$b_i(q_j)=\frac{a-c-q_j}{2},\quad q^*=\frac{a-c}{3},\quad P^*=\frac{a+2c}{3},\quad \pi^*=\frac{(a-c)^2}{9}$$`, '$P=a-Q$, marginal cost $c$.', 'Interior solution.', 'Monopoly Q = (a−c)/2.', 'a=12, c=0: q=4, P=4, π=16.', 1),
  F('Hawk–Dove mixed NE', 2, ['classic-games'], R`$$p_H=\frac{v/2+d}{k+d}$$`, '$v$ resource, $k$ injury cost, $d$ display cost.', '$k>v/2$, $d<v/2$.', '', 'v=10, k=6, d=4 → 0.9.', 1),
  F('Hotelling shares', 2, ['hotelling'], R`$$x_1<x_2:\ u_1=\frac{x_1+x_2}{2},\ u_2=1-\frac{x_1+x_2}{2}$$`, '', 'Uniform consumers on [0,1].', 'NE: both at ½.', ''),
  F('Braess link times (PYQ)', 2, ['braess'], R`$$t_{AX}=t_{YB}=3+3n,\ t_{AY}=19+n,\ t_{XB}=19.1+0.9n,\ t_{XY}=6+n$$`, '$n$ = cars on the link.', 'PYQ network.', 'Before: 29.9/30; after: 32 for all.', '', 1),
  F('Expected payoff (2×2)', 3, ['mixed-strategy'], R`$$U_1=pq\,u_{TL}+p(1-q)u_{TR}+(1-p)q\,u_{BL}+(1-p)(1-q)u_{BR}$$`, R`$p=\Pr(T)$, $q=\Pr(L)$.`, 'Independent mixing.', '', ''),
  F('2×2 indifference', 3, ['indifference'], R`$$q^*=\frac{d-b}{(a-c)+(d-b)}\ \text{ for P1 payoffs }\begin{pmatrix}a&b\\c&d\end{pmatrix}$$`, R`$q$ = P2’s prob. of Left.`, 'Interior MSNE (no dominance).', 'P1’s own p uses P2’s payoffs.', '2025 T3: q = 3/8.', 1),
  F('Bystander model', 3, ['bystander'], R`$$p^*_{\text{not call}}=\Big(\frac CV\Big)^{\frac1{n-1}},\quad \Pr(\text{reported})=1-\Big(\frac CV\Big)^{\frac n{n-1}}\to1-\frac CV$$`, '$n$ witnesses, cost $C$, benefit $V$.', '$V>C>0$.', '', 'n=2, C/V=¼: 15/16.', 1),
  F('4×2 continuum condition', 3, ['nbr'], R`$$3p+r=1,\quad q^*=\tfrac23$$`, '$p=\\Pr(A)$, $r=\\Pr(C)$.', 'Lecture 4×2 game.', 'B is NBR (dominated by ¾A+¼D).', ''),
  F('Number of pure strategies (tree)', 4, ['ef-strategy'], R`$$|S_i|=\prod_{I\in\mathcal H_i}|A(I)|$$`, R`$\mathcal H_i$ = player $i$’s information sets.`, 'Extensive-form games.', 'Include unreached information sets.', 'PYQ P1: 2×2 = 4.', 1),
  F('Subgames in perfect information', 4, ['subgame'], R`$$\#\text{subgames}=\#\text{decision nodes}$$`, '', 'Perfect information only.', 'Includes the whole game.', 'PYQ tree: 3.', 1),
  F('Stackelberg', 4, ['ef-apps'], R`$$q_1=\frac{a-c}{2},\ q_2=\frac{a-c}{4},\ \pi_1=\frac{(a-c)^2}{8}$$`, '$P=a-Q$, cost $c$.', 'Leader commits first.', 'Follower π = (a−c)²/16.', 'a=12: 6 and 3.')
];

const COMPARISONS = [
  { title: 'Strict vs weak dominance', a: 'Strict', b: 'Weak', rows: [['Inequality', '> against every $a_{-i}$', '≥ everywhere, > somewhere'], ['Iterated elimination', 'Order-independent; never deletes NE', 'Order-dependent; may delete NE'], ['Dominant strategy', 'Unique if it exists', 'Can be several (payoff-equivalent)'], ['PYQ', 'Auction “strictly dominated”', '—']], tip: 'One tie in any column ⇒ not strict.' },
  { title: 'IESDS vs IEWDS', a: 'IESDS', b: 'IEWDS', rows: [['Deletes', 'Strictly dominated', 'Weakly dominated'], ['Order', 'Irrelevant', 'Can change result'], ['Unique survivor', 'Is the unique NE', 'Is an NE, not necessarily unique']], tip: 'Course true/false items test the right-hand column.' },
  { title: 'Dominant-strategy equilibrium vs Nash equilibrium', a: 'DSE', b: 'NE', rows: [['Requirement', 'Best against every profile', 'Best against the equilibrium profile'], ['Existence', 'Rare', 'Always (mixed, finite games)'], ['Inclusion', 'DSE ⊂ NE', 'NE ⊄ DSE']], tip: '' },
  { title: 'Pure vs mixed Nash equilibrium', a: 'Pure', b: 'Mixed', rows: [['Found by', 'Underlining best responses', 'Indifference conditions'], ['Uses', 'Ordinal payoffs suffice', 'Cardinal (expected) payoffs'], ['Own mix determined by', '—', 'Opponent’s payoffs']], tip: 'Drug-dealer decoys swap the two players’ probabilities.' },
  { title: 'Perfect vs complete information', a: 'Perfect information', b: 'Complete information', rows: [['About', 'Observing past moves', 'Knowing payoffs/rules'], ['Opposite', 'Imperfect (non-singleton info set)', 'Incomplete (private types)'], ['Example', 'Chess, PYQ tree', 'Any matrix game with known payoffs']], tip: 'A simultaneous game is complete but imperfect.' },
  { title: 'Nash equilibrium vs subgame-perfect equilibrium', a: 'NE (of a tree)', b: 'SPE', rows: [['Optimality required', 'Only on the path of play', 'In every subgame'], ['Non-credible threats', 'Allowed', 'Eliminated'], ['PYQ count', '3 (or 4 in 2026)', '1']], tip: 'Check the off-path node (E vs F).' },
  { title: 'Cournot vs Bertrand vs Stackelberg', a: 'Cournot / Bertrand', b: 'Stackelberg', rows: [['Timing', 'Simultaneous', 'Sequential'], ['Choice variable', 'Quantity / price', 'Quantity'], ['BR slope', 'Down (Cournot) / up (Bertrand)', 'Follower BR as in Cournot'], ['Solution', 'Intersect BRs', 'Backward induction']], tip: '' },
  { title: 'Zero-sum vs constant-sum vs general-sum', a: 'Zero / constant-sum', b: 'General-sum', rows: [['Payoff sum', '0 or fixed c', 'Varies'], ['Room for mutual gain', 'None', 'Possible'], ['Pure NE', 'Often none', 'Varies']], tip: 'Drug dealer is constant-sum (100 or 500).' },
  { title: 'Action vs strategy', a: 'Action', b: 'Strategy', rows: [['Definition', 'One move', 'Complete contingent plan'], ['Simultaneous game', 'Same thing', 'Same thing'], ['Tree', 'At one node', 'At every own information set']], tip: 'P1 has 4 strategies in the PYQ tree, not 3.' }
];

const TRAPS = [
  { trap: 'Reading the column player’s payoff as the first number in a cell.', fix: 'Row player first, always; label rows and columns before computing.', cs: ['normal-form'] },
  { trap: 'Calling a strategy strictly dominated when it ties in one column.', fix: 'Strict needs > everywhere; a tie means at most weak.', cs: ['dominance', 'iesds'] },
  { trap: 'Answering “which player HAS a dominated strategy” when the question asks which does NOT.', fix: 'Underline the negation in the stem.', cs: ['dominance'] },
  { trap: 'Forgetting the ½ for coin-toss ties in auctions.', fix: 'Tie payoff = ½(v − b) for each player.', cs: ['normal-form'] },
  { trap: 'Stopping IESDS after one round.', fix: 'Re-check both players after every deletion.', cs: ['iesds'] },
  { trap: 'Using a player’s own payoffs to compute her own mixing probability.', fix: 'Your mix makes the OTHER player indifferent.', cs: ['indifference'] },
  { trap: 'Reporting Pr(park) when Pr(street) was asked (“respectively”).', fix: 'Match the order in the stem; probabilities sum to 1.', cs: ['indifference'] },
  { trap: '“No pure NE” ⇒ “no NE”.', fix: 'Finite games always have a mixed NE (Nash).', cs: ['nash-existence'] },
  { trap: 'Reporting a deviator’s travel time (36) as the equilibrium time (32).', fix: 'Compute times at the equilibrium loads.', cs: ['braess'] },
  { trap: 'Forgetting that one car takes 6, so n cars take 6 + 3(n − 1).', fix: 'Tabulate link times for 1–4 cars first.', cs: ['braess'] },
  { trap: 'Imposing symmetry before differentiating.', fix: 'Derive the BR first, then set eᵢ = eⱼ.', cs: ['best-response', 'continuous-ne'] },
  { trap: 'Synergies payoff 2a² (forgets the cost term).', fix: '(a + a)a − a² = a².', cs: ['continuous-ne'] },
  { trap: 'Bertrand NE price 15.', fix: 'P = 5 + P/2 ⇒ P = 10.', cs: ['continuous-ne'] },
  { trap: 'Counting P1’s strategies as A, BE, BF (3).', fix: 'Specify an action at every own information set: AE, AF, BE, BF.', cs: ['ef-strategy'] },
  { trap: 'Missing NE in the tree’s normal form where P2 is indifferent.', fix: 'Underline all tied best responses.', cs: ['ef-to-nf'] },
  { trap: 'Choosing (AE, D) as SPE because it gives the same outcome as (AF, D).', fix: 'Check optimality at the unreached node.', cs: ['spe'] },
  { trap: 'Counting proper subgames only (2 instead of 3).', fix: 'The whole game is a subgame.', cs: ['subgame'] },
  { trap: 'Selecting only one correct option in an MSQ.', fix: 'MSQ: select every correct option (Hawk–Dove: two).', cs: ['classic-games'] }
];

const FLASHCARDS = [
  ...GLOSSARY.map((g, i) => ({ id: 'fg' + i, kind: 'Definition', week: g.week, front: R`<b>Define:</b> ${g.term}`, back: g.def + R`<div class="small muted">Intuition: ${g.intu}</div>` })),
  ...FORMULAS.map((f, i) => ({ id: 'ff' + i, kind: 'Formula', week: f.week, front: R`<b>Formula:</b> ${f.name}`, back: f.tex + R`<div class="small">${f.cond}</div>` })),
  ...[
    [1, 'Which axiom does a preference cycle violate?', 'Transitivity.'],
    [1, 'Inability to compare two goods violates…', 'Completeness.'],
    [1, 'Auction (3, 5): which player has no strictly dominated pure strategy?', 'Player 1 (Player 2’s bid 0 is dominated by bid 2).'],
    [1, 'Can a mixture of a and b strictly dominate both a and b?', 'No — an average cannot exceed both components.'],
    [2, 'IESDS survivor in every auction PYQ?', '(2, 2).'],
    [2, 'Hawk–Dove (10, 6, 4): outcomes that cannot be pure NE?', '(H,H) and (D,D).'],
    [2, 'Braess PYQ: equilibrium times before and after the new road?', '29.9/30 before; 32 for everyone after.'],
    [2, 'Synergies (−e²): NE effort and payoff?', 'e = a; payoff a².'],
    [2, 'Synergies (−2e²): BR and NE?', 'BR = (a + eⱼ)/4; e = a/3.'],
    [2, 'Bertrand q = 10 − Pᵢ + Pⱼ: BR and NE?', 'Pᵢ = 5 + Pⱼ/2; P = 10, profit 100.'],
    [3, 'Drug dealer (100): police probabilities (street, park)?', '5/13, 8/13.'],
    [3, 'Drug dealer (100): dealer probabilities (street, park)?', '6/13, 7/13.'],
    [3, 'Drug dealer (500): police street probability; dealer street probability?', '1/3; 1/2.'],
    [3, '2025 T3 2×2: p, q and 1/(p − q)?', 'p = 1/2, q = 3/8, value 8.'],
    [3, '2026 T2 2×2: pure NE and 1/(p − q)?', '(T,L), (B,R); p = 5/6, q = 1/3, value 2.'],
    [3, 'Bystander: Pr(not calling) formula?', '(C/V)^{1/(n−1)}.'],
    [4, 'PYQ tree: terminal nodes / information sets / subgames?', '4 / 3 / 3.'],
    [4, 'PYQ tree: strategies of P1 and P2?', '4 (AE, AF, BE, BF) and 2.'],
    [4, 'PYQ tree (2024–25 payoffs): # pure NE and SPE?', '3; (AF, D).'],
    [4, 'PYQ tree (2026 payoffs): # pure NE and SPE?', '4; (BE, C).'],
    [4, 'Entry game SPE?', '(E, A) — fighting is a non-credible threat.']
  ].map(([w, f, b], i) => ({ id: 'fq' + i, kind: 'Exam fact', week: w, front: f, back: b }))
];

const SHEETS = {
  1: R`<h2>Must-know</h2><ul><li>Game = interdependent payoffs; elements: players, actions/strategies, payoffs, timing, information.</li><li>Axioms: completeness (can compare), transitivity (no cycles). Coalitions: $2^n-1$ non-empty.</li><li>Notation $u_i(a_i,a_{-i})$; row payoff first.</li><li>Classification: static/dynamic × complete/incomplete; perfect info = singleton information sets.</li><li>PD: $T>R>P>S$; defect strictly dominant; outcome inefficient.</li><li>Strict dominance: > everywhere. Weak: ≥ everywhere, > somewhere. Dominant = dominates all others.</li><li>Check mixtures: a pure action may be dominated only by a mixture.</li><li>Equilibrium = no profitable unilateral deviation; ≠ efficiency.</li><li>Common knowledge = infinite hierarchy; needed for iterated reasoning.</li></ul><h2>PYQ pattern</h2><p>Auction “which player does not have a strictly dominated strategy” (4 papers): build the matrix with ½-ties; v=(3,5) → Player 1; v=(5,4) → Player 2.</p><h2>Traps</h2><ul><li>Ties kill strictness.</li><li>Negation in the stem.</li><li>Inspector Vinod is not a player.</li></ul>`,
  2: R`<h2>Must-know</h2><ul><li>Strategy = complete plan.</li><li>DSE ⊂ NE. SDSE unique.</li><li>IESDS: order-free, keeps every NE; unique survivor = unique NE. IEWDS: order-dependent, can delete NE.</li><li>NE: mutual best responses; underline method; continuous: solve FOCs simultaneously.</li><li>Classic games: PD (1 NE), BoS & Stag Hunt (2 pure + 1 mixed), Matching Pennies (mixed only), Hawk–Dove (2 asymmetric pure + 1 mixed).</li><li>Braess: equilibrium can worsen with extra capacity.</li><li>Hotelling: both at ½. Cournot: $q^*=(a-c)/3$.</li></ul><h2>PYQ numbers</h2><ul><li>Auction IESDS survivor: (2,2).</li><li>Hawk–Dove (10,6,4): (H,H), (D,D) cannot be NE.</li><li>Braess: before 2–2 (29.9/30); after 1–2–1 (32 each). Decoys: 28, 36, 2–1–1.</li><li>Synergies: BR $(a+e_j)/2$, NE $a$, payoff $a^2$; variant $(a+e_j)/4$, NE $a/3$.</li><li>Bertrand: BR $5+P_j/2$, NE $P=10$.</li><li>2026 2×2: two pure NE (T,L), (B,R).</li></ul>`,
  3: R`<h2>Must-know</h2><ul><li>Solution-concept nesting; NBR ⇔ dominated by a mixed strategy.</li><li>Constant-sum ≡ zero-sum strategically; often no pure NE.</li><li>Expected payoffs need cardinal utility; check only pure deviations.</li><li><b>Indifference:</b> my mix makes YOU indifferent. 2×2: $q^*=\frac{d-b}{(a-c)+(d-b)}$.</li><li>Generic 2×2: 1 or 3 NE. Nash: finite games always have an NE.</li><li>4×2 continuum: $q=2/3$, $3p+r=1$; B is NBR.</li><li>Bystander: $p^*=(C/V)^{1/(n-1)}$; Pr(report) ↓ to $1-C/V$.</li></ul><h2>PYQ numbers</h2><ul><li>Drug (100): police 5/13, 8/13; dealer 6/13, 7/13; no pure NE; unique NE.</li><li>Drug (500): police 1/3, 2/3; dealer 1/2.</li><li>2025 T3: p=1/2, q=3/8 → 8. 2026 T2: p=5/6, q=1/3 → 2.</li></ul>`,
  4: R`<h2>Must-know</h2><ul><li>Tree: root, decision nodes, terminal nodes (payoffs).</li><li>Information sets; perfect info = all singletons.</li><li>Strategies: product over own information sets.</li><li>Backward induction from last mover; record off-path choices.</li><li>Normal form of a tree may have extra NE (non-credible threats).</li><li>Subgame: starts at singleton info set, includes all successors, cuts no info set; whole game counts.</li><li>SPE: NE in every subgame.</li><li>Applications: entry deterrence, ultimatum, divide-and-choose, agenda setting, Stackelberg, burning bridges.</li></ul><h2>PYQ answers (tree)</h2><table class="t"><tr><th>Item</th><th>2024–25 payoffs</th><th>2026 payoffs</th></tr><tr><td>Information type</td><td>Perfect</td><td>Perfect</td></tr><tr><td>Terminal nodes</td><td>4</td><td>4</td></tr><tr><td>Information sets</td><td>3</td><td>3</td></tr><tr><td>Strategies P1 / P2</td><td>4 / 2</td><td>4 / 2</td></tr><tr><td>Pure NE</td><td>3</td><td>4</td></tr><tr><td>SPE</td><td>(AF, D)</td><td>(BE, C)</td></tr><tr><td>Subgames</td><td>3</td><td>3</td></tr></table><p>Entry game SPE: (E, A).</p>`
};

const INTEL = R`<h2>D · Recurring traps (from the PYQ decoys)</h2><ul><li>Swapped mixing probabilities (6/13, 7/13 offered for the police).</li><li>Deviation time offered as equilibrium time (36 vs 32); near-miss times (28).</li><li>Off-by-symmetry continuous answers (P = 15; payoff 2a²).</li><li>“Both / None” options: verify each statement separately.</li><li>Tree: (AE, D) vs (AF, D) — same outcome, different SPE status.</li></ul>
<h2>E · Structural patterns</h2><ul><li>Papers are built from <b>comprehension blocks</b>: one scenario, 2–8 sub-questions. A wrong formulation propagates to every sub-question.</li><li>Five recurring families: auction (dominance/IESDS), drug dealer (pure/mixed NE), Braess routing, continuous BR games (Synergies/Bertrand), A/B–C/D–E/F tree. Since 2025 T3 a 2×2 mixed-strategy block with a numeric $1/(p-q)$ item appears.</li><li>Numbers change between papers (values 3/5 → 5/4; 100 → 500 trades; payoffs of C/E in the tree; cost $e^2$ → $2e^2$); the method does not.</li></ul>
<h2>F · Priority classification (based on frequency and marks in the supplied papers — not a guarantee)</h2><table class="t"><tr><th>Priority</th><th>Concepts</th></tr><tr><td><span class="tag hi">High</span></td><td>Dominance & IESDS (auction); pure NE identification; indifference principle; Braess; continuous BR/NE; trees: strategies, information sets, NE of normal form, SPE, subgames.</td></tr><tr><td><span class="tag med">Medium</span></td><td>Classic games (Hawk–Dove), Nash existence/uniqueness statements, solution-concept relations, IEWDS, Cournot/Stackelberg, bystander model, NBR.</td></tr><tr><td><span class="tag sup">Supporting</span></td><td>Decision theory, preferences, classification, cooperative games, interpretations of NE and mixing, Hotelling.</td></tr></table>
<h2>G · Suggested study order</h2><ol><li>Week 2 dominance + NE (largest share), then the tree block (Week 4).</li><li>Mixed-strategy computations (Week 3).</li><li>Continuous games and Braess arithmetic.</li><li>Remaining Medium concepts; Supporting concepts last.</li></ol>`;

const NPYQ = QUESTIONS.filter(q => q.src === 'PYQ').length;
const SOURCES_HTML = R`<h2>Inventory and processing status</h2><table class="t"><tr><th>Resource</th><th>Type / priority</th><th>Status</th></tr>
<tr><td>q1 pyqs/ms4023_2024T2, 2024T3, 2025T2, 2025T3, 2026T2 (Quiz 1 papers)</td><td>Course material — highest priority</td><td>Fully processed. Text layer extracted; image-only stems/tables/keys read from rendered pages. ${NPYQ} game-theory items mapped. Non–game-theory sections in the same PDFs (Managerial Economics, Market Research) excluded.</td></tr>
<tr><td>gt quiz 1.pdf (personal Quiz-1 preparation guide, 70 pp.)</td><td>Personal notes</td><td>Processed; used for topic emphasis and cross-checks. Its annuity / production-theory items belong to Managerial Economics and are excluded.</td></tr>
<tr><td>NotebookLM lecture notes — Weeks 1, 3, 4 (.docx), Week 2 (.md)</td><td>Lecture notes (cross-checked, lower priority)</td><td>Processed; examples reused only after independent verification. Disagreements listed below.</td></tr>
<tr><td>Dixit, Skeath & Reiley, <i>Games of Strategy</i> (Ch. 2–5, 7)</td><td>Prescribed textbook</td><td>Used for definitions, classic games, continuous games and mixed strategies. Chapter references are given at chapter level only (no page numbers cited).</td></tr>
<tr><td>Gura & Maschler, <i>Insights into Game Theory</i></td><td>Supplementary</td><td>Cooperative / matching material — outside Quiz-1 scope except coalition basics.</td></tr>
<tr><td>Zip: Quiz1_PYP(_GAs).pdf</td><td>Duplicates of 2024 T2 + annotated graded assignments</td><td>OCR’d; assignment items reused and labelled ASSIGNMENT. Where the scan was illegible, answers are marked as independently derived.</td></tr>
<tr><td>Zip: Week1_withGA, week2_Notes_GAs_annotated, week4Notes, GT_Rev_Q1, subjective assignments</td><td>Scanned notes / assignments</td><td>OCR’d (Tesseract); hand-written annotations partly illegible. Used for coverage only where legible.</td></tr>
<tr><td>Zip: Assignment_1/2_IITGN (CS-329)</td><td>Different course</td><td>Out of scope — not used.</td></tr>
<tr><td>Zip: Narahari, <i>Game Theory and Mechanism Design</i>; <i>Algorithmic Game Theory</i></td><td>Supplementary texts</td><td>Consulted for standard definitions only.</td></tr></table>
<p class="small">Source hierarchy applied: course materials (papers, assignments) &gt; personal notes &gt; textbook &gt; NotebookLM notes &gt; general knowledge. No page numbers or timestamps are cited unless present in the sources.</p>`;

const DISCREPANCIES_HTML = R`<h2>Discrepancies found while cross-checking</h2><table class="t"><tr><th>Where</th><th>Issue</th><th>Resolution used here</th></tr>
<tr><td>NotebookLM W1 vs W2 (Braess)</td><td>W1 uses a 1-minute bridge (→ 81 min); W2 a zero-cost bridge (→ 80 min); segment labels differ.</td><td>Both share the 65-minute baseline; dashboard uses the zero-cost version and notes the variant. Quiz PYQs use a different network (4 drivers) — always use the question’s data.</td></tr>
<tr><td>NotebookLM W2 IESDS 3×3 example</td><td>Claims column C is <em>strictly</em> dominated by L, but they tie (0 = 0) against D.</td><td>Only weak dominance; the game is not solvable by strict dominance with those numbers.</td></tr>
<tr><td>NotebookLM W2 PD condition</td><td>Stated as “c &gt; a &gt; d &gt; b” in one place and “b &gt; a &gt; d &gt; c” in the derivation (labels inconsistent); “Weekly dominated” typo; Cournot diagram intercepts muddled.</td><td>Standard $T&gt;R&gt;P&gt;S$ used; Cournot derived afresh.</td></tr>
<tr><td>NotebookLM W3 War Game</td><td>After deleting weakly dominated C, omits that (D, C) is also a pure NE of the 2×2 residual (P2 indifferent 4 = 4).</td><td>Both (M, R) and (D, C) reported.</td></tr>
<tr><td>NotebookLM W3 support rule</td><td>States a mixture can never strictly dominate an action in its own support.</td><td>Correct version: it cannot dominate <em>all</em> actions in its support at once (it can dominate one if another support action dominates it).</td></tr>
<tr><td>NotebookLM W4 Example 12</td><td>Lists (dy, b) as an NE — P1 would deviate to Uy (3 &gt; 2).</td><td>NE: (Uy, b), (Dx, a), (Dy, a); SPE: (Dx, a), (Uy, b).</td></tr>
<tr><td>NotebookLM metadata</td><td>Faculty name appears as “Vikramaditya Data” — likely an extraction error.</td><td>Not used.</td></tr>
<tr><td>Personal guide</td><td>Contains Managerial-Economics items (annuities, production) labelled as Game Theory.</td><td>Excluded.</td></tr>
<tr><td>Quiz key convention (auction)</td><td>The “no strictly dominated strategy” player’s bid 0 is strictly dominated by a <em>mixed</em> strategy.</td><td>Key follows pure-strategy domination; nuance explained in each solution.</td></tr>
<tr><td>2025 T3 file</td><td>Page cut off: Q107 options missing, Q108 absent.</td><td>Q107 included with options reconstructed from identical items and marked “derived”; Q108 not included.</td></tr></table>`;

const QA_HTML = R`<h2>Implemented</h2><ul><li>Single self-contained HTML file; all CSS/JS embedded; no backend. Progress persists in <code>localStorage</code> (key <code>gtdash.v1</code>); reset with confirmation.</li><li>${CONCEPTS.length} concepts, each with the 10-part framework (intuition, why it matters, formal definition, mathematics, three graded worked examples, visual where meaningful, connections, misconceptions, exam perspective, interactive checkpoint).</li><li>${NPYQ} PYQ items mapped under their concepts with original wording, type, marks, key status, step-by-step solution, per-option analysis, traps and a labelled variation; searchable repository with week / concept / difficulty / category / paper filters.</li><li>Question engine: MCQ, MSQ, numeric (fractions accepted, tolerance), self-graded short answer; answers hidden until submission; retry.</li><li>Mocks (per week and cumulative), configurable count/difficulty/pool; score, solutions, topic performance, weaknesses and recommendations after submission.</li><li>Error notebook, Leitner spaced repetition (boxes due after 0, 0, 1, 3, 7, 15 days), revision mode, flashcards, glossary, formula and comparison handbooks, worked-problem library, weekly revision sheets, exam intelligence computed live.</li><li>Light/dark themes; responsive layout; MathJax 3 with a visible fallback notice if it cannot load (raw TeX remains readable).</li></ul>
<h2>Limitations (stated explicitly)</h2><ul><li>MathJax and Google Fonts load from CDNs; offline, formulas show as raw TeX and system fonts are used.</li><li>Mocks sample items one by one, round-robin across concepts; past-paper comprehension blocks are not kept together (each item shows its shared passage).</li><li>Short-answer items are self-assessed (no automatic grading of free text).</li><li>Error-notebook entries for MCQs infer the misconception from the chosen option’s explanation; they cannot read your reasoning.</li><li>Textbook references are chapter-level; no page numbers are cited.</li><li>Some PYQ stems were images; transcriptions are faithful but may differ in typography from the original.</li><li>2025 T3 Q108 is absent from the supplied file and is not included.</li></ul>`;
