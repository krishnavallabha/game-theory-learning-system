const fs=require('fs'),path=require('path'),vm=require('vm');
// Validates all course content (ids, answer keys, concept fields, PYQ variations).
// Usage: node scripts/check.js   — exits 1 if any error is found.
const D=process.argv[2]||path.join(__dirname,'..','src');
const weeks=fs.readdirSync(D).filter(f=>/^data_w\d+\.js$/.test(f)).sort((a,b)=>parseInt(a.slice(6))-parseInt(b.slice(6)));
const src=['helpers.js','data_core.js',...weeks,'data_pyq.js','data_extra.js'].map(f=>fs.readFileSync(path.join(D,f),'utf8')).join('\n');
const ctx={console};vm.createContext(ctx);
vm.runInContext(src+'\n;this.CONCEPTS=CONCEPTS;this.QUESTIONS=QUESTIONS;this.WEEKS=WEEKS;this.GLOSSARY=GLOSSARY;this.FORMULAS=FORMULAS;this.FLASHCARDS=FLASHCARDS;',ctx);
const {CONCEPTS,QUESTIONS,WEEKS,GLOSSARY,FORMULAS,FLASHCARDS}=ctx;
const CON={};CONCEPTS.forEach(c=>{if(CON[c.id])console.log('DUP concept',c.id);CON[c.id]=c});
const ord=[];WEEKS.forEach(w=>w.topics.forEach(t=>t.cs.forEach(id=>{if(!CON[id])console.log('missing concept',id);ord.push(id)})));
const ids={};let errs=0;const E=(...a)=>{errs++;console.log(...a)};
QUESTIONS.forEach(q=>{if(ids[q.id])E('DUP q',q.id);ids[q.id]=1;
 (q.cs||[]).forEach(c=>{if(!CON[c])E('bad cs',q.id,c)});
 if(q.cp&&!CON[q.cp])E('bad cp',q.id);
 if(q.type==='mcq'){if(!q.opts||!(q.ans>=0&&q.ans<q.opts.length))E('bad mcq ans',q.id);if(q.why&&q.why.length!==q.opts.length)E('why len',q.id,q.why.length,q.opts.length)}
 if(q.type==='msq'){if(!Array.isArray(q.ans)||q.ans.some(a=>a>=q.opts.length))E('bad msq',q.id);if(q.why&&q.why.length!==q.opts.length)E('why len',q.id)}
 if(q.type==='num'&&typeof q.ans!=='number')E('bad num',q.id);
 if(!q.sol)E('no sol',q.id);if(!q.diff||!q.cat)E('no diff/cat',q.id);
 if(q.week==null)E('no week',q.id);
 if(q.varOf){[].concat(q.varOf).forEach(v=>{if(!ids[v]&&!QUESTIONS.some(x=>x.id===v))E('bad varOf',q.id,v)}); if(![].concat(q.varOf).length)E('empty varOf',q.id)}
 const s=JSON.stringify(q);if(/undefined|NaN/.test(s.replace(/"[a-z]+":undefined/g,'')))E('undef text',q.id);
});
const req=['intu','why','formal','math','ex','conn','mis','exam'];
CONCEPTS.forEach(c=>{req.forEach(k=>{if(!c[k])E('concept missing',c.id,k)});if(c.ex.length!==3)E('ex count',c.id);
 const cps=QUESTIONS.filter(q=>q.cp===c.id);if(cps.length<3)E('few cps',c.id,cps.length);if(!cps.some(q=>q.type==='short'))E('no short cp',c.id);
 if(/undefined|NaN/.test(Object.values(c).join(' ')))E('undef in concept',c.id)});
const P=QUESTIONS.filter(q=>q.src==='PYQ');const by={};P.forEach(q=>by[q.paper]=(by[q.paper]||0)+1);
const V=QUESTIONS.filter(q=>q.src==='VAR');const pv=new Set(V.flatMap(v=>[].concat(v.varOf)));
console.log('concepts',CONCEPTS.length,'questions',QUESTIONS.length,'PYQ',P.length,by,'VAR',V.length,'PYQ w/o var',P.filter(q=>!pv.has(q.id)).map(q=>q.id).join(','));
console.log('src counts',QUESTIONS.reduce((m,q)=>(m[q.src]=(m[q.src]||0)+1,m),{}),'glossary',GLOSSARY.length,'formulas',FORMULAS.length,'cards',FLASHCARDS.length,'errors',errs);
process.exitCode=errs?1:0;
