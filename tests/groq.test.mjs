import test from 'node:test';
import assert from 'node:assert/strict';
import { callGroq } from '../lib/groq.ts';

test('Groq adapter handles configuration, success, quota, failures and truncation', async () => {
 const oldFetch = globalThis.fetch;
 const oldKey = process.env.GROQ_API_KEY;
 try {
  delete process.env.GROQ_API_KEY;
  await assert.rejects(callGroq('system','input'), {status:503});
  process.env.GROQ_API_KEY='test-placeholder';
  globalThis.fetch=async (url,options)=>{
   assert.equal(url,'https://api.groq.com/openai/v1/chat/completions');
   const payload=JSON.parse(options.body);
   assert.equal(payload.response_format.type,'json_object');
   return Response.json({choices:[{finish_reason:'stop',message:{content:'{"ok":true}'}}]});
  };
  assert.deepEqual(await callGroq('Return JSON','input'),{ok:true});
  for(const status of [429,401,500]) {
   globalThis.fetch=async()=>new Response('private provider error',{status});
   await assert.rejects(callGroq('system','input'), {status: status===429?429:503});
  }
  for(const [reason,content] of [['length','{}'],['stop','not json']]) {
   globalThis.fetch=async()=>Response.json({choices:[{finish_reason:reason,message:{content}}]});
   await assert.rejects(callGroq('system','input'), {status:502});
  }
  globalThis.fetch=async()=>{throw new Error('network failure');};
  await assert.rejects(callGroq('system','input'), {status:503});
 } finally {
  globalThis.fetch=oldFetch;
  if(oldKey===undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY=oldKey;
 }
});
