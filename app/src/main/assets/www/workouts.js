// TAYYIBAT LIFE v2.1.0 — Home workout library.
// Calorie burn is an estimate using MET values, body weight and elapsed time.
// Exercise guidance is general fitness information, not medical treatment.
window.TAYYIBAT_WORKOUTS = {
  exercises: [
    {id:'march',ar:'المشي في المكان',en:'March in place',emoji:'🚶',area:'cardio',level:'beginner',equipment:'none',mode:'time',seconds:60,sets:2,rest:30,met:3.5,
      cueAr:'قف منتصبًا وارفع الركبتين بالتبادل بوتيرة مريحة.',cueEn:'Stand tall and alternate knee lifts at a comfortable pace.',cautionAr:'خفف السرعة إذا شعرت بدوخة أو ضيق نفس.',cautionEn:'Slow down if you feel dizzy or unusually short of breath.'},
    {id:'chair-squat',ar:'جلوس وقيام من الكرسي',en:'Chair sit-to-stand',emoji:'🪑',area:'legs',level:'beginner',equipment:'chair',mode:'reps',reps:10,sets:3,rest:45,met:4.0,
      cueAr:'المس الكرسي بخفة ثم قف بالضغط عبر القدمين.',cueEn:'Touch the chair lightly, then stand by driving through your feet.',cautionAr:'استخدم كرسيًا ثابتًا وتجنب النزول المؤلم للركبة.',cautionEn:'Use a stable chair and avoid painful knee depth.'},
    {id:'squat',ar:'سكوات',en:'Bodyweight squat',emoji:'🏋️',area:'legs',level:'intermediate',equipment:'none',mode:'reps',reps:12,sets:3,rest:45,met:5.0,
      cueAr:'اجعل الركبتين في اتجاه أصابع القدم وحافظ على الصدر مرفوعًا.',cueEn:'Track knees over toes and keep your chest tall.',cautionAr:'قلل المدى إذا ظهر ألم في الركبة أو الظهر.',cautionEn:'Reduce range if knee or back pain appears.'},
    {id:'wall-pushup',ar:'ضغط على الحائط',en:'Wall push-up',emoji:'🧱',area:'upper',level:'beginner',equipment:'wall',mode:'reps',reps:10,sets:3,rest:40,met:3.5,
      cueAr:'ثبت الجسم في خط واحد واقترب بالصدر من الحائط ثم ادفع.',cueEn:'Keep a straight body line, bring chest toward the wall, then press away.',cautionAr:'لا تحبس النفس.',cautionEn:'Do not hold your breath.'},
    {id:'incline-pushup',ar:'ضغط مائل',en:'Incline push-up',emoji:'💪',area:'upper',level:'intermediate',equipment:'chair',mode:'reps',reps:10,sets:3,rest:45,met:5.0,
      cueAr:'استخدم سطحًا ثابتًا وحافظ على الجسم مستقيمًا.',cueEn:'Use a stable surface and keep your body straight.',cautionAr:'تأكد أن السطح لا يتحرك.',cautionEn:'Make sure the surface cannot slide.'},
    {id:'glute-bridge',ar:'جسر الأرداف',en:'Glute bridge',emoji:'🌉',area:'legs',level:'beginner',equipment:'mat',mode:'reps',reps:12,sets:3,rest:40,met:3.8,
      cueAr:'اضغط بالكعبين وارفع الحوض دون تقويس أسفل الظهر.',cueEn:'Drive through heels and lift hips without over-arching your lower back.',cautionAr:'توقف إذا ظهر ألم حاد بأسفل الظهر.',cautionEn:'Stop if sharp low-back pain occurs.'},
    {id:'calf-raise',ar:'رفع السمانة',en:'Calf raise',emoji:'🦵',area:'legs',level:'beginner',equipment:'none',mode:'reps',reps:15,sets:3,rest:30,met:3.5,
      cueAr:'ارفع الكعبين ببطء ثم انزل بتحكم ويمكن الاستناد للحائط.',cueEn:'Rise onto your toes slowly and lower with control; use a wall for balance.',cautionAr:'استخدم دعمًا إذا كان التوازن غير ثابت.',cautionEn:'Use support if balance is uncertain.'},
    {id:'bird-dog',ar:'بيرد دوج',en:'Bird dog',emoji:'🐦',area:'core',level:'beginner',equipment:'mat',mode:'reps',reps:8,sets:3,rest:35,met:3.0,
      cueAr:'مد الذراع والرجل المتعاكسين مع ثبات الحوض.',cueEn:'Extend opposite arm and leg while keeping hips steady.',cautionAr:'اجعل الحركة قصيرة إذا كان الظهر حساسًا.',cautionEn:'Use a smaller range if your back is sensitive.'},
    {id:'dead-bug',ar:'ديد باج',en:'Dead bug',emoji:'🐞',area:'core',level:'beginner',equipment:'mat',mode:'reps',reps:8,sets:3,rest:35,met:3.0,
      cueAr:'ثبت أسفل الظهر وحرّك الأطراف ببطء بالتبادل.',cueEn:'Keep your lower back controlled and move opposite limbs slowly.',cautionAr:'لا تسمح للظهر بالتقوس إذا فقدت التحكم.',cautionEn:'Stop the range before your back arches.'},
    {id:'plank-knees',ar:'بلانك على الركبتين',en:'Knee plank',emoji:'🧘',area:'core',level:'beginner',equipment:'mat',mode:'time',seconds:20,sets:3,rest:40,met:3.3,
      cueAr:'شد البطن وحافظ على خط مستقيم من الرأس للركبتين.',cueEn:'Brace your core and keep a straight line from head to knees.',cautionAr:'توقف عند ألم الكتف أو الظهر.',cautionEn:'Stop for shoulder or back pain.'},
    {id:'plank',ar:'بلانك',en:'Plank',emoji:'⏱️',area:'core',level:'intermediate',equipment:'mat',mode:'time',seconds:30,sets:3,rest:45,met:4.0,
      cueAr:'شد البطن والأرداف وحافظ على الرقبة محايدة.',cueEn:'Brace core and glutes and keep your neck neutral.',cautionAr:'لا تستمر مع ألم حاد في الظهر أو الكتف.',cautionEn:'Do not continue through sharp back or shoulder pain.'},
    {id:'step-jack',ar:'ستيب جاك بدون قفز',en:'Low-impact step jack',emoji:'⭐',area:'cardio',level:'beginner',equipment:'none',mode:'time',seconds:45,sets:3,rest:30,met:4.5,
      cueAr:'خطوة جانبية مع رفع الذراعين بالتبادل بدون قفز.',cueEn:'Step side to side while raising arms, with no jumping.',cautionAr:'اجعل الخطوات أقصر إذا كان التوازن ضعيفًا.',cautionEn:'Use shorter steps if balance is limited.'},
    {id:'reverse-lunge-assist',ar:'لانج خلفي بمساعدة',en:'Assisted reverse lunge',emoji:'↩️',area:'legs',level:'intermediate',equipment:'chair',mode:'reps',reps:8,sets:3,rest:50,met:5.0,
      cueAr:'تمسك بكرسي ثابت وخذ خطوة للخلف ثم عد لوضع الوقوف.',cueEn:'Hold a stable chair, step back, lower with control, then return.',cautionAr:'يمكن استبداله بجلوس وقيام إذا كان يسبب ألمًا بالركبة.',cautionEn:'Replace with sit-to-stand if it causes knee pain.'},
    {id:'shoulder-tap-wall',ar:'لمس الكتف على الحائط',en:'Wall shoulder taps',emoji:'🤚',area:'upper',level:'beginner',equipment:'wall',mode:'reps',reps:12,sets:3,rest:35,met:3.2,
      cueAr:'ميل خفيف على الحائط والمس الكتف المقابل بالتبادل.',cueEn:'Lean lightly into the wall and alternate touching the opposite shoulder.',cautionAr:'قلل الميل إذا كان الرسغ أو الكتف حساسًا.',cautionEn:'Reduce the lean if wrists or shoulders are sensitive.'},
    {id:'superman',ar:'سوبرمان خفيف',en:'Gentle superman',emoji:'🦸',area:'back',level:'intermediate',equipment:'mat',mode:'reps',reps:8,sets:2,rest:40,met:3.0,
      cueAr:'ارفع الذراعين والصدر قليلًا فقط مع إبقاء الرقبة محايدة.',cueEn:'Lift arms and chest only slightly while keeping the neck neutral.',cautionAr:'تجنب التمرين إذا كان يفاقم ألم أسفل الظهر.',cautionEn:'Avoid this exercise if it worsens low-back pain.'},
    {id:'mobility-flow',ar:'مرونة وحركة للجسم',en:'Gentle mobility flow',emoji:'🧘',area:'mobility',level:'beginner',equipment:'none',mode:'time',seconds:120,sets:1,rest:20,met:2.5,
      cueAr:'حركات بطيئة للكتفين والورك والكاحل ضمن مدى مريح.',cueEn:'Move shoulders, hips and ankles slowly through a comfortable range.',cautionAr:'لا تجبر أي مفصل على مدى مؤلم.',cautionEn:'Never force a joint into a painful range.'},
    {id:'stretch',ar:'إطالات خفيفة',en:'Gentle stretching',emoji:'🤸',area:'mobility',level:'beginner',equipment:'none',mode:'time',seconds:180,sets:1,rest:0,met:2.3,
      cueAr:'تنفس بهدوء وثبت الإطالة دون ارتداد.',cueEn:'Breathe calmly and hold stretches without bouncing.',cautionAr:'الإطالة يجب أن تكون شدًا خفيفًا وليست ألمًا.',cautionEn:'Stretching should feel like mild tension, not pain.'}
  ],
  programs: [
    {id:'beginner10',ar:'بداية منزلية — 10 دقائق',en:'Home Starter — 10 min',emoji:'🌱',level:'beginner',minutes:10,items:[
      {exerciseId:'march',sets:1,seconds:60},{exerciseId:'chair-squat',sets:2,reps:8},{exerciseId:'wall-pushup',sets:2,reps:8},
      {exerciseId:'glute-bridge',sets:2,reps:10},{exerciseId:'bird-dog',sets:2,reps:6},{exerciseId:'stretch',sets:1,seconds:90}]},
    {id:'lowimpact15',ar:'حرق هادئ بدون قفز — 15 دقيقة',en:'Low-impact burn — 15 min',emoji:'🔥',level:'beginner',minutes:15,items:[
      {exerciseId:'march',sets:2,seconds:60},{exerciseId:'step-jack',sets:3,seconds:40},{exerciseId:'chair-squat',sets:3,reps:10},
      {exerciseId:'calf-raise',sets:2,reps:15},{exerciseId:'wall-pushup',sets:2,reps:10},{exerciseId:'stretch',sets:1,seconds:120}]},
    {id:'fullbody20',ar:'الجسم كامل — 20 دقيقة',en:'Full body — 20 min',emoji:'💪',level:'intermediate',minutes:20,items:[
      {exerciseId:'march',sets:1,seconds:90},{exerciseId:'squat',sets:3,reps:12},{exerciseId:'incline-pushup',sets:3,reps:10},
      {exerciseId:'glute-bridge',sets:3,reps:12},{exerciseId:'plank',sets:3,seconds:25},{exerciseId:'reverse-lunge-assist',sets:2,reps:8},
      {exerciseId:'stretch',sets:1,seconds:150}]},
    {id:'core15',ar:'تقوية البطن والوسط — 15 دقيقة',en:'Core control — 15 min',emoji:'🎯',level:'beginner',minutes:15,items:[
      {exerciseId:'march',sets:1,seconds:60},{exerciseId:'bird-dog',sets:3,reps:8},{exerciseId:'dead-bug',sets:3,reps:8},
      {exerciseId:'plank-knees',sets:3,seconds:20},{exerciseId:'glute-bridge',sets:2,reps:12},{exerciseId:'stretch',sets:1,seconds:120}]},
    {id:'mobility10',ar:'مرونة واستشفاء — 10 دقائق',en:'Mobility & recovery — 10 min',emoji:'🧘',level:'beginner',minutes:10,items:[
      {exerciseId:'march',sets:1,seconds:60},{exerciseId:'mobility-flow',sets:2,seconds:120},{exerciseId:'bird-dog',sets:2,reps:6},
      {exerciseId:'stretch',sets:1,seconds:180}]}
  ]
};