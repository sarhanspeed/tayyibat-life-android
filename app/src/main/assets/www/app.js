(() => {
'use strict';

const SEED = window.TAYYIBAT_SEED || {foods:[],meals:[],products:[]};
const FITNESS = window.TAYYIBAT_WORKOUTS || {exercises:[],programs:[]};
const KEY = 'tayyibatLifeStateV210';
const OLD_KEY = 'tayyibatLifeStateV2';
const VERSION = '2.1.0';
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const view = $('#view'), title = $('#pageTitle'), modalRoot = $('#modalRoot');

const text = {
  ar:{
    home:'الرئيسية',foods:'الأطعمة',meals:'الوجبات',workouts:'التمارين',more:'المزيد',
    scanner:'ماسح الوجبات',barcode:'ماسح الباركود',progress:'المتابعة',settings:'الإعدادات',profile:'الملف الشخصي',
    allowed:'مسموح',forbidden:'ممنوع',weekly:'أسبوعي',review:'يحتاج مراجعة',occasional:'أحيانًا',
    calories:'السعرات',protein:'بروتين',carbs:'كربوهيدرات',fat:'دهون',fiber:'ألياف',
    edit:'تعديل',save:'حفظ',cancel:'إلغاء',delete:'حذف',add:'إضافة',start:'ابدأ',finish:'إنهاء',
    log:'تسجيل',favorite:'المفضلة',history:'السجل',programs:'البرامج',exercises:'التمارين',
    language:'اللغة',theme:'المظهر',dark:'داكن',light:'فاتح',today:'اليوم',water:'المياه',
    weight:'الوزن',target:'الهدف',minutes:'دقيقة',sets:'جولات',reps:'تكرار',rest:'راحة',
    easy:'سهل',normal:'مناسب',hard:'صعب',done:'تم',next:'التالي',back:'رجوع'
  },
  en:{
    home:'Home',foods:'Foods',meals:'Meals',workouts:'Workouts',more:'More',
    scanner:'Meal Scanner',barcode:'Barcode Scanner',progress:'Progress',settings:'Settings',profile:'Profile',
    allowed:'Allowed',forbidden:'Forbidden',weekly:'Weekly',review:'Needs review',occasional:'Occasional',
    calories:'Calories',protein:'Protein',carbs:'Carbs',fat:'Fat',fiber:'Fiber',
    edit:'Edit',save:'Save',cancel:'Cancel',delete:'Delete',add:'Add',start:'Start',finish:'Finish',
    log:'Log',favorite:'Favorite',history:'History',programs:'Programs',exercises:'Exercises',
    language:'Language',theme:'Theme',dark:'Dark',light:'Light',today:'Today',water:'Water',
    weight:'Weight',target:'Target',minutes:'min',sets:'sets',reps:'reps',rest:'rest',
    easy:'Easy',normal:'Good',hard:'Hard',done:'Done',next:'Next',back:'Back'
  }
};

const defaultState = {
  settings:{language:'ar',dailyCalories:2000,theme:'light',workoutLevel:'beginner',workoutMinutes:15},
  profile:{name:'محمد',weight:92.4,target:80,height:175,age:35},
  foods:{}, meals:{}, products:{}, favorites:[],
  logs:[], weightLogs:[], water:{},
  workouts:{logs:[],customPrograms:[],feedback:{}}
};

function migrate(){
  let parsed = {};
  try { parsed = JSON.parse(localStorage.getItem(KEY)||localStorage.getItem(OLD_KEY)||'{}'); } catch(_){}
  const s = {
    ...structuredClone(defaultState),
    ...parsed,
    settings:{...defaultState.settings,...(parsed.settings||{})},
    profile:{...defaultState.profile,...(parsed.profile||{})},
    workouts:{...defaultState.workouts,...(parsed.workouts||{})}
  };
  s.favorites = Array.isArray(s.favorites)?s.favorites:[];
  s.logs = Array.isArray(s.logs)?s.logs:[];
  s.weightLogs = Array.isArray(s.weightLogs)?s.weightLogs:[];
  s.workouts.logs = Array.isArray(s.workouts.logs)?s.workouts.logs:[];
  s.workouts.customPrograms = Array.isArray(s.workouts.customPrograms)?s.workouts.customPrograms:[];
  return s;
}
let state = migrate();
let routeName='home', scanData='', activeWorkout=null, timerHandle=null, restHandle=null;

function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function ar(){return state.settings.language!=='en'}
function t(k){return (text[ar()?'ar':'en'][k]||k)}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function dayKey(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),x=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${x}`}
function uid(p='x'){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function round1(n){return Math.round(n*10)/10}
function name(x){return ar()?(x.ar||x.nameAr||x.name||x.en):(x.en||x.nameEn||x.name||x.ar)}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)}
function statusText(s){return t(s)||s}
function modal(html){modalRoot.innerHTML=`<div class="modal-backdrop"><div class="modal"><div class="modal-handle"></div>${html}</div></div>`;$$('[data-close]').forEach(x=>x.onclick=()=>modalRoot.innerHTML='')}
function applyLang(){
  document.documentElement.lang=ar()?'ar':'en'; document.documentElement.dir=ar()?'rtl':'ltr';
  document.body.classList.toggle('english',!ar()); document.body.classList.toggle('dark',state.settings.theme==='dark');
  $$('.nav-btn').forEach((b,i)=>{const keys=['home','foods','meals','workouts','more']; const x=b.querySelector('b'); if(x)x.textContent=t(keys[i])});
}
function navActive(){$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.route===routeName))}
function go(r){routeName=r;render();window.scrollTo(0,0)}
function bindGo(){$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go))}
function photo(x,cls='food-thumb'){return x.image?`<img class="${cls}" src="${x.image}" alt="">`:`<div class="${cls} photo-placeholder"><span>${x.emoji||'🍽️'}</span></div>`}
function foods(){return SEED.foods.map(f=>({...f,...(state.foods[f.id]||{})}))}
function meals(){const base=SEED.meals.map(m=>({...m,...(state.meals[m.id]||{})}));return base.concat(Object.values(state.meals).filter(m=>m.custom&&!SEED.meals.some(x=>x.id===m.id)))}
function products(){const p=[...(SEED.products||[])];Object.values(state.products||{}).forEach(x=>{if(!p.some(y=>y.barcode===x.barcode))p.push(x)});return p}
function food(id){return foods().find(x=>x.id===id)}
function exercise(id){return FITNESS.exercises.find(x=>x.id===id)}
function allPrograms(){return [...FITNESS.programs,...state.workouts.customPrograms]}
function program(id){return allPrograms().find(x=>x.id===id)}
function mealNutrition(m){
  return (m.ingredients||[]).reduce((a,i)=>{const f=food(i.foodId);if(!f)return a;const q=(Number(i.grams)||0)/100;
    a.cal+=(+f.calories||0)*q;a.p+=(+f.protein||0)*q;a.c+=(+f.carbs||0)*q;a.f+=(+f.fat||0)*q;a.fi+=(+f.fiber||0)*q;return a;
  },{cal:0,p:0,c:0,f:0,fi:0})
}
function todayMealCalories(){return state.logs.filter(x=>x.date===dayKey()&&x.type==='meal').reduce((s,x)=>s+(+x.calories||0),0)}
function todayWorkout(){const logs=state.workouts.logs.filter(x=>x.date===dayKey());return {count:logs.length,minutes:logs.reduce((s,x)=>s+(+x.minutes||0),0),cal:logs.reduce((s,x)=>s+(+x.calories||0),0)}}
function todayWater(){return Number(state.water[dayKey()]||0)}
function workoutStreak(){
  const days=new Set(state.workouts.logs.map(x=>x.date)); let d=new Date(),n=0;
  for(;;){const k=dayKey(d);if(days.has(k)){n++;d.setDate(d.getDate()-1)}else break} return n;
}
function estimateKcal(met,minutes,weight=state.profile.weight){return Math.max(0,met*3.5*(+weight||70)/200*Math.max(0,minutes))}
function programEstimate(p){
  let seconds=0, weighted=0;
  (p.items||[]).forEach(i=>{const e=exercise(i.exerciseId);if(!e)return;const sets=i.sets||e.sets||1;const active=e.mode==='time'?(i.seconds||e.seconds||30):(i.reps||e.reps||10)*3;seconds+=sets*active;weighted+=sets*active*(e.met||3);seconds+=Math.max(0,sets-1)*(e.rest||30)});
  const avgMet=seconds?weighted/Math.max(1,seconds):3.5;return {minutes:Math.max(1,Math.round(seconds/60)),cal:Math.round(estimateKcal(avgMet,seconds/60))}
}
function readImage(file,max=720,quality=.78){
  return new Promise((resolve,reject)=>{if(!file){resolve('');return}const r=new FileReader();r.onerror=reject;r.onload=()=>{const img=new Image();img.onerror=reject;img.onload=()=>{let w=img.width,h=img.height;const scale=Math.min(1,max/Math.max(w,h));w=Math.round(w*scale);h=Math.round(h*scale);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);resolve(c.toDataURL('image/jpeg',quality))};img.src=r.result};r.readAsDataURL(file)})
}

function renderHome(){
  const consumed=Math.round(todayMealCalories()), target=+state.settings.dailyCalories||2000, w=todayWorkout(), water=todayWater(), pct=clamp(consumed/target*100,0,100);
  view.innerHTML=`
    <section class="card hero">
      <div class="eyebrow">TAYYIBAT LIFE • v${VERSION}</div>
      <h2>${ar()?'أهلًا':'Hello'} ${esc(state.profile.name)}</h2>
      <p>${ar()?'غذاء وحركة يومية في مكان واحد':'Food and daily movement in one place'}</p>
      <div class="hero-stats"><div><strong>${consumed}</strong><small>${ar()?'كالوري مسجلة':'kcal logged'}</small></div><div><strong>${w.minutes}</strong><small>${ar()?'دقائق تمرين':'workout min'}</small></div><div><strong>${water}</strong><small>${ar()?'أكواب ماء':'cups water'}</small></div></div>
      <div class="progress"><i style="width:${pct}%"></i></div>
    </section>
    <div class="grid2">
      <div class="card metric"><strong>${Math.max(0,target-consumed)} kcal</strong><small>${ar()?'متبقي من هدف الطعام':'food target remaining'}</small></div>
      <div class="card metric"><strong>🔥 ${Math.round(w.cal)} kcal</strong><small>${ar()?'نشاط تقديري — لا يُخصم تلقائيًا':'estimated activity — not auto-deducted'}</small></div>
    </div>
    <h3 class="section-title">${ar()?'ابدأ بسرعة':'Quick start'}</h3>
    <div class="quick-grid">
      <button class="quick" data-go="scanner"><span>📷</span><b>${t('scanner')}</b><small>${ar()?'صوّر ثم راجع المكونات':'Scan then confirm ingredients'}</small></button>
      <button class="quick" id="hungryBtn"><span>🍽️</span><b>${ar()?'أنا جائع':'I am hungry'}</b><small>${ar()?'اختر وجبة مناسبة':'Pick a suitable meal'}</small></button>
      <button class="quick" data-go="workouts"><span>🏋️</span><b>${ar()?'تمرّن في البيت':'Home workout'}</b><small>${ar()?'بدون معدات أو بأدوات بسيطة':'No equipment or simple gear'}</small></button>
      <button class="quick" data-go="barcode"><span>▥</span><b>${t('barcode')}</b><small>${ar()?'منتجات وباركود':'Products & barcodes'}</small></button>
    </div>
    <section class="card">
      <div class="row between"><div><b>💧 ${ar()?'المياه اليوم':'Water today'}</b><div class="muted small">${water}/8</div></div><div class="row"><button class="btn ghost small" id="waterMinus">−</button><button class="btn primary small" id="waterPlus">+</button></div></div>
      <div class="progress dark" style="margin-top:10px"><i style="width:${clamp(water/8*100,0,100)}%"></i></div>
    </section>
    <section class="card">
      <div class="row between"><div><b>🔥 ${ar()?'سلسلة التمرين':'Workout streak'}</b><div class="muted small">${ar()?'أيام متتالية':'consecutive days'}</div></div><strong class="streak">${workoutStreak()}</strong></div>
    </section>`;
  bindGo();
  $('#waterPlus').onclick=()=>{state.water[dayKey()]=Math.min(30,todayWater()+1);save();renderHome()};
  $('#waterMinus').onclick=()=>{state.water[dayKey()]=Math.max(0,todayWater()-1);save();renderHome()};
  $('#hungryBtn').onclick=()=>suggestMeal();
}

function suggestMeal(){
  const remaining=Math.max(0,(+state.settings.dailyCalories||2000)-todayMealCalories());
  const choices=meals().map(m=>({m,n:mealNutrition(m)})).filter(x=>x.n.cal>0).sort((a,b)=>Math.abs(a.n.cal-remaining*.35)-Math.abs(b.n.cal-remaining*.35)).slice(0,3);
  modal(`<div class="row between"><h2>${ar()?'اقتراحات الآن':'Suggestions now'}</h2><button class="close-x" data-close>×</button></div>
  <p class="muted">${ar()?`المتبقي من هدف الطعام: ${Math.round(remaining)} kcal`:`Food target remaining: ${Math.round(remaining)} kcal`}</p>
  <div class="stack">${choices.map(x=>`<div class="card compact">${photo(x.m,'food-thumb')}<div class="grow"><b>${esc(name(x.m))}</b><div class="muted small">${Math.round(x.n.cal)} kcal</div></div><button class="btn primary small" data-log-suggest="${x.m.id}">${t('log')}</button></div>`).join('')}</div>`);
  $$('[data-log-suggest]').forEach(b=>b.onclick=()=>{logMeal(b.dataset.logSuggest);modalRoot.innerHTML='';renderHome()});
}

function renderFoods(){
  const favOnly=false;
  view.innerHTML=`<div class="row gap"><div class="searchbox grow"><span>🔎</span><input id="q" class="input" placeholder="${ar()?'ابحث عن الطعام':'Search food'}"></div><button id="favFilter" class="btn ghost">★</button></div><div id="foodList" class="list" style="margin-top:12px"></div>`;
  let onlyFav=favOnly;const list=$('#foodList'),q=$('#q');
  const draw=()=>{const s=q.value.trim().toLowerCase();list.innerHTML=foods().filter(f=>(!onlyFav||state.favorites.includes(f.id))&&name(f).toLowerCase().includes(s)).map(f=>`
    <button class="list-item food-card photo-card" data-food="${f.id}">
      ${photo(f)}<div><b>${esc(name(f))}</b><div class="food-meta">${f.calories??'—'} kcal / 100g • ${ar()?f.categoryAr:f.categoryEn}</div><span class="pill ${f.status}">${statusText(f.status)}</span></div>
      <span class="fav-star">${state.favorites.includes(f.id)?'★':'☆'}</span>
    </button>`).join('')||`<div class="card center">${ar()?'لا توجد نتائج':'No results'}</div>`;
    $$('[data-food]').forEach(b=>b.onclick=()=>foodDetails(b.dataset.food));
  };
  q.oninput=draw;$('#favFilter').onclick=()=>{onlyFav=!onlyFav;$('#favFilter').classList.toggle('primary',onlyFav);draw()};draw();
}
function foodDetails(id){
  const f=food(id), fav=state.favorites.includes(id);
  modal(`<div class="row between"><h2>${esc(name(f))}</h2><button class="close-x" data-close>×</button></div>
    ${photo(f,'detail-image')}
    <div class="grid2"><div class="metric"><strong>${f.calories??'—'}</strong><small>kcal /100g</small></div><div class="metric"><strong>${f.protein??'—'}g</strong><small>${t('protein')}</small></div><div class="metric"><strong>${f.carbs??'—'}g</strong><small>${t('carbs')}</small></div><div class="metric"><strong>${f.fat??'—'}g</strong><small>${t('fat')}</small></div></div>
    <p>${esc(ar()?f.reasonAr:f.reasonEn)}</p>
    <div class="row wrap"><button class="btn ${fav?'primary':'ghost'}" id="favToggle">★ ${t('favorite')}</button><label class="btn ghost">${ar()?'تغيير الصورة':'Change photo'}<input id="foodPhoto" type="file" accept="image/*" hidden></label></div>
    <div class="warning" style="margin-top:10px">${ar()?'تصنيف الطيبات والقيم التجريبية تحتاج اعتماد المصدر الرسمي قبل النشر العام.':'Tayyibat classifications and demo nutrition values need official source approval before public release.'}</div>`);
  $('#favToggle').onclick=()=>{state.favorites=fav?state.favorites.filter(x=>x!==id):[...state.favorites,id];save();modalRoot.innerHTML='';foodDetails(id)};
  $('#foodPhoto').onchange=async e=>{const img=await readImage(e.target.files[0]);state.foods[id]={...(state.foods[id]||{}),image:img};save();modalRoot.innerHTML='';foodDetails(id)};
}

function mealCard(m){const n=mealNutrition(m);return `<div class="card meal-card">${photo(m,'meal-image')}<div class="meal-body"><b>${esc(name(m))}</b><div class="macro-line"><span>${Math.round(n.cal)} kcal</span><span>P ${n.p.toFixed(1)}g</span><span>C ${n.c.toFixed(1)}g</span><span>F ${n.f.toFixed(1)}g</span></div><div class="row"><button class="btn secondary small" data-edit-meal="${m.id}">${t('edit')}</button><button class="btn primary small" data-log-meal="${m.id}">${t('log')}</button></div></div></div>`}
function renderMeals(){
  view.innerHTML=`<div class="row between"><h2>${t('meals')}</h2><button class="btn primary" id="newMeal">+ ${t('add')}</button></div><div class="meal-grid">${meals().map(mealCard).join('')}</div>`;
  $('#newMeal').onclick=()=>editMeal();$$('[data-edit-meal]').forEach(b=>b.onclick=()=>editMeal(b.dataset.editMeal));$$('[data-log-meal]').forEach(b=>b.onclick=()=>logMeal(b.dataset.logMeal));
}
function logMeal(id){
  const m=meals().find(x=>x.id===id);if(!m)return;const n=mealNutrition(m);state.logs.push({id:uid('l'),type:'meal',mealId:id,nameAr:m.nameAr||m.ar,nameEn:m.nameEn||m.en,date:dayKey(),time:new Date().toISOString(),calories:round1(n.cal),protein:round1(n.p),carbs:round1(n.c),fat:round1(n.f)});save();toast(ar()?'تم تسجيل الوجبة':'Meal logged');
}
function editMeal(id){
  let m=id?structuredClone(meals().find(x=>x.id===id)):{id:uid('m'),nameAr:'وجبة جديدة',nameEn:'New meal',emoji:'🍽️',custom:true,ingredients:[],image:''};
  function draw(){
    const n=mealNutrition(m);
    modal(`<div class="row between"><h2>${t('edit')}</h2><button class="close-x" data-close>×</button></div>
      ${photo(m,'detail-image')}<label class="btn ghost block">${ar()?'إضافة/تغيير صورة الوجبة':'Add/change meal photo'}<input id="mealPhoto" type="file" accept="image/*" hidden></label>
      <div class="grid2" style="margin-top:10px"><input id="mAr" class="input" value="${esc(m.nameAr||'')}" placeholder="اسم عربي"><input id="mEn" class="input" value="${esc(m.nameEn||'')}" placeholder="English name"></div>
      <h3>${ar()?'المكونات':'Ingredients'}</h3><div>${m.ingredients.map((i,k)=>`<div class="ingredient-row"><select data-fi="${k}">${foods().map(f=>`<option value="${f.id}" ${f.id===i.foodId?'selected':''}>${esc(name(f))}</option>`).join('')}</select><div class="gram-wrap"><input class="input" data-gr="${k}" type="number" min="0" value="${i.grams}"><span>g</span></div><button class="btn danger small" data-rm="${k}">×</button></div>`).join('')}</div>
      <button class="btn ghost block" id="addIng">+ ${ar()?'إضافة مكوّن':'Add ingredient'}</button>
      <div class="nutrition-total"><b>${Math.round(n.cal)} kcal</b><span>P ${n.p.toFixed(1)}g</span><span>C ${n.c.toFixed(1)}g</span><span>F ${n.f.toFixed(1)}g</span><span>Fiber ${n.fi.toFixed(1)}g</span></div>
      <div class="row" style="margin-top:10px"><button class="btn primary grow" id="saveMeal">${t('save')}</button><button class="btn secondary grow" id="saveLog">${t('save')} + ${t('log')}</button></div>`);
    const preserveNames=()=>{m.nameAr=$('#mAr').value;m.nameEn=$('#mEn').value};
    $$('[data-fi]').forEach(x=>x.onchange=()=>{preserveNames();m.ingredients[+x.dataset.fi].foodId=x.value;draw()});
    $$('[data-gr]').forEach(x=>x.onchange=()=>{preserveNames();m.ingredients[+x.dataset.gr].grams=Math.max(0,Number(x.value)||0);draw()});
    $$('[data-rm]').forEach(x=>x.onclick=()=>{preserveNames();m.ingredients.splice(+x.dataset.rm,1);draw()});
    $('#addIng').onclick=()=>{preserveNames();const f=foods()[0];if(f)m.ingredients.push({foodId:f.id,grams:100});draw()};
    $('#mealPhoto').onchange=async e=>{preserveNames();m.image=await readImage(e.target.files[0]);draw()};
    const persist=()=>{m.nameAr=$('#mAr').value.trim()||'وجبة';m.nameEn=$('#mEn').value.trim()||'Meal';m.custom=m.custom||!SEED.meals.some(x=>x.id===m.id);state.meals[m.id]=m;save()};
    $('#saveMeal').onclick=()=>{persist();modalRoot.innerHTML='';renderMeals();toast(ar()?'تم حفظ الوجبة':'Meal saved')};
    $('#saveLog').onclick=()=>{persist();logMeal(m.id);modalRoot.innerHTML='';renderMeals()};
  } draw();
}

function renderScanner(){
  view.innerHTML=`<section class="card"><h2>📷 ${t('scanner')}</h2><p class="muted">${ar()?'صوّر الوجبة أو اختر صورة. الذكاء المحلي يقترح Labels فقط؛ أنت تؤكد الطعام والجرامات قبل الاعتماد.':'Take or choose a meal photo. On-device AI suggests labels only; you confirm foods and grams.'}</p>
    <div class="row"><label class="btn ghost grow">${ar()?'اختيار صورة':'Choose photo'}<input id="scanFile" type="file" accept="image/*" hidden></label><button class="btn primary grow" id="cameraMeal">📷 ${ar()?'كاميرا':'Camera'}</button></div>
    <div id="scanPreview" style="margin-top:10px"></div><button class="btn primary block" id="scanBtn" disabled style="margin-top:10px">${ar()?'تحليل الصورة':'Analyze image'}</button><div id="scanResult" style="margin-top:12px"></div></section>`;
  $('#scanFile').onchange=async e=>{scanData=await readImage(e.target.files[0],960,.82);$('#scanPreview').innerHTML=`<img class="scan-preview" src="${scanData}">`;$('#scanBtn').disabled=false};
  $('#cameraMeal').onclick=()=>window.NativeBridge?.captureMealPhoto?window.NativeBridge.captureMealPhoto():toast(ar()?'الكاميرا تعمل داخل APK':'Camera works inside APK');
  $('#scanBtn').onclick=()=>{if(window.NativeBridge?.scanMealImageBase64){$('#scanResult').innerHTML='<div class="spinner"></div>';window.NativeBridge.scanMealImageBase64(scanData)}else toast(ar()?'التحليل المحلي يعمل داخل APK':'On-device scan works inside APK')};
}
window.onNativeCapturedMealPhoto=data=>{scanData=data;const p=$('#scanPreview'),b=$('#scanBtn');if(p)p.innerHTML=`<img class="scan-preview" src="${data}">`;if(b)b.disabled=false};
window.onNativeMealScan=res=>{
  const out=$('#scanResult');if(!out)return;if(!res?.ok){out.innerHTML=`<div class="danger-note">${esc(res?.error||'Scan failed')}</div>`;return}
  const labels=(res.labels||[]).slice(0,12);const matches=[];
  labels.forEach(l=>{const tx=String(l.text||'').toLowerCase();foods().forEach(f=>{if((f.aliases||[]).some(a=>tx.includes(String(a).toLowerCase())||String(a).toLowerCase().includes(tx))&&!matches.some(x=>x.id===f.id))matches.push(f)})});
  out.innerHTML=`<div class="card"><b>${ar()?'نتائج التعرف':'Detected labels'}</b><div class="label-cloud">${labels.map(x=>`<span class="label-chip">${esc(x.text)} <small>${Math.round((x.confidence||0)*100)}%</small></span>`).join('')}</div>
    ${matches.length?`<h3>${ar()?'أطعمة محتملة — راجعها':'Possible foods — review'}</h3>${matches.map(f=>`<button class="list-item food-card" data-scanfood="${f.id}">${photo(f)}<div><b>${esc(name(f))}</b><div class="muted small">${f.calories} kcal/100g</div></div><span>+</span></button>`).join('')}`:''}
    <div class="warning" style="margin-top:10px">${ar()?'لا يمكن معرفة وزن الطبق بدقة من صورة واحدة. افتح محرر وجبة وحدد الجرامات قبل تسجيل السعرات.':'A single photo cannot reliably determine portion weight. Use the meal editor to confirm grams before logging calories.'}</div>
    <button class="btn primary block" id="scanToMeal" style="margin-top:10px">${ar()?'إنشاء وجبة من النتائج':'Create meal from matches'}</button></div>`;
  $('#scanToMeal').onclick=()=>{const m={id:uid('m'),nameAr:'وجبة ممسوحة',nameEn:'Scanned meal',emoji:'📷',custom:true,image:scanData,ingredients:matches.slice(0,4).map(f=>({foodId:f.id,grams:100}))};state.meals[m.id]=m;save();editMeal(m.id)};
};

function renderBarcode(){
  view.innerHTML=`<section class="card"><h2>▥ ${t('barcode')}</h2><p class="muted">${ar()?'امسح الباركود بالكاميرا أو اكتبه يدويًا. المنتجات غير الموجودة يمكن إضافتها محليًا.':'Scan with the camera or enter a barcode manually. Unknown products can be added locally.'}</p>
    <button class="btn primary block" id="barcodeCamera">📷 ${ar()?'فتح كاميرا الباركود':'Open barcode camera'}</button>
    <div class="row" style="margin-top:10px"><input id="barcodeInput" class="input grow ltr" placeholder="EAN / UPC / Code 128"><button class="btn secondary" id="barcodeFind">${ar()?'بحث':'Find'}</button></div><div id="barcodeResult" style="margin-top:12px"></div></section>`;
  $('#barcodeCamera').onclick=()=>window.NativeBridge?.captureBarcodePhoto?window.NativeBridge.captureBarcodePhoto():toast(ar()?'المسح بالكاميرا يعمل داخل APK':'Camera scan works inside APK');
  $('#barcodeFind').onclick=()=>showBarcode($('#barcodeInput').value.trim());
}
window.onNativeBarcodeScan=res=>{if(!res?.ok){toast(res?.error||'Barcode scan failed');return}const input=$('#barcodeInput');if(input)input.value=res.value||'';showBarcode(res.value||'')};
function showBarcode(code){
  const out=$('#barcodeResult');if(!out||!code)return;const p=products().find(x=>String(x.barcode).trim()===String(code).trim());
  if(p){out.innerHTML=`<div class="card"><div class="row between"><div><b>${esc(p.nameAr||p.name||p.nameEn||code)}</b><div class="muted ltr">${esc(code)}</div></div><span class="pill ${p.status||'review'}">${statusText(p.status||'review')}</span></div><p>${esc(ar()?(p.reasonAr||p.ingredientsAr||''):(p.reasonEn||p.ingredientsEn||''))}</p></div>`;return}
  out.innerHTML=`<div class="warning">${ar()?'المنتج غير موجود في القاعدة الحالية. يمكنك حفظه للمراجعة.':'Product not found in the current database. You can save it for review.'}</div>
    <div class="card"><input id="newProdName" class="input" placeholder="${ar()?'اسم المنتج':'Product name'}"><input id="newProdCal" class="input" type="number" min="0" placeholder="kcal / 100g" style="margin-top:8px"><button class="btn primary block" id="saveProd" style="margin-top:8px">${ar()?'حفظ كمنتج يحتاج مراجعة':'Save as needs-review product'}</button></div>`;
  $('#saveProd').onclick=()=>{const x={barcode:code,nameAr:$('#newProdName').value||code,nameEn:$('#newProdName').value||code,calories:+$('#newProdCal').value||0,status:'review',reasonAr:'أُضيف بواسطة المستخدم ويحتاج مراجعة.',reasonEn:'User-added product; needs review.'};state.products[code]=x;save();showBarcode(code)};
}

function renderWorkouts(){
  const today=todayWorkout(), streak=workoutStreak();
  view.innerHTML=`<section class="card workout-hero"><div><div class="eyebrow">HOME FITNESS</div><h2>${ar()?'تمارين منزلية':'Home workouts'}</h2><p>${ar()?'اختَر برنامجًا أو أنشئ تمرين اليوم حسب وقتك ومستواك.':'Choose a plan or generate today’s workout for your time and level.'}</p></div><div class="workout-ring"><strong>${today.minutes}</strong><small>${t('minutes')}</small></div></section>
    <div class="grid3"><div class="metric"><strong>${today.count}</strong><small>${ar()?'جلسات اليوم':'sessions today'}</small></div><div class="metric"><strong>${Math.round(today.cal)}</strong><small>kcal est.</small></div><div class="metric"><strong>🔥${streak}</strong><small>${ar()?'سلسلة':'streak'}</small></div></div>
    <div class="row between"><h3 class="section-title">${t('programs')}</h3><button class="btn secondary small" id="smartWorkout">✨ ${ar()?'تمرين اليوم':'Today plan'}</button></div>
    <div class="program-grid">${allPrograms().map(p=>{const est=programEstimate(p);return `<button class="card program-card" data-program="${p.id}"><div class="program-emoji">${p.emoji||'🏋️'}</div><div><b>${esc(name(p))}</b><div class="muted small">${p.minutes||est.minutes} ${t('minutes')} • ~${est.cal} kcal</div><span class="pill ${p.level==='intermediate'?'weekly':'allowed'}">${p.level==='intermediate'?(ar()?'متوسط':'Intermediate'):(ar()?'مبتدئ':'Beginner')}</span></div><span class="chevron">${ar()?'‹':'›'}</span></button>`}).join('')}</div>
    <div class="row between"><h3 class="section-title">${t('exercises')}</h3><button class="btn ghost small" id="builderBtn">＋ ${ar()?'إنشاء برنامج':'Build plan'}</button></div>
    <div class="exercise-grid">${FITNESS.exercises.map(e=>`<button class="exercise-card" data-exercise="${e.id}"><div class="exercise-figure">${e.emoji}</div><div><b>${esc(name(e))}</b><small>${e.mode==='time'?`${e.seconds}s`:`${e.reps} ${t('reps')}`} • ${e.sets} ${t('sets')}</small></div></button>`).join('')}</div>
    <div class="warning">${ar()?'توقف عن التمرين عند ألم حاد أو دوخة أو ضيق نفس غير معتاد. إذا لديك مرض مزمن أو إصابة أو حمل فاستشر مختصًا قبل بدء برنامج جديد. السعرات المحروقة تقديرية.':'Stop for sharp pain, dizziness or unusual shortness of breath. If you have a chronic condition, injury or pregnancy, seek professional guidance before a new program. Burned calories are estimates.'}</div>`;
  $$('[data-program]').forEach(b=>b.onclick=()=>programDetails(b.dataset.program));
  $$('[data-exercise]').forEach(b=>b.onclick=()=>exerciseDetails(b.dataset.exercise));
  $('#smartWorkout').onclick=()=>smartWorkout();
  $('#builderBtn').onclick=()=>workoutBuilder();
}
function exerciseDetails(id){
  const e=exercise(id);modal(`<div class="row between"><h2>${e.emoji} ${esc(name(e))}</h2><button class="close-x" data-close>×</button></div><div class="exercise-demo">${e.emoji}</div>
    <div class="grid3"><div class="metric"><strong>${e.sets}</strong><small>${t('sets')}</small></div><div class="metric"><strong>${e.mode==='time'?e.seconds:e.reps}</strong><small>${e.mode==='time'?'sec':t('reps')}</small></div><div class="metric"><strong>${e.rest}s</strong><small>${t('rest')}</small></div></div>
    <h3>${ar()?'طريقة الأداء':'How to do it'}</h3><p>${esc(ar()?e.cueAr:e.cueEn)}</p><div class="warning">${esc(ar()?e.cautionAr:e.cautionEn)}</div>
    <button class="btn primary block" id="singleExercise" style="margin-top:10px">${t('start')}</button>`);
  $('#singleExercise').onclick=()=>startWorkout({id:uid('single'),ar:e.ar,en:e.en,emoji:e.emoji,level:e.level,items:[{exerciseId:e.id,sets:e.sets,reps:e.reps,seconds:e.seconds}]});
}
function programDetails(id){
  const p=program(id);const est=programEstimate(p);modal(`<div class="row between"><h2>${p.emoji||'🏋️'} ${esc(name(p))}</h2><button class="close-x" data-close>×</button></div>
    <div class="grid2"><div class="metric"><strong>${p.minutes||est.minutes} ${t('minutes')}</strong><small>${ar()?'المدة المتوقعة':'expected time'}</small></div><div class="metric"><strong>~${est.cal} kcal</strong><small>${ar()?'تقدير حسب وزنك':'estimate at your weight'}</small></div></div>
    <div class="stack">${(p.items||[]).map(i=>{const e=exercise(i.exerciseId);return `<div class="list-item compact"><span class="exercise-mini">${e?.emoji||'🏋️'}</span><div class="grow"><b>${esc(e?name(e):i.exerciseId)}</b><div class="muted small">${i.sets||e?.sets||1} ${t('sets')} × ${e?.mode==='time'?`${i.seconds||e.seconds}s`:`${i.reps||e?.reps||0} ${t('reps')}`}</div></div></div>`}).join('')}</div>
    <button class="btn primary block" id="startProgram">${t('start')}</button>`);
  $('#startProgram').onclick=()=>startWorkout(p);
}
function smartWorkout(){
  const level=state.settings.workoutLevel||'beginner', mins=+state.settings.workoutMinutes||15;
  const pool=FITNESS.exercises.filter(e=>level==='intermediate'||e.level==='beginner').filter(e=>e.area!=='mobility');
  const selected=[];['cardio','legs','upper','core','legs','core'].forEach(area=>{const opts=pool.filter(e=>e.area===area&&!selected.includes(e));if(opts.length)selected.push(opts[Math.floor(Math.random()*opts.length)])});
  selected.push(exercise('stretch'));const factor=mins<=10?1:mins<=20?2:3;
  const p={id:uid('smart'),ar:`تمرين اليوم — ${mins} دقيقة`,en:`Today workout — ${mins} min`,emoji:'✨',level,minutes:mins,items:selected.filter(Boolean).map(e=>({exerciseId:e.id,sets:e.id==='stretch'?1:factor,reps:e.reps,seconds:e.seconds}))};
  programDetailsTemp(p);
}
function programDetailsTemp(p){const backup=state.workouts.customPrograms;state.workouts.customPrograms=[...backup,p];programDetails(p.id);state.workouts.customPrograms=backup}
function workoutBuilder(){
  let selected=[];
  modal(`<div class="row between"><h2>${ar()?'إنشاء برنامج':'Build workout'}</h2><button class="close-x" data-close>×</button></div><input id="planName" class="input" placeholder="${ar()?'اسم البرنامج':'Program name'}">
    <div class="exercise-pick">${FITNESS.exercises.map(e=>`<label class="pick-row"><input type="checkbox" value="${e.id}"><span>${e.emoji} ${esc(name(e))}</span></label>`).join('')}</div>
    <button class="btn primary block" id="savePlan">${t('save')}</button>`);
  $('#savePlan').onclick=()=>{selected=$$('.pick-row input:checked').map(x=>x.value);if(!selected.length){toast(ar()?'اختر تمرينًا واحدًا على الأقل':'Choose at least one exercise');return}const nm=$('#planName').value.trim()||(ar()?'برنامجي':'My plan');const p={id:uid('cp'),ar:nm,en:nm,emoji:'⭐',level:state.settings.workoutLevel,minutes:state.settings.workoutMinutes,custom:true,items:selected.map(id=>{const e=exercise(id);return {exerciseId:id,sets:e.sets,reps:e.reps,seconds:e.seconds}})};state.workouts.customPrograms.push(p);save();modalRoot.innerHTML='';renderWorkouts();toast(ar()?'تم حفظ البرنامج':'Program saved')};
}
function startWorkout(p){
  if(timerHandle)clearInterval(timerHandle);if(restHandle)clearInterval(restHandle);
  activeWorkout={program:structuredClone(p),index:0,set:1,start:Date.now(),elapsed:0,completedSets:0,totalActiveSeconds:0};
  modalRoot.innerHTML='';renderActiveWorkout();timerHandle=setInterval(()=>{if(activeWorkout){activeWorkout.elapsed=Math.floor((Date.now()-activeWorkout.start)/1000);const el=$('#sessionClock');if(el)el.textContent=formatTime(activeWorkout.elapsed)}},1000);
}
function formatTime(s){return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function currentWorkoutItem(){return activeWorkout?.program?.items?.[activeWorkout.index]}
function renderActiveWorkout(){
  if(!activeWorkout){go('workouts');return}routeName='activeWorkout';applyLang();navActive();title.textContent=ar()?'التمرين الحالي':'Active workout';
  const item=currentWorkoutItem(),e=exercise(item.exerciseId),sets=item.sets||e.sets||1, val=e.mode==='time'?`${item.seconds||e.seconds}s`:`${item.reps||e.reps} ${t('reps')}`;
  const overall=activeWorkout.program.items.length?((activeWorkout.index+(activeWorkout.set-1)/sets)/activeWorkout.program.items.length*100):0;
  view.innerHTML=`<section class="card active-workout-card"><div class="row between"><span class="pill allowed">${activeWorkout.index+1}/${activeWorkout.program.items.length}</span><strong id="sessionClock">${formatTime(activeWorkout.elapsed)}</strong></div><div class="progress dark"><i style="width:${overall}%"></i></div>
    <div class="active-figure">${e.emoji}</div><h2>${esc(name(e))}</h2><p class="muted">${esc(ar()?e.cueAr:e.cueEn)}</p>
    <div class="set-target"><strong>${val}</strong><span>${ar()?`الجولة ${activeWorkout.set} من ${sets}`:`Set ${activeWorkout.set} of ${sets}`}</span></div>
    ${e.mode==='time'?`<button class="btn secondary block" id="timedSet">⏱️ ${ar()?'ابدأ عداد المجموعة':'Start set timer'} (${item.seconds||e.seconds}s)</button>`:''}
    <button class="btn primary block" id="completeSet" style="margin-top:10px">✓ ${ar()?'أنهيت المجموعة':'Set complete'}</button>
    <button class="btn ghost block" id="skipExercise" style="margin-top:8px">${ar()?'تخطي التمرين':'Skip exercise'}</button>
    <div class="warning" style="margin-top:12px">${esc(ar()?e.cautionAr:e.cautionEn)}</div></section>`;
  $('#completeSet').onclick=()=>completeSet(false);$('#skipExercise').onclick=()=>skipExercise();if($('#timedSet'))$('#timedSet').onclick=()=>timedSet(item.seconds||e.seconds);
}
function timedSet(seconds){
  const btn=$('#timedSet');let left=seconds;btn.disabled=true;btn.textContent=`⏱️ ${left}s`;
  const h=setInterval(()=>{left--;if(btn)btn.textContent=`⏱️ ${left}s`;if(left<=0){clearInterval(h);if(btn){btn.textContent=ar()?'انتهى الوقت ✓':'Time complete ✓';btn.disabled=false}}},1000);
}
function completeSet(){
  const item=currentWorkoutItem(),e=exercise(item.exerciseId),sets=item.sets||e.sets||1;activeWorkout.completedSets++;
  activeWorkout.totalActiveSeconds+=e.mode==='time'?(item.seconds||e.seconds||30):(item.reps||e.reps||10)*3;
  if(activeWorkout.set<sets){activeWorkout.set++;startRest(e.rest||30)}else{activeWorkout.index++;activeWorkout.set=1;if(activeWorkout.index>=activeWorkout.program.items.length)finishWorkout();else startRest(e.rest||20)}
}
function startRest(seconds){
  if(seconds<=0){renderActiveWorkout();return}let left=seconds;
  modal(`<div class="center"><div class="rest-circle">😮‍💨<strong id="restSec">${left}</strong><small>${t('rest')}</small></div><button class="btn primary block" id="skipRest">${ar()?'تخطي الراحة':'Skip rest'}</button></div>`);
  restHandle=setInterval(()=>{left--;const el=$('#restSec');if(el)el.textContent=left;if(left<=0){clearInterval(restHandle);modalRoot.innerHTML='';renderActiveWorkout()}},1000);
  $('#skipRest').onclick=()=>{clearInterval(restHandle);modalRoot.innerHTML='';renderActiveWorkout()};
}
function skipExercise(){activeWorkout.index++;activeWorkout.set=1;if(activeWorkout.index>=activeWorkout.program.items.length)finishWorkout();else renderActiveWorkout()}
function finishWorkout(){
  if(timerHandle)clearInterval(timerHandle);if(restHandle)clearInterval(restHandle);
  const sec=Math.max(30,Math.floor((Date.now()-activeWorkout.start)/1000)),mins=sec/60;
  let weighted=0,total=0;(activeWorkout.program.items||[]).forEach(i=>{const e=exercise(i.exerciseId);if(e){weighted+=(e.met||3);total++}});
  const met=total?weighted/total:3.5,kcal=estimateKcal(met,mins);
  const log={id:uid('w'),date:dayKey(),time:new Date().toISOString(),programId:activeWorkout.program.id,nameAr:activeWorkout.program.ar||activeWorkout.program.nameAr,nameEn:activeWorkout.program.en||activeWorkout.program.nameEn,minutes:round1(mins),calories:round1(kcal),sets:activeWorkout.completedSets};
  state.workouts.logs.push(log);save();activeWorkout=null;
  view.innerHTML=`<section class="card center"><div class="celebrate">🎉</div><h2>${ar()?'أحسنت!':'Workout complete!'}</h2><div class="grid3"><div class="metric"><strong>${log.minutes}</strong><small>${t('minutes')}</small></div><div class="metric"><strong>${Math.round(log.calories)}</strong><small>kcal est.</small></div><div class="metric"><strong>${log.sets}</strong><small>${t('sets')}</small></div></div><p class="muted">${ar()?'كيف كان مستوى التمرين؟':'How did it feel?'}</p><div class="row center-row"><button class="btn ghost feel" data-feel="easy">${t('easy')}</button><button class="btn ghost feel" data-feel="normal">${t('normal')}</button><button class="btn ghost feel" data-feel="hard">${t('hard')}</button></div><button class="btn primary block" id="doneWorkout" style="margin-top:14px">${t('done')}</button></section>`;
  $$('.feel').forEach(b=>b.onclick=()=>{state.workouts.feedback[log.id]=b.dataset.feel;save();$$('.feel').forEach(x=>x.classList.remove('primary'));b.classList.add('primary')});$('#doneWorkout').onclick=()=>go('workouts');
}

function renderProgress(){
  const wl=state.weightLogs.slice(-8), work7=state.workouts.logs.filter(x=>(Date.now()-new Date(x.time).getTime())<=7*86400000), meal7=state.logs.filter(x=>x.type==='meal'&&(Date.now()-new Date(x.time).getTime())<=7*86400000);
  view.innerHTML=`<section class="card"><h2>${t('progress')}</h2><div class="grid3"><div class="metric"><strong>${state.profile.weight} kg</strong><small>${t('weight')}</small></div><div class="metric"><strong>${work7.length}</strong><small>${ar()?'تمارين 7 أيام':'7-day workouts'}</small></div><div class="metric"><strong>${Math.round(work7.reduce((s,x)=>s+(+x.minutes||0),0))}</strong><small>${ar()?'دقائق 7 أيام':'7-day min'}</small></div></div></section>
    <section class="card"><div class="row between"><h3>${ar()?'تسجيل الوزن':'Weight log'}</h3><button class="btn primary small" id="addWeight">+ ${t('add')}</button></div><div class="weight-chart">${wl.length?wl.map((x,i)=>`<div class="weight-point"><i style="height:${clamp(30+(x.weight-Math.min(...wl.map(y=>y.weight)))*8,30,100)}px"></i><b>${x.weight}</b><small>${x.date.slice(5)}</small></div>`).join(''):`<div class="muted">${ar()?'لا يوجد سجل بعد':'No history yet'}</div>`}</div></section>
    <section class="card"><h3>${ar()?'آخر التمارين':'Recent workouts'}</h3><div class="list">${state.workouts.logs.slice(-8).reverse().map(x=>`<div class="list-item row between"><div><b>${esc(ar()?x.nameAr:x.nameEn)}</b><div class="muted small">${x.date}</div></div><span>${x.minutes} min • ${Math.round(x.calories)} kcal</span></div>`).join('')||'—'}</div></section>
    <section class="card"><h3>${ar()?'ملخص الطعام 7 أيام':'7-day food log'}</h3><div class="big-number">${Math.round(meal7.reduce((s,x)=>s+(+x.calories||0),0)/Math.max(1,new Set(meal7.map(x=>x.date)).size))}</div><div class="muted">${ar()?'متوسط السعرات في الأيام المسجلة':'average calories on logged days'}</div></section>`;
  $('#addWeight').onclick=()=>{modal(`<div class="row between"><h2>${ar()?'تسجيل الوزن':'Log weight'}</h2><button class="close-x" data-close>×</button></div><input id="newWeight" class="input" type="number" step="0.1" value="${state.profile.weight}"><button class="btn primary block" id="saveWeight" style="margin-top:10px">${t('save')}</button>`);$('#saveWeight').onclick=()=>{const w=+$('#newWeight').value;if(w>20&&w<400){state.profile.weight=w;state.weightLogs.push({date:dayKey(),weight:w});save();modalRoot.innerHTML='';renderProgress()}}};
}

function renderProfile(){
  view.innerHTML=`<section class="card"><h2>${t('profile')}</h2><label class="label">${ar()?'الاسم':'Name'}</label><input id="pn" class="input" value="${esc(state.profile.name)}">
    <div class="grid2" style="margin-top:10px"><div><label class="label">${t('weight')} kg</label><input id="pw" class="input" type="number" step="0.1" value="${state.profile.weight}"></div><div><label class="label">${t('target')} kg</label><input id="pt" class="input" type="number" step="0.1" value="${state.profile.target}"></div></div>
    <div class="grid2" style="margin-top:10px"><div><label class="label">${ar()?'الطول سم':'Height cm'}</label><input id="ph" class="input" type="number" value="${state.profile.height}"></div><div><label class="label">${ar()?'العمر':'Age'}</label><input id="pa" class="input" type="number" value="${state.profile.age}"></div></div>
    <button id="ps" class="btn primary block" style="margin-top:12px">${t('save')}</button></section>`;
  $('#ps').onclick=()=>{state.profile.name=$('#pn').value.trim()||state.profile.name;state.profile.weight=+$('#pw').value||state.profile.weight;state.profile.target=+$('#pt').value||state.profile.target;state.profile.height=+$('#ph').value||state.profile.height;state.profile.age=+$('#pa').value||state.profile.age;save();toast(ar()?'تم الحفظ':'Saved')};
}
function renderSettings(){
  view.innerHTML=`<section class="card"><h2>${t('settings')}</h2><label class="label">${t('language')}</label><div class="segmented"><button class="seg ${ar()?'active':''}" data-lang="ar">🇪🇬 العربية</button><button class="seg ${!ar()?'active':''}" data-lang="en">🇬🇧 English</button></div>
    <label class="label" style="margin-top:15px">${t('theme')}</label><div class="segmented"><button class="seg ${state.settings.theme==='light'?'active':''}" data-theme="light">☀️ ${t('light')}</button><button class="seg ${state.settings.theme==='dark'?'active':''}" data-theme="dark">🌙 ${t('dark')}</button></div>
    <label class="label" style="margin-top:15px">${ar()?'هدف السعرات اليومي':'Daily calorie target'}</label><input id="dailyCal" class="input" type="number" min="1000" max="6000" value="${state.settings.dailyCalories}">
    <h3>${ar()?'إعدادات التمرين':'Workout preferences'}</h3><label class="label">${ar()?'المستوى':'Level'}</label><select id="level"><option value="beginner" ${state.settings.workoutLevel==='beginner'?'selected':''}>${ar()?'مبتدئ':'Beginner'}</option><option value="intermediate" ${state.settings.workoutLevel==='intermediate'?'selected':''}>${ar()?'متوسط':'Intermediate'}</option></select>
    <label class="label" style="margin-top:10px">${ar()?'الوقت المفضل':'Preferred duration'}</label><select id="mins">${[10,15,20,30].map(x=>`<option value="${x}" ${+state.settings.workoutMinutes===x?'selected':''}>${x} ${t('minutes')}</option>`).join('')}</select>
    <button class="btn primary block" id="saveSettings" style="margin-top:12px">${t('save')}</button>
    <div class="warning" style="margin-top:12px">${ar()?'البيانات الصحية والتغذوية داخل هذه النسخة تبقى على الجهاز. قاعدة الطيبات الرسمية ما زالت تحتاج اعتماد ومراجعة مصادر قبل النشر التجاري.':'Health and nutrition data in this build stay on-device. The official Tayyibat database still needs source review before commercial release.'}</div></section>`;
  $$('[data-lang]').forEach(b=>b.onclick=()=>{state.settings.language=b.dataset.lang;save();applyLang();renderSettings()});
  $$('[data-theme]').forEach(b=>b.onclick=()=>{state.settings.theme=b.dataset.theme;save();applyLang();renderSettings()});
  $('#saveSettings').onclick=()=>{state.settings.dailyCalories=clamp(+$('#dailyCal').value||2000,1000,6000);state.settings.workoutLevel=$('#level').value;state.settings.workoutMinutes=+$('#mins').value;save();toast(ar()?'تم الحفظ':'Saved')};
}
function renderMore(){
  const items=[['scanner','📷',t('scanner')],['barcode','▥',t('barcode')],['progress','📊',t('progress')],['profile','👤',t('profile')],['settings','⚙️',t('settings')]];
  view.innerHTML=`<div class="list">${items.map(i=>`<button class="menu-row" data-go="${i[0]}"><div class="menu-icon">${i[1]}</div><b>${i[2]}</b><span class="chevron">${ar()?'‹':'›'}</span></button>`).join('')}</div><div class="card center"><div class="eyebrow">TAYYIBAT LIFE</div><b>v${VERSION}</b><p class="muted small">${ar()?'نسخة تطوير — الغذاء، مسح الوجبات والباركود، وتمارين منزلية.':'Development build — nutrition, meal/barcode scanning and home workouts.'}</p></div>`;
  bindGo();
}

function render(){
  applyLang();navActive();title.textContent=t(routeName);
  const routes={home:renderHome,foods:renderFoods,meals:renderMeals,workouts:renderWorkouts,scanner:renderScanner,barcode:renderBarcode,progress:renderProgress,profile:renderProfile,settings:renderSettings,more:renderMore,activeWorkout:renderActiveWorkout};
  (routes[routeName]||renderHome)();
}
$$('.nav-btn').forEach(b=>b.onclick=()=>go(b.dataset.route));
$('#profileQuickBtn').onclick=()=>go('profile');
applyLang();render();
})();