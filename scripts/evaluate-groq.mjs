// Explicit opt-in: this command consumes Groq quota. Never part of npm test/CI.
import fs from 'node:fs/promises';
import { callGroq } from '../lib/groq.ts';
import { validateScanResult } from '../lib/analysis/validate.ts';
import { SCANNER_SYSTEM_PROMPT } from '../lib/prompts.ts';
const cases=JSON.parse(await fs.readFile(new URL('../evaluation/smoke-cases.json',import.meta.url),'utf8'));
const requested=process.argv.slice(2);
for(const item of cases.filter(item=>!requested.length || requested.includes(item.id))) {
 const start=Date.now();
 try {
  const result=validateScanResult(await callGroq(SCANNER_SYSTEM_PROMPT,item.source,1800),item.source);
  const actual=[...new Set(result.flags.map(f=>f.category))].sort();
  const pass=JSON.stringify(actual)===JSON.stringify([...item.expectedCategories].sort());
  console.log(JSON.stringify({id:item.id,pass,actual,flags:result.totalFlags,elapsedMs:Date.now()-start}));
  if(!pass) process.exitCode=1;
 } catch(error) {
  console.log(JSON.stringify({id:item.id,pass:false,error:error.message}));
  process.exitCode=1;
  break; // Do not keep spending quota after an operational failure.
 }
}
