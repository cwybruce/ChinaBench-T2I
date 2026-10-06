const STATE_CLASS = {
  pending:'is-pending', pass:'is-pass', fail:'is-fail', skipped:'is-skipped', 'n/a':'is-na'
};

export function stateClass(state) { return STATE_CLASS[state] || STATE_CLASS.pending; }

function esc(v='') {
  return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function entityShape(e) {
  const x=Number(e.x ?? 50), y=Number(e.y ?? 50), color=e.color || '#51606f';
  const label=esc(e.label || e.id || 'entity');
  const common=`data-entity-id="${esc(e.id)}" class="scene-entity ${esc(e.kind || 'generic')}"`;
  if (e.kind === 'text_surface') {
    return `<g ${common}><rect x="${x-9}" y="${y-12}" width="18" height="24" rx="2" fill="${esc(color)}" stroke="#ffffff88"/><text x="${x}" y="${y+2}" text-anchor="middle" class="entity-text exact-text">${label}</text></g>`;
  }
  if (e.kind === 'animal' || e.kind === 'zodiac') {
    return `<g ${common}><ellipse cx="${x}" cy="${y+2}" rx="12" ry="9" fill="${esc(color)}"/><circle cx="${x-7}" cy="${y-7}" r="7" fill="${esc(color)}"/><circle cx="${x-10}" cy="${y-13}" r="3" fill="${esc(color)}"/><circle cx="${x-3}" cy="${y-13}" r="3" fill="${esc(color)}"/><path d="M ${x+10} ${y+1} Q ${x+18} ${y-5} ${x+18} ${y+3}" fill="none" stroke="${esc(color)}" stroke-width="3" stroke-linecap="round"/><text x="${x}" y="${y+24}" text-anchor="middle" class="entity-label">${label}</text></g>`;
  }
  if (e.kind === 'vehicle') {
    return `<g ${common}><rect x="${x-15}" y="${y-7}" width="30" height="12" rx="5" fill="${esc(color)}"/><path d="M ${x-9} ${y-7} L ${x-3} ${y-14} H ${x+8} L ${x+13} ${y-7} Z" fill="${esc(color)}"/><circle cx="${x-9}" cy="${y+7}" r="4" fill="#0a0d10" stroke="#8996a3"/><circle cx="${x+10}" cy="${y+7}" r="4" fill="#0a0d10" stroke="#8996a3"/><text x="${x}" y="${y+22}" text-anchor="middle" class="entity-label">${label}</text></g>`;
  }
  if (e.kind === 'prop' || e.kind === 'instrument' || e.kind === 'architecture') {
    return `<g ${common}><rect x="${x-12}" y="${y-10}" width="24" height="20" rx="6" fill="${esc(color)}" stroke="#ffffff55"/><text x="${x}" y="${y+2}" text-anchor="middle" class="entity-text">${label}</text></g>`;
  }
  return `<g ${common}><rect class="scene-fallback" x="${x-14}" y="${y-10}" width="28" height="20" rx="6" fill="#202833" stroke="#6f7e8d" stroke-dasharray="3 3"/><text x="${x}" y="${y+2}" text-anchor="middle" class="entity-text">${label}</text></g>`;
}

function genericEntities(caseData) {
  const rubric=caseData.rubric || [];
  const count=Math.max(rubric.length,1);
  return rubric.map((r,i)=>{
    const angle=(Math.PI*2*i/count)-Math.PI/2;
    return {id:`rubric-${r.id}`,kind:'generic',label:r.description,x:50+30*Math.cos(angle),y:50+31*Math.sin(angle)};
  });
}

function relationMarkup(rel, entityMap) {
  const a=entityMap.get(rel.from), b=entityMap.get(rel.to);
  if (!a || !b) return '';
  const x1=Number(a.x ?? 50), y1=Number(a.y ?? 50), x2=Number(b.x ?? 50), y2=Number(b.y ?? 50);
  const mx=(x1+x2)/2, my=(y1+y2)/2;
  return `<g data-relation-id="${esc(rel.id)}" class="scene-relation ${esc(rel.kind || 'relation')}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#arrow)"/><rect x="${mx-10}" y="${my-6}" width="20" height="10" rx="5" class="relation-label-bg"/><text x="${mx}" y="${my+1}" text-anchor="middle" class="relation-label">${esc(rel.label || rel.kind || '')}</text></g>`;
}

export function buildSceneSvg(caseData) {
  const scene=caseData.scene_spec || {};
  const entities=(scene.entities?.length ? scene.entities : genericEntities(caseData));
  const map=new Map(entities.map(e=>[e.id,e]));
  const relations=(scene.relations || []).map(r=>relationMarkup(r,map)).join('');
  const labels=(scene.labels || []).map(l=>`<text data-label-id="${esc(l.id)}" x="${Number(l.x ?? 50)}" y="${Number(l.y ?? 50)}" text-anchor="middle" class="scene-label">${esc(l.text)}</text>`).join('');
  return `<svg class="benchmark-scene" viewBox="0 0 100 100" role="img" aria-label="${esc(caseData.id)} ${esc(caseData.title)} test specification" preserveAspectRatio="xMidYMid meet"><defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor"/></marker></defs><rect width="100" height="100" rx="4" class="scene-bg"/>${relations}${entities.map(entityShape).join('')}${labels}</svg>`;
}

export function renderScene(container, caseData) {
  if (!container) throw new Error('renderScene requires a container');
  container.innerHTML=buildSceneSvg(caseData);
  const root=container.querySelector('svg');
  return {
    highlightNode(nodeId, state='pending') {
      const selector=`[data-rubric-id="${CSS?.escape ? CSS.escape(nodeId) : nodeId}"]`;
      const target=root?.querySelector(selector);
      if (target) target.setAttribute('data-state',state);
      container.setAttribute('data-active-node',nodeId);
      container.setAttribute('data-active-state',state);
    },
    clearHighlights() {
      container.removeAttribute('data-active-node');
      container.removeAttribute('data-active-state');
      root?.querySelectorAll('[data-state]').forEach(n=>n.removeAttribute('data-state'));
    },
    destroy() { container.innerHTML=''; }
  };
}
