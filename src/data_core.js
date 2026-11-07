/* Syllabus skeleton + registries */
const CONCEPTS = [], QUESTIONS = [];
const C = o => CONCEPTS.push(o);
const Q = o => { o.cs = o.cs || [o.cp]; o.src = o.src || 'NEW'; QUESTIONS.push(o); return o; };
const WEEKS = [
  { n: 1, short: 'Foundations', title: 'Introduction & General Principles', blurb: 'From single-person decisions to strategic interaction: what a game is, how to represent and classify it, dominance, the idea of equilibrium, and the assumptions (rationality, common knowledge) behind every later solution concept.',
    topics: [
      { title: '1.1 Decision-making foundations', cs: ['decision', 'prefs'] },
      { title: '1.2 What is a game?', cs: ['game-elements', 'normal-form'] },
      { title: '1.3 Classifying games', cs: ['classify', 'coop'] },
      { title: '1.4 Dominance', cs: ['pd', 'dominance', 'mixed-dom'] },
      { title: '1.5 Equilibrium & behavioural assumptions', cs: ['eq-intro', 'assumptions'] }] },
  { n: 2, short: 'Pure strategies', title: 'Simultaneous-Move Games I — Pure Strategies', blurb: 'Solving strategic-form games: dominant-strategy equilibria, iterated elimination (strict vs weak), best responses and Nash equilibrium, the classic 2×2 games, interpretations of equilibrium, and applications — Braess routing, Hotelling location, Cournot and continuous best-response games.',
    topics: [
      { title: '2.1 Strategies & dominance-based solutions', cs: ['action-strategy', 'dse', 'iesds', 'iewds'] },
      { title: '2.2 Nash equilibrium', cs: ['best-response', 'nash', 'classic-games', 'ne-interpret'] },
      { title: '2.3 Applications', cs: ['braess', 'hotelling', 'cournot', 'continuous-ne'] }] },
  { n: 3, short: 'Mixed strategies', title: 'Simultaneous-Move Games II — Mixed Strategies', blurb: 'How solution concepts relate, why some games have no pure equilibrium, mixed strategies and the indifference principle, best-response graphs, Nash’s existence theorem, domination by mixtures / never-a-best-response, the bystander model and interpretations of mixing.',
    topics: [
      { title: '3.1 Relations among solution concepts', cs: ['sol-relations'] },
      { title: '3.2 Mixed-strategy Nash equilibrium', cs: ['zero-sum', 'mixed-strategy', 'indifference', 'br-graph', 'nash-existence'] },
      { title: '3.3 Dominance by mixed strategies', cs: ['nbr'] },
      { title: '3.4 Applications & interpretation', cs: ['bystander', 'mixed-interpret'] }] },
  { n: 4, short: 'Sequential moves', title: 'Games with Sequential Moves (Extensive Form)', blurb: 'Game trees, information sets, strategies as complete plans, backward induction, converting trees to matrices, subgames, subgame-perfect equilibrium and credible threats, and the standard applications (entry, ultimatum, divide-and-choose, agenda setting, commitment).',
    topics: [
      { title: '4.1 Representing sequential games', cs: ['tree', 'info-sets', 'ef-strategy'] },
      { title: '4.2 Solving sequential games', cs: ['backward', 'ef-to-nf', 'subgame', 'spe'] },
      { title: '4.3 Applications', cs: ['ef-apps'] }] }
];
