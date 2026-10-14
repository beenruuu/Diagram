/* Forma: progressive enhancements. No credentials, no backend. */
(()=>{'use strict';
const $=s=>document.querySelector(s);
const icon=()=>{if(window.lucide?.createIcons)window.lucide.createIcons()};
const workspace=$('.workspace'),inspector=$('.right'),left=$('.left');
const showInspector=()=>{workspace.classList.add('inspector-open');if(!$('#statementPanel').hidden)$('#statementPanel').hidden=true};
$('#inspectorClose').addEventListener('click',()=>workspace.classList.remove('inspector-open'));
const canvas=$('#canvas');
new MutationObserver(()=>{if($('#properties').querySelector('.empty-props')){workspace.classList.remove('inspector-open');return}showInspector();enhanceAttributes();icon()}).observe($('#properties'),{childList:true});
const advanced=$('#advancedBtn');
advanced.addEventListener('click',()=>{const on=left.classList.toggle('advanced-visible');advanced.setAttribute('aria-expanded',String(on));advanced.innerHTML='<i data-lucide="'+(on?'chevron-up':'chevrons-up-down')+'"></i> '+(on?'Menos elementos':'Más elementos');icon()});
const modal=(id,on)=>$(id).classList.toggle('show',on);
$('#helpBtn').addEventListener('click',()=>modal('#helpModal',true));
$('#closeHelp').addEventListener('click',()=>modal('#helpModal',false));
$('#helpModal').addEventListener('click',e=>{if(e.target.id==='helpModal')modal('#helpModal',false)});
$('#moodleBtn').addEventListener('click',()=>modal('#moodleModal',true));
$('#closeMoodle').addEventListener('click',()=>modal('#moodleModal',false));
$('#moodleModal').addEventListener('click',e=>{if(e.target.id==='moodleModal')modal('#moodleModal',false)});
$('#moodleExport').addEventListener('click',()=>{modal('#moodleModal',false);$('#exportBtn').click();const pdf=$('#exportMenu').querySelector('[data-export=pdf]');if(pdf)pdf.click()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){for(const id of ['#moodleModal','#helpModal'])modal(id,false);workspace.classList.remove('inspector-open');$('#statementPanel').hidden=true}});
/* Markdown is a local student note; sanitized output only, never interpolated into application UI. */
const key='forma-er-statement-v1',editor=$('#noteEditor'),preview=$('#notePreview'),panel=$('#statementPanel');
try{editor.value=localStorage.getItem(key)||''}catch{}
function renderBrief(){
  const raw=editor.value.trim();
  if(!raw){preview.replaceChildren();const p=document.createElement('p');p.className='empty-props';p.textContent='Pega aquí el enunciado de tu ejercicio para consultarlo mientras dibujas.';preview.appendChild(p);return}
  if(window.marked?.parse&&window.DOMPurify?.sanitize){const safe=window.DOMPurify.sanitize(window.marked.parse(raw,{breaks:true}),{USE_PROFILES:{html:true}});preview.innerHTML=safe;for(const a of preview.querySelectorAll('a')){a.setAttribute('target','_blank');a.setAttribute('rel','noopener noreferrer')}}
  else{preview.textContent=raw}
}
renderBrief();
let savedBrief=editor.value;
function persistBrief(){try{localStorage.setItem(key,editor.value)}catch{ /* storage denied: local-only until refresh */ }}
editor.addEventListener('input',()=>{savedBrief=editor.value;persistBrief()});
function tab(edit){editor.hidden=!edit;preview.hidden=edit;$('#noteEditTab').classList.toggle('active',edit);$('#notePreviewTab').classList.toggle('active',!edit);$('#noteEditTab').setAttribute('aria-pressed',String(edit));$('#notePreviewTab').setAttribute('aria-pressed',String(!edit));if(!edit)renderBrief()}
$('#noteEditTab').addEventListener('click',()=>tab(true));
$('#notePreviewTab').addEventListener('click',()=>tab(false));
$('#statementBtn').addEventListener('click',()=>{panel.hidden=!panel.hidden;if(!panel.hidden){workspace.classList.remove('inspector-open');renderBrief();if(!editor.value)tab(true)}});
$('#closeStatement').addEventListener('click',()=>panel.hidden=true);
/* Export notes in a versioned companion JSON, without modifying the existing ER data format. */
const importControl=$('#importFile');
const originalClick=$('#importBtn').onclick;
importControl.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file||file.size>1500000)return;try{const value=JSON.parse(await file.text());if(typeof value.statement==='string'&&value.statement.length<=50000){editor.value=value.statement;persistBrief();renderBrief()}}catch{/* Base editor reports invalid JSON */}});
/* Preserve note after downloading a project as an optional separate text file. Users can also export text in the panel. */
const btn=document.createElement('button');btn.type='button';btn.className='sheet-export';btn.innerHTML='<i data-lucide="copy"></i> Copiar enunciado';
btn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(editor.value);btn.lastChild.textContent=' Copiado'}catch{editor.focus();editor.select()}});panel.insertBefore(btn,panel.querySelector('.sheet-caption'));
/* Zoom about pointer (not centre), wheel without modifier, stop page scrolling; preserve scroll-space coordinate. */
const wrap=$('#canvasWrap'),zoomLabel=$('#zoomLabel');
function zoomTo(next,clientX,clientY){
  const old=Number(zoomLabel.textContent.replace('%',''))/100||.65;
  const target=Math.max(.2,Math.min(3,Math.round(next*1000)/1000));
  const bounds=wrap.getBoundingClientRect(),px=clientX-bounds.left,py=clientY-bounds.top;
  const worldX=(wrap.scrollLeft+px)/old,worldY=(wrap.scrollTop+py)/old;
  canvas.style.transform='scale('+target+')';zoomLabel.textContent=Math.round(target*100)+'%';
  wrap.scrollLeft=worldX*target-px;wrap.scrollTop=worldY*target-py;
  /* This updates the existing handler's private zoom variable via its own button steps? No:
     original code reads a closure-scoped zoom. Publish a synchronized setter in app.js. */
  window.FormaZoom?.setInternal?.(target);
}
wrap.addEventListener('wheel',e=>{if(e.target.closest('input,textarea,select'))return;e.preventDefault();const current=Number(zoomLabel.textContent.replace('%',''))/100||.65;zoomTo(current*Math.exp(-Math.sign(e.deltaY)*Math.min(Math.abs(e.deltaY),300)*.0018),e.clientX,e.clientY)},{passive:false});
$('#zoomIn').addEventListener('click',()=>{ /* native handler preserves zoom state */ });
document.addEventListener('keydown',e=>{if(e.key==='0'&&!e.ctrlKey&&!e.metaKey&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){$('#fitBtn').click()}});
/* Attribute variants from Chen: composite, multivalued, derived and optional. */
const attrKinds=[['simple','Simple'],['composite','Compuesto'],['multivalued','Multivaluado'],['derived','Derivado'],['optional','Opcional'],['partial-key','Clave parcial']];
const stateKey='forma-er-attribute-types-v1';
let types={};try{types=JSON.parse(localStorage.getItem(stateKey)||'{}')||{}}catch{}
let attributesEnhancing=false;
function enhanceAttributes(){
  if(attributesEnhancing)return;attributesEnhancing=true;
  try{const name=$('#propEntityName')?.value,fields=$('#properties').querySelector('.field-editor');if(!fields)return;
    const entityId=$('.node.selected')?.dataset.id;
    if(!entityId)return;
    const rows=[...fields.querySelectorAll('.field-edit')];
    for(const [i,row] of rows.entries()){
      if(row.querySelector('.field-kind'))continue;
      const fieldInput=row.querySelector('[data-fieldname]');if(!fieldInput)continue;
      const select=document.createElement('select');select.className='field-kind';select.setAttribute('aria-label','Tipo de atributo '+(i+1));
      for(const [value,label] of attrKinds){let opt=document.createElement('option');opt.value=value;opt.textContent=label;select.appendChild(opt)}
      const id=entityId+':'+i;select.value=types[id]||'simple';
      select.addEventListener('change',()=>{types[id]=select.value;try{localStorage.setItem(stateKey,JSON.stringify(types))}catch{};paintAttributeKinds()});
      const head=document.createElement('div');head.className='field-name-row';
      const pk=row.querySelector('.pk-toggle'),remove=row.querySelector('.remove');
      if(pk)head.appendChild(pk);head.appendChild(fieldInput);if(remove)head.appendChild(remove);
      const sql=row.querySelector('[data-fieldtype]');if(sql)sql.remove();
      row.append(head,select);
    }
    if(!fields.nextElementSibling?.classList?.contains('attr-help')){let help=document.createElement('p');help.className='attr-help';help.textContent='Chen: los atributos son óvalos. Elige una variante y arrastra el óvalo para colocarlo.';fields.after(help)}
    paintAttributeKinds();icon();
  }finally{attributesEnhancing=false}
}
function paintAttributeKinds(){document.querySelectorAll('.attribute[data-entity]').forEach(a=>{for(const [k] of attrKinds)if(k!=='simple')a.classList.remove(k);const value=types[a.dataset.entity+':'+a.dataset.field]||'simple';if(value!=='simple')a.classList.add(value)})}
new MutationObserver(()=>{paintAttributeKinds()}).observe(canvas,{childList:true,subtree:false});
paintAttributeKinds();icon();
})();