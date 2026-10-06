function normalizeResult(row){
  if(!row) return {state:'not_generated',total_score:null,result_image:null,atomic_scores:null};
  const reviewed=Number.isFinite(row.total_score)&&Array.isArray(row.atomic_scores)&&row.atomic_scores.every(x=>x&&typeof x.passed==='boolean');
  return {state:reviewed?'reviewed':'pending',total_score:reviewed?row.total_score:null,result_image:row.result_image??null,atomic_scores:reviewed?row.atomic_scores:null};
}
function defaultDeps(rubric){
  const negative=/不要|没有|无|不出现|总数|共/;
  let rootIndex=rubric.findIndex(r=>String(r.type||'').toUpperCase()==='C1'&&!negative.test(String(r.description||'')));
  if(rootIndex<0) rootIndex=rubric.findIndex(r=>String(r.type||'').toUpperCase()==='C2'&&!negative.test(String(r.description||'')));
  const root=rootIndex>=0?`q${rootIndex}`:null;
  return rubric.map((r,i)=>({id:`q${i}`,depends_on:(root&&i!==rootIndex&&!negative.test(String(r.description||'')))?[root]:[]}));
}
function defaultScene(item,rubric){
  const z=['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  const special={
    'CB-001':{kind:'explicit',entities:[{id:'m1',label:'灰色老鼠',type:'zodiac',x:24,y:58},{id:'m2',label:'白色老鼠',type:'zodiac',x:50,y:58},{id:'m3',label:'黑色老鼠',type:'zodiac',x:76,y:58},{id:'lantern',label:'红灯笼',type:'prop',x:50,y:32}],relations:[{id:'r1',from:'m2',to:'lantern',label:'双手提'}],texts:[],rubric_nodes:rubric.map(x=>x.id)},
    'CB-007':{kind:'explicit',entities:[{id:'rabbit1',label:'左侧白兔',type:'zodiac',x:25,y:56},{id:'teapot',label:'青花瓷茶壶',type:'prop',x:38,y:45},{id:'cup',label:'红色茶杯',type:'prop',x:48,y:66},{id:'rabbit2',label:'右侧灰兔',type:'zodiac',x:75,y:56},{id:'tray',label:'木托盘',type:'prop',x:63,y:66}],relations:[{id:'r1',from:'rabbit1',to:'cup',label:'倒茶'},{id:'r2',from:'rabbit2',to:'tray',label:'持托盘'}],texts:[],rubric_nodes:rubric.map(x=>x.id)},
    'CB-022':{kind:'explicit',entities:[{id:'dog',label:'黄狗',type:'zodiac',x:32,y:58},{id:'paper',label:'正方形红纸',type:'text-surface',x:66,y:56}],relations:[{id:'r1',from:'dog',to:'paper',label:'毛笔书写'}],texts:[{id:'t1',text:'春',x:66,y:56}],rubric_nodes:rubric.map(x=>x.id)},
    'CB-A05':{kind:'explicit',entities:z.map((label,i)=>({id:`z${i+1}`,label,type:'zodiac',x:50+34*Math.cos((i/12)*Math.PI*2),y:50+34*Math.sin((i/12)*Math.PI*2)})),relations:[{id:'ring',from:'z1',to:'z12',label:'完整圆环'}],texts:[],rubric_nodes:rubric.map(x=>x.id)},
    'CB-A06':{kind:'explicit',entities:[{id:'gate',label:'中式宅院大门',type:'architecture',x:50,y:52}],relations:[],texts:[{id:'t1',text:'春风入户',x:68,y:48},{id:'t2',text:'喜气盈门',x:32,y:48},{id:'t3',text:'万事如意',x:50,y:20}],rubric_nodes:rubric.map(x=>x.id)}
  };
  return special[item.id]||{kind:'generic',entities:[{id:'subject',label:item.title||item.id,type:'case'}],relations:[],texts:[],rubric_nodes:rubric.map(x=>x.id)};
}
export function buildViewerData({core=[],anchors=[],run={results:[]}}){
  const resultMap=new Map((run.results||[]).map(x=>[x.test_id,x]));
  return [...core,...anchors].map(item=>{
    const rubric=(item.rubric||[]).map((r,i)=>({...r,id:`q${i}`}));
    return {id:item.id,title:item.title||item.id,suite:item.suite||(String(item.id).includes('A')?'anchor':'core'),zodiac:item.zodiac||'',difficulty:item.difficulty??null,capabilities:item.capabilities||[],prompt:item.prompt_cn||item.prompt||'',rubric,evaluation_graph:defaultDeps(rubric),scene_spec:defaultScene(item,rubric),result:normalizeResult(resultMap.get(item.id))};
  });
}
export function validateViewerCases(cases){
  const errors=[],ids=new Set();
  for(const c of cases){
    if(ids.has(c.id)) errors.push(`duplicate id ${c.id}`); ids.add(c.id);
    const sum=(c.rubric||[]).reduce((s,x)=>s+Number(x.points||0),0); if(Math.abs(sum-10)>1e-9) errors.push(`${c.id}: rubric sum ${sum}`);
    const nodeIds=new Set((c.evaluation_graph||[]).map(x=>x.id)); const adj=new Map((c.evaluation_graph||[]).map(x=>[x.id,x.depends_on||[]]));
    for(const [id,deps] of adj) for(const d of deps) if(!nodeIds.has(d)) errors.push(`${c.id}: missing dependency ${d} for ${id}`);
    const visiting=new Set(),done=new Set(); const dfs=id=>{if(visiting.has(id))return true;if(done.has(id))return false;visiting.add(id);for(const d of(adj.get(id)||[]))if(dfs(d))return true;visiting.delete(id);done.add(id);return false}; for(const id of nodeIds) if(dfs(id)){errors.push(`${c.id}: dependency cycle`);break;}
  }
  return {ok:errors.length===0,errors};
}
