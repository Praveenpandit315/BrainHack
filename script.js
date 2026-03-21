// STATE
var isDark=true, medicines=[], analysisHistory=[], recognition=null, isListening=false, scanFile=null, leafletMap=null, lastResult=null, hospMarkers=[];

// TIPS DATA
var ALL_TIPS=[
  {icon:"&#128167;",title:"Stay Hydrated",body:"Drink at least 8 glasses of water daily for optimal kidney function and energy.",prog:60,label:"6/8 glasses today",color:"#38bdf8",tod:"Start your morning with 2 full glasses of warm water before any food."},
  {icon:"&#127939;",title:"Daily Exercise",body:"30 minutes of moderate exercise daily boosts immunity, mood and cardiovascular health.",prog:45,label:"14/30 min today",color:"#4ade80",tod:"A 10-min brisk walk after every meal aids digestion and burns calories."},
  {icon:"&#127769;",title:"Quality Sleep",body:"7 to 9 hours of sleep allows full cellular repair, memory and cognitive restoration.",prog:80,label:"6.5 hours last night",color:"#a78bfa",tod:"Dim your lights 1 hour before bed and avoid screens for deeper sleep."},
  {icon:"&#129367;",title:"Balanced Diet",body:"Include leafy vegetables, lean proteins and whole grains in every meal.",prog:70,label:"Good intake today",color:"#fb923c",tod:"Replace one processed snack with a handful of nuts or fresh fruit today."},
  {icon:"&#129505;",title:"Mindfulness",body:"10 minutes of meditation reduces cortisol levels and anxiety significantly.",prog:55,label:"5/10 minutes today",color:"#f472b6",tod:"Close your eyes and take 10 deep belly breaths right now to reset your mind."},
  {icon:"&#9728;&#65039;",title:"Sun Exposure",body:"15 minutes of morning sunlight boosts Vitamin D and regulates your sleep cycle.",prog:90,label:"Done today",color:"#fbbf24",tod:"Get outside between 8 and 10 AM for the best Vitamin D without UV damage."},
  {icon:"&#129754;",title:"Deep Breathing",body:"Practice 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s to calm your nervous system.",prog:40,label:"2/5 sessions done",color:"#34d399",tod:"Box breathing: 4 counts in, 4 hold, 4 out, 4 hold. Repeat 4 times now."},
  {icon:"&#129309;",title:"Social Wellness",body:"Strong social connections reduce mortality risk by up to 50 percent.",prog:65,label:"Connected today",color:"#60a5fa",tod:"Send a kind message to 3 people you care about today."},
  {icon:"&#129381;",title:"Herbal Wellness",body:"Tulsi, ginger and turmeric tea boosts immunity and fights inflammation.",prog:50,label:"1 cup today",color:"#6ee7b7",tod:"Brew ginger-tulsi tea with a pinch of turmeric and honey every morning."},
  {icon:"&#129504;",title:"Brain Health",body:"Reading, puzzles and learning new skills build neural pathways and delay decline.",prog:60,label:"30 min learning",color:"#c084fc",tod:"Spend 15 minutes doing a crossword, Sudoku or learning one new word today."},
  {icon:"&#129463;",title:"Oral Health",body:"Brush twice, floss daily. Oral bacteria directly affect heart health and immunity.",prog:75,label:"Morning done",color:"#fb7185",tod:"Oil-pull with coconut oil for 5 minutes to reduce harmful oral bacteria."},
  {icon:"&#127869;&#65039;",title:"Mindful Eating",body:"Chew slowly and eat without screens. Your brain needs 20 minutes to register fullness.",prog:65,label:"Improving",color:"#fdba74",tod:"Put your fork down between bites and chew 20 times per mouthful."}
];

// RISK DATA
var RISK_DATA=[
  {label:"Cardiovascular Health",status:"Low Risk",badge:"badge-ok",icon:"OK",note:"Heart health indicators are excellent. Keep exercising regularly."},
  {label:"Diabetes Risk",status:"Moderate",badge:"badge-warn",icon:"WARN",note:"Blood sugar slightly elevated. Reduce refined sugar and white rice intake."},
  {label:"Blood Pressure",status:"Normal",badge:"badge-ok",icon:"OK",note:"Readings within healthy range 120/80 mmHg."},
  {label:"Vitamin D Levels",status:"Monitor",badge:"badge-info",icon:"INFO",note:"Slightly low. Take 15 min morning sunlight plus Vitamin D3 supplement."},
  {label:"Stress Level",status:"High",badge:"badge-alert",icon:"HIGH",note:"Chronic stress detected. Practice mindfulness and reduce workload."}
];

// AI ANALYSIS POOL
var AI_POOL=[
  {cond:"Common Cold / Viral Infection",severity:"Low",advice:["Rest for 2 to 3 days","Drink warm fluids: ginger tea, soup, ORS","Paracetamol 500mg for fever (consult doctor first)","Steam inhalation 2 to 3 times daily","Avoid cold foods and beverages"],consult:"See a doctor if symptoms worsen beyond 5 days or breathing difficulty occurs."},
  {cond:"Influenza (Flu)",severity:"Moderate",advice:["Strict bed rest - do not go to work or school","Oral Rehydration Solution every hour","Antiviral medication if within 48 hours of onset","Wear mask to prevent spreading to others","Monitor temperature every 4 hours"],consult:"Go to emergency if temperature exceeds 104F or breathing becomes difficult."},
  {cond:"Tension Headache / Stress",severity:"Low",advice:["Apply cold or warm compress to forehead","Stay well hydrated throughout the day","Reduce screen exposure and bright light","Practice progressive muscle relaxation","Ibuprofen if persistent (consult pharmacist)"],consult:"If headache is sudden and severe - go to emergency immediately to rule out stroke."},
  {cond:"Acute Gastroenteritis",severity:"Moderate",advice:["BRAT diet: Banana, Rice, Applesauce, Toast","Oral Rehydration Solution every 15 minutes","Avoid dairy, spicy and fried foods for 48 hours","Probiotics to restore gut flora","Strict hand hygiene - condition is contagious"],consult:"Seek care if vomiting persists over 24 hours or signs of severe dehydration appear."},
  {cond:"Fatigue / Possible Anaemia",severity:"Low",advice:["Eat iron-rich foods: spinach, lentils, pomegranate","Take Vitamin C to enhance iron absorption","Ensure 8 hours of quality sleep each night","Hydrate well - dehydration causes fatigue","Get a CBC blood test to check Haemoglobin"],consult:"Consult a doctor if Haemoglobin is below 12 g/dL on blood test."},
  {cond:"Allergic Reaction / Rhinitis",severity:"Low",advice:["Identify and avoid the trigger allergen","Cetirizine 10mg antihistamine once daily","Keep windows closed during high pollen days","Use an air purifier in your bedroom","Nasal saline spray for congestion relief"],consult:"Seek emergency care immediately if throat swells or breathing becomes difficult."}
];

// INIT
window.onload = function() {
  loadProfile();
  renderTips();
  renderRisk();
  loadMedicines();
  loadHistory();
  setupReveal();
  spawnParticles();
  setTipDate();
  checkMedReminders();
  dpInit();
};

// PROFILE
function loadProfile() {
  try {
    var d = JSON.parse(localStorage.getItem('careai_profile') || '{}');
    var ph = localStorage.getItem('careai_photo');
    if (ph) {
      document.getElementById('navAvatar').src = ph;
      document.getElementById('navAvatar').classList.remove('hidden');
      document.getElementById('navAvatarFb').classList.add('hidden');
    }
    var fn = (d.fname || '').charAt(0).toUpperCase();
    var ln = (d.lname || '').charAt(0).toUpperCase();
    document.getElementById('navInit').textContent = (fn + ln) || 'P';
  } catch(e) {}
}

// TIPS
function setTipDate() {
  document.getElementById('tipDate').textContent = new Date().toLocaleDateString('en-IN', {weekday:'short',day:'numeric',month:'short'});
}

function renderTips() {
  var g = document.getElementById('tipsGrid');
  var today = new Date().getDate();
  var copy = ALL_TIPS.slice();
  copy.sort(function(a,b) {
    var ha = (a.title.charCodeAt(0) * today) % 100;
    var hb = (b.title.charCodeAt(0) * today) % 100;
    return ha - hb;
  });
  var show = copy.slice(0, 6);
  var html = '';
  for (var i = 0; i < show.length; i++) {
    var t = show[i];
    html += '<div class="card p-5" style="animation:slideup ' + (.4 + i * .08) + 's ease forwards">' +
      '<div class="flex items-start gap-4">' +
      '<div class="tip-icon dark:bg-gray-800 bg-gray-100" style="box-shadow:0 0 18px ' + t.color + '44">' +
      '<span>' + t.icon + '</span></div>' +
      '<div class="flex-1">' +
      '<h3 class="font-bold text-base mb-1">' + t.title + '</h3>' +
      '<p class="text-xs font-semibold opacity-60 mb-3 leading-relaxed">' + t.body + '</p>' +
      '<div class="prog-track"><div class="prog-fill" id="tp' + i + '" style="width:0;background:linear-gradient(90deg,' + t.color + ',' + t.color + '99)"></div></div>' +
      '<p class="text-[11px] font-bold mt-1.5 opacity-50">' + t.label + '</p>' +
      '</div></div></div>';
  }
  g.innerHTML = html;
  // Animate bars after render
  setTimeout(function() {
    for (var i = 0; i < show.length; i++) {
      var el = document.getElementById('tp' + i);
      if (el) el.style.width = show[i].prog + '%';
    }
  }, 300);
  // Tip of day
  var tod = ALL_TIPS[(today + 3) % ALL_TIPS.length];
  document.getElementById('tipBannerIcon').innerHTML = tod.icon;
  document.getElementById('tipBannerText').textContent = tod.tod;
}

function shuffleTips() {
  for (var i = ALL_TIPS.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = ALL_TIPS[i]; ALL_TIPS[i] = ALL_TIPS[j]; ALL_TIPS[j] = tmp;
  }
  renderTips();
  showToast('Tips refreshed!');
}

// RISK
function renderRisk() {
  var html = '';
  for (var i = 0; i < RISK_DATA.length; i++) {
    var r = RISK_DATA[i];
    html += '<div class="hist-item">' +
      '<div class="flex items-center justify-between mb-1 flex-wrap gap-2">' +
      '<span class="font-bold text-sm">' + r.label + '</span>' +
      '<span class="badge ' + r.badge + '">' + r.status + '</span></div>' +
      '<p class="text-xs opacity-60 font-semibold">' + r.note + '</p></div>';
  }
  document.getElementById('riskList').innerHTML = html;
}

// SYMPTOMS
function toggleChip(el) { el.classList.toggle('on'); }

function handleDrop(e) {
  e.preventDefault();
  var file = e.dataTransfer.files[0];
  if (file && file.type.indexOf('image') === 0) processScanFile(file);
}

function handleScanImage(e) { processScanFile(e.target.files[0]); }

function processScanFile(file) {
  if (!file) return;
  scanFile = file;
  var r = new FileReader();
  r.onload = function(ev) {
    var img = document.getElementById('scanPreview');
    img.src = ev.target.result;
    img.classList.remove('hidden');
    document.getElementById('dropIcon').innerHTML = '&#10003;';
    document.getElementById('dropLabel').textContent = file.name + ' ready';
    showToast('Image loaded - click Analyze!');
  };
  r.readAsDataURL(file);
}

// ── FULL DISEASE DATABASE (works 100% offline, no API key needed) ──
var DISEASE_DB = [
  {
    keywords:['fever','temperature','hot','bukhar','101','102','103'],
    cond:'Viral Fever', severity:'Moderate',
    description:'A common viral infection causing elevated body temperature, usually resolving in 3-5 days with proper rest and care.',
    advice:['Rest completely — avoid work/school until fever breaks','Take Paracetamol every 6 hours to reduce temperature','Drink at least 3-4 litres of fluids daily (ORS, coconut water, soup)','Apply cold wet cloth on forehead to lower temperature','Monitor temperature every 4 hours; do not cover with heavy blankets'],
    medicines:[
      {name:'Dolo 650 / Crocin 650',dosage:'650mg every 6 hrs (max 4 doses/day)',purpose:'Reduces fever and relieves body pain',type:'OTC'},
      {name:'Combiflam',dosage:'1 tablet every 8 hrs after food',purpose:'Anti-inflammatory for fever with body ache',type:'OTC'},
      {name:'Electral / ORS Sachet',dosage:'1 sachet in 1L water, sip throughout day',purpose:'Prevents dehydration from fever sweating',type:'OTC'},
      {name:'Limcee Vitamin C 500mg',dosage:'1 tablet daily',purpose:'Boosts immunity during viral illness',type:'OTC'}
    ],
    doctor_urgency:'Soon',
    doctor_reason:'See a doctor within 24-48 hrs if fever exceeds 103F, lasts more than 3 days, or is accompanied by rash or breathing difficulty.',
    warning_signs:['Fever above 104F (40C)','Seizures or confusion','Difficulty breathing','Rash spreading rapidly','No urination for 8+ hours']
  },
  {
    keywords:['headache','head pain','sir dard','migraine','temple pain'],
    cond:'Tension Headache / Migraine', severity:'Low',
    description:'Pain in the head caused by muscle tension, stress, dehydration, or screen overuse. Migraine may cause throbbing pain with nausea.',
    advice:['Lie in a dark quiet room and rest','Apply cold pack on forehead or warm compress on neck','Drink 2 glasses of water immediately — dehydration is a common trigger','Reduce screen exposure and bright light','Practice deep breathing or progressive muscle relaxation'],
    medicines:[
      {name:'Saridon',dosage:'1-2 tablets when needed (max 2/day)',purpose:'Fast headache relief with paracetamol and caffeine',type:'OTC'},
      {name:'Combiflam / Sumo',dosage:'1 tablet every 8 hrs after food',purpose:'Pain relief for tension headache',type:'OTC'},
      {name:'Cafergot (for migraine)',dosage:'1 tablet at migraine onset — consult doctor',purpose:'Migraine-specific relief',type:'Prescription'},
      {name:'Stemetil 5mg',dosage:'5mg tablet if nausea present',purpose:'Controls migraine-related nausea and dizziness',type:'Prescription'}
    ],
    doctor_urgency:'Routine',
    doctor_reason:'Visit a neurologist if headaches occur more than 4 times/week or are not relieved by OTC medicines.',
    warning_signs:['Sudden worst headache of your life','Headache with stiff neck and fever','Vision loss or double vision','Weakness or numbness on one side','Headache after head injury']
  },
  {
    keywords:['cough','khansi','cold','runny nose','sore throat','throat pain','sneezing','nasal'],
    cond:'Common Cold / Upper Respiratory Infection', severity:'Low',
    description:'A viral infection of the upper respiratory tract causing cough, congestion, runny nose and mild throat discomfort.',
    advice:['Gargle with warm saltwater 3-4 times daily for throat relief','Steam inhalation with Vicks/Eucalyptus oil twice a day','Drink warm ginger-tulsi-honey tea to soothe throat','Avoid cold drinks and ice cream during recovery','Rest voice — avoid talking loudly if throat is sore'],
    medicines:[
      {name:'Sinarest / D-Cold Total',dosage:'1 tablet every 6-8 hrs after food',purpose:'Relieves cold, congestion and runny nose',type:'OTC'},
      {name:'Benadryl Cough Syrup',dosage:'10ml every 6 hrs (adults)',purpose:'Suppresses cough and soothes throat',type:'OTC'},
      {name:'Strepsils Lozenges',dosage:'1 lozenge every 3-4 hrs',purpose:'Soothes sore throat and fights infection',type:'OTC'},
      {name:'Nasivion Nasal Drops',dosage:'2 drops per nostril twice daily (max 3 days)',purpose:'Relieves nasal congestion',type:'OTC'},
      {name:'Azithral 500 (Azithromycin)',dosage:'500mg once daily for 3 days',purpose:'Only if bacterial throat infection is confirmed',type:'Prescription'}
    ],
    doctor_urgency:'Routine',
    doctor_reason:'See a doctor if symptoms persist beyond 7 days, fever develops, or throat becomes very swollen.',
    warning_signs:['Difficulty swallowing or breathing','High fever with cold symptoms','Ear pain developing','Wheezing or chest tightness']
  },
  {
    keywords:['vomiting','nausea','ulti','stomach pain','gastro','food poison','loose motion','diarrhea','diarrhoea'],
    cond:'Acute Gastroenteritis / Food Poisoning', severity:'Moderate',
    description:'Inflammation of the stomach and intestines caused by viral or bacterial infection, often from contaminated food or water.',
    advice:['Stay on BRAT diet: Banana, Rice, Applesauce, Toast for 24 hrs','Sip ORS every 15 minutes — do not gulp large amounts','Avoid dairy, spicy, fried or oily foods for 48-72 hrs','Rest and avoid strenuous activity','Wash hands strictly before eating and after toilet'],
    medicines:[
      {name:'Electral / ORS (WHO formula)',dosage:'1 sachet per litre water, sip every 15 mins',purpose:'Prevents dangerous dehydration',type:'OTC'},
      {name:'Ondem / Zofer (Ondansetron 4mg)',dosage:'4mg tablet every 8 hrs for vomiting',purpose:'Stops nausea and vomiting',type:'OTC'},
      {name:'Norflox-TZ',dosage:'1 tablet twice daily after food for 3-5 days',purpose:'Antibiotic for bacterial gastroenteritis',type:'Prescription'},
      {name:'Sporlac / Bifilac (Probiotics)',dosage:'1 capsule twice daily',purpose:'Restores healthy gut bacteria',type:'OTC'},
      {name:'Smecta Sachet',dosage:'1 sachet in water 3 times daily',purpose:'Relieves diarrhea by coating gut lining',type:'OTC'}
    ],
    doctor_urgency:'Soon',
    doctor_reason:'See a doctor within 24 hrs if vomiting is continuous, blood in stool, or signs of severe dehydration appear.',
    warning_signs:['Blood or black colour in vomit or stool','No urination for 8+ hours (dehydration)','Vomiting persists beyond 12 hours','High fever above 102F with gastro symptoms','Severe abdominal pain']
  },
  {
    keywords:['body ache','muscle pain','badan dard','fatigue','weakness','tired','body pain'],
    cond:'Viral Myalgia / Body Ache and Fatigue', severity:'Low',
    description:'Generalised body pain and exhaustion commonly accompanying viral infections, overexertion, or nutritional deficiency.',
    advice:['Complete bed rest for 1-2 days','Apply warm compress or use heating pad on painful muscles','Stay well hydrated — drink 2.5-3 litres of water','Light stretching once pain reduces — avoid heavy exercise','Eat iron and protein-rich foods: eggs, dal, spinach, banana'],
    medicines:[
      {name:'Dolo 650 / Crocin 650',dosage:'650mg every 6-8 hrs as needed',purpose:'Relieves body pain and fever',type:'OTC'},
      {name:'Combiflam / Brufen 400',dosage:'400mg every 8 hrs after food',purpose:'Anti-inflammatory for muscle pain relief',type:'OTC'},
      {name:'Volini Gel / Moov Cream',dosage:'Apply on affected area 3-4 times/day',purpose:'Topical relief for localised muscle pain',type:'OTC'},
      {name:'Becosules Capsule (B-Complex)',dosage:'1 capsule daily after breakfast',purpose:'Reduces fatigue from vitamin B deficiency',type:'OTC'}
    ],
    doctor_urgency:'Routine',
    doctor_reason:'See a doctor if body ache persists beyond 5 days without fever or if you suspect anaemia — get a CBC blood test.',
    warning_signs:['Severe weakness making it impossible to walk','Joint swelling along with pain','Rash appearing with body ache','Pain in chest or difficulty breathing']
  },
  {
    keywords:['chest pain','chest tight','breathing','breath','shortness','breathless','sans','heart'],
    cond:'Chest Discomfort — Urgent Evaluation Needed', severity:'High',
    description:'Chest pain or tightness can indicate cardiac, pulmonary or gastrointestinal causes. Requires immediate assessment to rule out serious conditions.',
    advice:['Sit upright and stay calm — do not lie flat if breathless','Loosen tight clothing around chest and neck','Do not eat or drink anything until evaluated by a doctor','If pain radiates to arm or jaw — call 112 immediately','Note exact location, type (crushing/sharp) and when it started'],
    medicines:[
      {name:'Sorbitrate — ONLY if prescribed for cardiac patients',dosage:'5mg under tongue for known cardiac patients only',purpose:'Emergency angina relief for prescribed patients only',type:'Prescription'},
      {name:'Pan-D / Pantop (if acid reflux suspected)',dosage:'1 tablet before breakfast',purpose:'Relieves chest burning from acid reflux or GERD',type:'OTC'},
      {name:'Gelusil / Digene Syrup',dosage:'2 tsp after meals if burning or acidity',purpose:'Neutralises stomach acid causing chest discomfort',type:'OTC'}
    ],
    doctor_urgency:'Urgent',
    doctor_reason:'Go to the Emergency Room immediately or call 112. Chest pain must always be evaluated urgently — do not wait.',
    warning_signs:['Crushing or pressure-like chest pain','Pain spreading to left arm, jaw or back','Sweating with chest pain','Blue lips or fingertips','Loss of consciousness']
  },
  {
    keywords:['skin rash','itching','khujli','allergy','hives','urticaria','redness','skin'],
    cond:'Allergic Skin Reaction / Urticaria', severity:'Low',
    description:'An allergic response causing skin redness, itching, hives or rash. Often triggered by food, medicine, insect bite or environmental allergens.',
    advice:['Identify and avoid the trigger (food, soap, fabric, pet etc.)','Apply cold compress on affected area for 10-15 mins','Avoid scratching — it worsens inflammation','Wear loose breathable cotton clothing','Keep nails short to prevent skin damage from scratching'],
    medicines:[
      {name:'Cetirizine 10mg (Cetzine / Zyrtec)',dosage:'1 tablet at night (causes drowsiness)',purpose:'Antihistamine — relieves itching and hives',type:'OTC'},
      {name:'Avil 25mg (Pheniramine)',dosage:'1 tablet 2-3 times daily',purpose:'Fast-acting antihistamine for allergic rash',type:'OTC'},
      {name:'Betnovate-C Cream',dosage:'Apply thin layer on rash twice daily',purpose:'Topical steroid for skin inflammation',type:'OTC'},
      {name:'Calamine Lotion',dosage:'Apply on itchy areas 3-4 times/day',purpose:'Soothes itching and cools skin',type:'OTC'}
    ],
    doctor_urgency:'Routine',
    doctor_reason:'See an allergist or dermatologist if rash persists beyond 2 weeks or keeps recurring frequently.',
    warning_signs:['Throat tightness or swelling (anaphylaxis)','Difficulty breathing with rash','Rash spreading rapidly all over body','Fever with skin rash and joint pain','Blisters forming on skin']
  },
  {
    keywords:['dizziness','dizzy','chakkar','vertigo','balance','fainting','lightheaded'],
    cond:'Vertigo / Dizziness', severity:'Low',
    description:'A sensation of spinning or loss of balance, commonly caused by inner ear disturbance, low blood pressure, or dehydration.',
    advice:['Sit or lie down immediately when dizzy — do not walk alone','Move head and body slowly — sudden movements worsen vertigo','Drink water or ORS — dehydration is a frequent cause','Avoid looking at screens or bright lights during episode','Ask doctor about Epley manoeuvre if BPPV is diagnosed'],
    medicines:[
      {name:'Vertin 16mg (Betahistine)',dosage:'16mg twice daily with food',purpose:'Reduces inner ear pressure causing vertigo',type:'Prescription'},
      {name:'Stemetil 5mg (Prochlorperazine)',dosage:'5mg tablet 3 times/day',purpose:'Controls dizziness and vomiting in vertigo',type:'Prescription'},
      {name:'Meclizine (Meclopam)',dosage:'25mg once or twice daily',purpose:'Anti-vertigo antihistamine',type:'OTC'},
      {name:'Electral ORS',dosage:'1 sachet in 1L water if dehydration-related',purpose:'Restores electrolytes and relieves dehydration dizziness',type:'OTC'}
    ],
    doctor_urgency:'Soon',
    doctor_reason:'See an ENT specialist within 2-3 days especially if dizziness is recurrent, accompanied by hearing loss or tinnitus.',
    warning_signs:['Sudden severe headache with dizziness','Loss of consciousness','Slurred speech or facial drooping','Double vision with dizziness','Dizziness after head injury']
  },
  {
    keywords:['joint pain','knee pain','back pain','arthritis','swollen joint','ghutna','kamar dard','ankle'],
    cond:'Joint Pain / Musculoskeletal Pain', severity:'Low',
    description:'Pain and inflammation in joints commonly caused by overuse, injury, arthritis or uric acid buildup (gout).',
    advice:['Rest the affected joint and avoid weight-bearing activities','Apply ice pack for first 48 hrs (20 mins on, 20 mins off)','After 48 hrs switch to warm compress to relax muscles','Elevate the affected limb to reduce swelling','Gentle range-of-motion exercises once acute pain settles'],
    medicines:[
      {name:'Brufen 400 / Ibugesic (Ibuprofen)',dosage:'400mg every 8 hrs after food',purpose:'Anti-inflammatory for joint pain and swelling',type:'OTC'},
      {name:'Voveran / Diclofenac 50mg',dosage:'50mg twice daily after food',purpose:'Strong NSAID for moderate to severe joint pain',type:'OTC'},
      {name:'Volini Gel / Moov Spray',dosage:'Apply 2-3 times/day on affected joint',purpose:'Topical pain relief without side effects',type:'OTC'},
      {name:'Shelcal / Calcium + D3 tablet',dosage:'1 tablet daily after dinner',purpose:'Strengthens bones and reduces joint deterioration',type:'OTC'},
      {name:'Zyloric (Allopurinol) for Gout',dosage:'100-300mg once daily — doctor prescribed',purpose:'Reduces uric acid causing gout joint pain',type:'Prescription'}
    ],
    doctor_urgency:'Routine',
    doctor_reason:'See an orthopaedic doctor if joint pain lasts more than 2 weeks or if you notice swelling, warmth, or restricted movement.',
    warning_signs:['Sudden severe joint swelling with redness and warmth','Fever with joint pain (possible septic arthritis)','Joint completely locked or unable to move','Numbness or tingling below the joint','Recent fall or trauma causing pain']
  },
  {
    keywords:['diabetes','sugar','blood sugar','frequent urination','thirst','prameha','sweet urine'],
    cond:'Hyperglycaemia / Diabetes Symptoms', severity:'Moderate',
    description:'Elevated blood sugar levels causing excessive thirst, frequent urination and fatigue — indicating possible uncontrolled diabetes.',
    advice:['Check blood glucose with glucometer if available','Drink plain water — avoid sugary drinks or fruit juices','Follow low GI diet: avoid white rice, maida, sweets','Light 30-min walk after meals helps lower blood sugar','Take your prescribed diabetes medicines on time without skipping'],
    medicines:[
      {name:'Metformin 500mg',dosage:'500mg twice daily after food — as prescribed',purpose:'First-line diabetes medicine to lower blood sugar',type:'Prescription'},
      {name:'Glycomet SR 500',dosage:'1 tablet at night — as prescribed',purpose:'Extended-release metformin for blood sugar control',type:'Prescription'},
      {name:'Glucon-D / Glucose for hypoglycemia',dosage:'1 glass if sugar drops too low (below 70)',purpose:'Rapidly raises dangerously low blood sugar',type:'OTC'}
    ],
    doctor_urgency:'Soon',
    doctor_reason:'See an endocrinologist or diabetologist within 2-3 days for blood sugar testing (HbA1c, fasting glucose) and treatment plan.',
    warning_signs:['Blood sugar above 300 mg/dL','Confusion or fruity breath (diabetic ketoacidosis)','Blood sugar below 60 mg/dL with shakiness or sweating','Chest pain with high sugar levels','Wound that is not healing']
  }
];

function matchDisease(symptoms) {
  var lower = symptoms.toLowerCase();
  var best = null, bestScore = 0;
  for (var i = 0; i < DISEASE_DB.length; i++) {
    var score = 0;
    var d = DISEASE_DB[i];
    for (var k = 0; k < d.keywords.length; k++) {
      if (lower.indexOf(d.keywords[k]) !== -1) score++;
    }
    if (score > bestScore) { bestScore = score; best = d; }
  }
  if (!best || bestScore === 0) {
    var fb = AI_POOL[Math.floor(Math.random() * AI_POOL.length)];
    return { cond:fb.cond, severity:fb.severity, description:'', advice:fb.advice, medicines:[], doctor_urgency:'Routine', doctor_reason:fb.consult, warning_signs:[], consult:fb.consult };
  }
  return best;
}

function analyzeSymptoms() {
  var chips = [];
  document.querySelectorAll('.sym-chip.on').forEach(function(c) { chips.push(c.textContent.trim()); });
  var text = document.getElementById('symText').value.trim();
  if (!chips.length && !text && !scanFile) { showToast('Select symptoms or describe them first!', true); return; }

  var btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px"><span style="width:16px;height:16px;border:2.5px solid #030712;border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite;display:inline-block"></span>ANALYZING...</span>';

  var sym = chips.concat(text ? [text] : []).join(', ') || 'Image scan uploaded';
  var now = new Date().toLocaleString('en-IN');

  document.getElementById('symResult').classList.remove('hidden');
  document.getElementById('symResultContent').innerHTML =
    '<div style="display:flex;flex-direction:column;gap:10px;padding:8px 0">' +
    '<div style="height:14px;border-radius:8px;background:rgba(0,229,255,.1);width:60%;animation:pulse 1.2s ease-in-out infinite"></div>' +
    '<div style="height:14px;border-radius:8px;background:rgba(0,229,255,.08);width:80%;animation:pulse 1.2s ease-in-out infinite .15s"></div>' +
    '<div style="height:14px;border-radius:8px;background:rgba(0,229,255,.06);width:70%;animation:pulse 1.2s ease-in-out infinite .3s"></div>' +
    '<div style="height:14px;border-radius:8px;background:rgba(0,229,255,.08);width:90%;animation:pulse 1.2s ease-in-out infinite .45s"></div>' +
    '</div>';
  document.getElementById('symResult').scrollIntoView({behavior:'smooth', block:'start'});

  setTimeout(function() {
    var res = matchDisease(sym);
    lastResult = {
      time: now, symptoms: sym,
      condition: res.cond || res.condition,
      severity: res.severity,
      description: res.description || '',
      advice: res.advice || [],
      medicines: res.medicines || [],
      doctor_urgency: res.doctor_urgency || 'Routine',
      doctor_reason: res.doctor_reason || res.consult || '',
      warning_signs: res.warning_signs || [],
      consult: res.consult || res.doctor_reason || ''
    };
    document.getElementById('symResultContent').innerHTML = buildResultHTML(lastResult);
    analysisHistory.unshift(lastResult);
    if (analysisHistory.length > 30) analysisHistory.pop();
    localStorage.setItem('careai_history', JSON.stringify(analysisHistory));
    renderHistory();
    btn.disabled = false;
    btn.textContent = 'ANALYZE WITH AI';
    showToast('Analysis complete!');
  }, 1800);
}
function buildResultHTML(r) {
  var svgBadge = r.severity === 'Low' ? 'badge-ok' : r.severity === 'Moderate' ? 'badge-warn' : 'badge-alert';
  var urgencyMap = {
    'Emergency': {cls:'badge-alert', icon:'🔴', label:'EMERGENCY — Go to ER Now'},
    'Urgent':    {cls:'badge-alert', icon:'🟠', label:'URGENT — See Doctor Within 24h'},
    'Soon':      {cls:'badge-warn',  icon:'🟡', label:'SEE DOCTOR — Within 3 Days'},
    'Routine':   {cls:'badge-ok',    icon:'🟢', label:'ROUTINE — Within 1–2 Weeks'}
  };
  var urg = urgencyMap[r.doctor_urgency] || urgencyMap['Routine'];

  // Advice list
  var adv = '';
  for (var i = 0; i < r.advice.length; i++) {
    adv += '<li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px">' +
      '<span style="color:#00e5ff;font-weight:900;flex-shrink:0;margin-top:1px">→</span>' +
      '<span style="font-size:13px;font-weight:600;opacity:.9">' + r.advice[i] + '</span></li>';
  }

  // Medicines section
  var medHtml = '';
  if (r.medicines && r.medicines.length) {
    var medRows = '';
    for (var i = 0; i < r.medicines.length; i++) {
      var m = r.medicines[i];
      var typeBadge = m.type === 'OTC'
        ? '<span style="background:rgba(74,222,128,.2);color:#4ade80;border:1px solid rgba(74,222,128,.3);padding:1px 7px;border-radius:99px;font-size:10px;font-weight:700">OTC</span>'
        : '<span style="background:rgba(248,113,113,.2);color:#f87171;border:1px solid rgba(248,113,113,.3);padding:1px 7px;border-radius:99px;font-size:10px;font-weight:700">Rx</span>';
      medRows += '<div style="padding:10px 12px;border-radius:12px;margin-bottom:6px;background:rgba(0,229,255,.05);border:1px solid rgba(0,229,255,.15)">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px">' +
        '<span style="font-weight:800;font-size:13px">💊 ' + m.name + '</span>' + typeBadge + '</div>' +
        '<div style="font-size:12px;font-weight:600;opacity:.7;margin-bottom:2px">📋 ' + m.dosage + '</div>' +
        '<div style="font-size:11px;font-weight:600;opacity:.55">↳ ' + m.purpose + '</div>' +
        '</div>';
    }
    medHtml = '<div style="margin-bottom:16px">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
      '<span style="font-family:\'Cinzel Decorative\',serif;font-size:11px;font-weight:700;letter-spacing:2px;color:#00e5ff">💊 SUGGESTED MEDICINES</span></div>' +
      medRows +
      '<p style="font-size:10px;font-weight:700;opacity:.45;margin-top:4px">⚠️ Always confirm with a licensed pharmacist or doctor before taking any medicine.</p>' +
      '</div>';
  }

  // Warning signs
  var warnHtml = '';
  if (r.warning_signs && r.warning_signs.length) {
    var signs = '';
    for (var i = 0; i < r.warning_signs.length; i++) {
      signs += '<li style="font-size:12px;font-weight:700;margin-bottom:4px">⚠ ' + r.warning_signs[i] + '</li>';
    }
    warnHtml = '<div style="padding:10px 14px;border-radius:12px;background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);margin-bottom:14px">' +
      '<p style="font-size:10px;font-weight:800;letter-spacing:2px;color:#f87171;margin-bottom:6px">🚨 SEEK IMMEDIATE CARE IF YOU HAVE:</p>' +
      '<ul style="list-style:none;padding:0;margin:0">' + signs + '</ul></div>';
  }

  // Doctor consult box
  var doctorHtml = '<div style="padding:12px 16px;border-radius:14px;border:1.5px solid;margin-bottom:14px;' +
    (r.doctor_urgency === 'Emergency' || r.doctor_urgency === 'Urgent'
      ? 'background:rgba(248,113,113,.12);border-color:rgba(248,113,113,.4)'
      : r.doctor_urgency === 'Soon'
      ? 'background:rgba(250,204,21,.08);border-color:rgba(250,204,21,.35)'
      : 'background:rgba(74,222,128,.07);border-color:rgba(74,222,128,.3)') + '">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
    '<span style="font-size:16px">' + urg.icon + '</span>' +
    '<span style="font-family:\'Cinzel Decorative\',serif;font-size:10px;font-weight:700;letter-spacing:1.5px;' +
    (r.doctor_urgency === 'Emergency' || r.doctor_urgency === 'Urgent' ? 'color:#f87171'
     : r.doctor_urgency === 'Soon' ? 'color:#facc15' : 'color:#4ade80') + '">' + urg.label + '</span></div>' +
    '<p style="font-size:13px;font-weight:600;opacity:.85;margin-bottom:0">' + (r.doctor_reason || r.consult) + '</p>' +
    '</div>';

  return '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
    '<span class="badge badge-info" style="font-size:10px">' + r.time + '</span>' +
    '<span class="badge ' + svgBadge + '">' + r.severity + ' Severity</span>' +
    '</div>' +
    '<p style="font-size:10px;font-weight:700;letter-spacing:.1em;opacity:.5;margin-bottom:4px">REPORTED SYMPTOMS</p>' +
    '<p style="font-size:13px;font-weight:700;margin-bottom:12px;color:#67e8f9">' + r.symptoms + '</p>' +
    '<p style="font-size:10px;font-weight:700;letter-spacing:.1em;opacity:.5;margin-bottom:4px">POSSIBLE CONDITION</p>' +
    '<p style="font-size:16px;font-weight:900;margin-bottom:' + (r.description ? '4px' : '14px') + ';color:#00e5ff">' + r.condition + '</p>' +
    (r.description ? '<p style="font-size:12px;font-weight:600;opacity:.65;margin-bottom:14px;line-height:1.5">' + r.description + '</p>' : '') +
    '<p style="font-size:10px;font-weight:700;letter-spacing:.1em;opacity:.5;margin-bottom:8px">HOME CARE STEPS</p>' +
    '<ul style="list-style:none;padding:0;margin:0 0 14px 0">' + adv + '</ul>' +
    medHtml +
    doctorHtml +
    warnHtml +
    '<p style="font-size:10px;font-weight:700;opacity:.3;margin-top:8px">AI guidance only — not a substitute for professional medical advice.</p>';
}

// MIC
function toggleMic() {
  var SRA = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SRA) { showToast('Voice not supported. Please use Chrome.', true); return; }
  var btn = document.getElementById('micBtn');
  var status = document.getElementById('micStatus');
  if (isListening) {
    if (recognition) recognition.stop();
    isListening = false;
    btn.classList.remove('listening');
    status.style.display = 'none';
    return;
  }
  recognition = new SRA();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-IN';
  recognition.onstart = function() { isListening = true; btn.classList.add('listening'); status.style.display = 'block'; };
  recognition.onresult = function(e) {
    var t = '';
    for (var i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
    document.getElementById('symText').value = t;
  };
  recognition.onend = function() { isListening = false; btn.classList.remove('listening'); status.style.display = 'none'; showToast('Voice captured!'); };
  recognition.onerror = function(err) { isListening = false; btn.classList.remove('listening'); status.style.display = 'none'; showToast('Mic error: ' + err.error + '. Try Chrome.', true); };
  recognition.start();
}

// PDF DOWNLOAD
function downloadPDF() {
  if (!lastResult) { showToast('No result to download yet!', true); return; }
  try {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({orientation:'portrait', unit:'mm', format:'a4'});
    var W = doc.internal.pageSize.getWidth();
    doc.setFillColor(0, 229, 255);
    doc.rect(0, 0, W, 14, 'F');
    doc.setTextColor(3, 7, 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CARE AI - SYMPTOM ANALYSIS REPORT', W / 2, 9, {align:'center'});
    var y = 24;
    doc.setTextColor(30, 30, 80);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Generated: ' + lastResult.time, 14, y); y += 7;
    doc.text('For reference only. Always consult a licensed physician.', 14, y); y += 10;
    doc.setDrawColor(0, 229, 255); doc.setLineWidth(.5); doc.line(14, y, W - 14, y); y += 7;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(0, 100, 160);
    doc.text('Reported Symptoms', 14, y); y += 6;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(40, 40, 40);
    var symLines = doc.splitTextToSize(lastResult.symptoms, W - 28);
    doc.text(symLines, 14, y); y += symLines.length * 6 + 4;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(0, 100, 160);
    doc.text('Possible Condition', 14, y); y += 6;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(20, 20, 20);
    doc.text(lastResult.condition, 14, y); y += 8;
    var sc = lastResult.severity === 'Low' ? [74,222,128] : lastResult.severity === 'Moderate' ? [250,204,21] : [248,113,113];
    doc.setFillColor(sc[0], sc[1], sc[2]);
    doc.roundedRect(14, y - 4, 40, 7, 2, 2, 'F');
    doc.setTextColor(20, 20, 20); doc.setFontSize(9);
    doc.text(lastResult.severity + ' Severity', 15, y + 0.5); y += 12;
    doc.setDrawColor(200, 200, 200); doc.setLineWidth(.3); doc.line(14, y, W - 14, y); y += 7;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(0, 100, 160);
    doc.text('Recommendations', 14, y); y += 7;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(40, 40, 40);
    for (var i = 0; i < lastResult.advice.length; i++) {
      var lines = doc.splitTextToSize((i + 1) + '. ' + lastResult.advice[i], W - 30);
      if (y + lines.length * 6 > 275) { doc.addPage(); y = 20; }
      doc.text(lines, 18, y); y += lines.length * 6 + 2;
    }
    y += 4;
    doc.setFillColor(255, 251, 230);
    doc.roundedRect(14, y - 4, W - 28, 12, 2, 2, 'F');
    doc.setTextColor(160, 100, 0); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    var cLines = doc.splitTextToSize('Note: ' + lastResult.consult, W - 32);
    doc.text(cLines, 16, y); y += cLines.length * 6 + 8;
    doc.setDrawColor(0, 229, 255); doc.setLineWidth(.5); doc.line(14, y, W - 14, y); y += 5;
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120, 120, 120);
    doc.text('Care AI - AI Health Guardian - India - 2025', W / 2, y, {align:'center'});
    doc.save('CareAI_Report_' + Date.now() + '.pdf');
    showToast('PDF downloaded!');
  } catch(e) { showToast('PDF error: ' + e.message, true); }
}

function downloadTXT() {
  if (!lastResult) { showToast('No result yet!', true); return; }
  var txt = buildTXT(lastResult);
  triggerDownload('CareAI_Report_' + Date.now() + '.txt', 'text/plain', txt);
  showToast('TXT downloaded!');
}

function buildTXT(r) {
  var lines = ['CARE AI - SYMPTOM ANALYSIS REPORT', '='.repeat(45), 'Date: ' + r.time, '', 'SYMPTOMS: ' + r.symptoms, 'CONDITION: ' + r.condition + ' [' + r.severity + ' Severity]', '', 'RECOMMENDATIONS:'];
  for (var i = 0; i < r.advice.length; i++) lines.push((i + 1) + '. ' + r.advice[i]);
  lines.push('', 'NOTE: ' + r.consult, '', '-'.repeat(45), 'For reference only. Consult a licensed doctor.');
  return lines.join('\n');
}

function triggerDownload(name, type, content) {
  var a = document.createElement('a');
  a.href = 'data:' + type + ';charset=utf-8,' + encodeURIComponent(content);
  a.download = name;
  a.click();
}

// RISK PDF
function downloadRiskPDF() {
  try {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var W = doc.internal.pageSize.getWidth();
    doc.setFillColor(0, 229, 255); doc.rect(0, 0, W, 14, 'F');
    doc.setTextColor(3, 7, 18); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text('CARE AI - HEALTH RISK REPORT', W / 2, 9, {align:'center'});
    var y = 22;
    doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text('Date: ' + new Date().toLocaleString('en-IN'), 14, y); y += 8;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(0, 100, 160);
    doc.text('Overall Health Score: 75 / 100 (Good)', 14, y); y += 10;
    for (var i = 0; i < RISK_DATA.length; i++) {
      var r = RISK_DATA[i];
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(20, 20, 20);
      doc.text(r.label + ' - ' + r.status, 14, y); y += 6;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(80, 80, 80);
      var lines = doc.splitTextToSize(r.note, W - 30);
      doc.text(lines, 18, y); y += lines.length * 6 + 5;
    }
    doc.save('CareAI_RiskReport_' + Date.now() + '.pdf');
    showToast('Risk report PDF downloaded!');
  } catch(e) { showToast('PDF error', true); }
}

// HISTORY
function loadHistory() { analysisHistory = JSON.parse(localStorage.getItem('careai_history') || '[]'); renderHistory(); }

function renderHistory() {
  var c = document.getElementById('histList');
  if (!analysisHistory.length) { c.innerHTML = '<p class="text-center font-bold opacity-40 text-sm py-8">No analyses yet. Use Symptom Analyzer to get started.</p>'; return; }
  var html = '';
  for (var i = 0; i < analysisHistory.length; i++) {
    var h = analysisHistory[i];
    var badge = h.severity === 'Low' ? 'badge-ok' : h.severity === 'Moderate' ? 'badge-warn' : 'badge-alert';
    html += '<div class="hist-item">' +
      '<div class="flex items-center justify-between mb-1 flex-wrap gap-2">' +
      '<span class="font-bold text-sm dark:text-cyan-400 text-blue-700">' + h.condition + '</span>' +
      '<span class="badge ' + badge + '">' + h.severity + '</span></div>' +
      '<p class="text-xs font-semibold opacity-60 mb-1">Symptoms: ' + h.symptoms + '</p>' +
      '<p class="text-[11px] opacity-35 font-bold">' + h.time + '</p></div>';
  }
  c.innerHTML = html;
}

function exportHistoryPDF() {
  if (!analysisHistory.length) { showToast('No history yet!', true); return; }
  try {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var W = doc.internal.pageSize.getWidth();
    doc.setFillColor(0, 229, 255); doc.rect(0, 0, W, 14, 'F');
    doc.setTextColor(3, 7, 18); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text('CARE AI - FULL HISTORY REPORT', W / 2, 9, {align:'center'});
    var y = 22;
    for (var i = 0; i < analysisHistory.length; i++) {
      var h = analysisHistory[i];
      if (y > 255) { doc.addPage(); y = 18; }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(0, 100, 160);
      doc.text((i + 1) + '. ' + h.condition, 14, y); y += 6;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
      doc.text('Date: ' + h.time + '  |  Severity: ' + h.severity, 14, y); y += 5;
      var sl = doc.splitTextToSize('Symptoms: ' + h.symptoms, W - 30);
      doc.text(sl, 14, y); y += sl.length * 5 + 2;
      for (var j = 0; j < h.advice.length; j++) {
        var al = doc.splitTextToSize('- ' + h.advice[j], W - 32);
        if (y + al.length * 5 > 265) { doc.addPage(); y = 18; }
        doc.text(al, 18, y); y += al.length * 5 + 1;
      }
      y += 4; doc.setDrawColor(200, 200, 200); doc.line(14, y, W - 14, y); y += 6;
    }
    doc.save('CareAI_History_' + Date.now() + '.pdf');
    showToast('History PDF exported!');
  } catch(e) { showToast('PDF error', true); }
}

function exportHistoryTXT() {
  if (!analysisHistory.length) { showToast('No history yet!', true); return; }
  var parts = ['CARE AI - FULL ANALYSIS HISTORY', '='.repeat(44), ''];
  for (var i = 0; i < analysisHistory.length; i++) parts.push(buildTXT(analysisHistory[i]), '');
  triggerDownload('CareAI_History_' + Date.now() + '.txt', 'text/plain', parts.join('\n'));
  showToast('History TXT exported!');
}

function clearHistory() {
  if (!confirm('Clear all analysis history?')) return;
  analysisHistory = [];
  localStorage.removeItem('careai_history');
  renderHistory();
  showToast('History cleared');
}

// MEDICINES
function loadMedicines() { medicines = JSON.parse(localStorage.getItem('careai_medicines') || '[]'); renderMedicines(); }

function renderMedicines() {
  var g = document.getElementById('medGrid');
  var empty = document.getElementById('medEmpty');
  if (!medicines.length) { empty.classList.remove('hidden'); g.innerHTML = ''; return; }
  empty.classList.add('hidden');
  var icons = ['&#128138;','&#128137;','&#129658;','&#127777;&#65039;','&#129728;','&#129516;','&#128134;','&#127807;'];
  var html = '';
  for (var i = 0; i < medicines.length; i++) {
    var m = medicines[i];
    var now = new Date();
    var taken = false;
    if (m.time) {
      var parts = m.time.split(':');
      var hh = parseInt(parts[0]); var mm = parseInt(parts[1]);
      taken = now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm);
    }
    html += '<div class="card p-5" style="animation:slideup ' + (.35 + i * .08) + 's ease forwards">' +
      '<div class="flex items-start justify-between mb-3">' +
      '<div class="flex items-center gap-3">' +
      '<div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl dark:bg-gray-800 bg-gray-100">' + icons[i % icons.length] + '</div>' +
      '<div><h3 class="font-bold text-base">' + m.name + '</h3>' +
      '<span class="med-pill">' + (m.dosage || 'As prescribed') + '</span></div></div>' +
      '<button onclick="deleteMedicine(' + i + ')" class="w-7 h-7 rounded-full flex items-center justify-center dark:bg-red-400/10 bg-red-50 text-red-400 hover:scale-110 transition-transform text-sm font-bold">x</button></div>' +
      '<div class="grid grid-cols-3 gap-2 text-center mb-3">' +
      '<div class="dark:bg-white/5 bg-gray-50 rounded-lg py-2"><div class="font-black dark:text-cyan-400 text-blue-700 text-sm">' + (m.time || '--') + '</div><div class="text-[10px] font-bold opacity-45">TIME</div></div>' +
      '<div class="dark:bg-white/5 bg-gray-50 rounded-lg py-2"><div class="font-black dark:text-cyan-400 text-blue-700 text-xs">' + m.frequency + '</div><div class="text-[10px] font-bold opacity-45">FREQ</div></div>' +
      '<div class="dark:bg-white/5 bg-gray-50 rounded-lg py-2 flex items-center justify-center"><span class="badge ' + (taken ? 'badge-ok' : 'badge-warn') + ' text-[10px]">' + (taken ? 'TAKEN' : 'PENDING') + '</span></div></div>' +
      (m.instructions ? '<p class="text-xs font-semibold opacity-50">' + m.instructions + '</p>' : '') +
      '</div>';
  }
  g.innerHTML = html;
}

function addMedicine() {
  var name = document.getElementById('medName').value.trim();
  if (!name) { showToast('Medicine name required!', true); return; }
  medicines.push({
    name: name,
    dosage: document.getElementById('medDose').value,
    time: document.getElementById('medTime').value,
    frequency: document.getElementById('medFreq').value,
    instructions: document.getElementById('medInstr').value
  });
  localStorage.setItem('careai_medicines', JSON.stringify(medicines));
  renderMedicines();
  closeModal('medModal');
  showToast('Medicine added!');
  document.getElementById('medName').value = '';
  document.getElementById('medDose').value = '';
  document.getElementById('medInstr').value = '';
  document.getElementById('medTime').value = '';
}

function deleteMedicine(i) {
  medicines.splice(i, 1);
  localStorage.setItem('careai_medicines', JSON.stringify(medicines));
  renderMedicines();
  showToast('Medicine removed');
}

function checkMedReminders() {
  var now = new Date();
  for (var i = 0; i < medicines.length; i++) {
    var m = medicines[i];
    if (!m.time) continue;
    var parts = m.time.split(':');
    if (now.getHours() === parseInt(parts[0]) && now.getMinutes() === parseInt(parts[1])) {
      showToast('Time to take ' + m.name + '!');
    }
  }
  setTimeout(checkMedReminders, 60000);
}

// HOSPITALS
function findHospitals() {
  var btn = document.getElementById('locBtn');
  if (!navigator.geolocation) { showToast('Geolocation not supported', true); return; }
  btn.disabled = true;
  btn.textContent = 'LOCATING...';
  document.getElementById('hospList').innerHTML = '<p class="text-sm font-bold opacity-50 text-center py-6">Finding hospitals near you...</p>';
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;
      initMap(lat, lng);
      fetchHospitals(lat, lng);
      btn.disabled = false;
      btn.textContent = 'REFRESH';
    },
    function(err) {
      btn.disabled = false;
      btn.textContent = 'FIND NEAR ME';
      showToast('Location denied. Please allow location in browser settings.', true);
      document.getElementById('hospList').innerHTML = '<p class="text-sm font-bold opacity-50 text-center py-6">Location access denied.<br>Please allow location in browser settings.</p>';
    },
    {timeout: 12000, enableHighAccuracy: true}
  );
}

function initMap(lat, lng) {
  document.getElementById('mapPlaceholder').style.display = 'none';
  document.getElementById('hospitalMap').style.display = 'block';
  if (leafletMap) { leafletMap.remove(); leafletMap = null; }
  leafletMap = L.map('hospitalMap').setView([lat, lng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(leafletMap);
  var userIcon = L.divIcon({
    className: '',
    html: '<div style="width:18px;height:18px;border-radius:50%;background:#00e5ff;border:3px solid white;box-shadow:0 0 12px rgba(0,229,255,.8)"></div>',
    iconSize: [18, 18], iconAnchor: [9, 9]
  });
  L.marker([lat, lng], {icon: userIcon}).addTo(leafletMap).bindPopup('<b>You are here</b>').openPopup();
}

function fetchHospitals(lat, lng) {
  var url = 'https://nominatim.openstreetmap.org/search?format=json&limit=12&q=hospital&bounded=1&viewbox=' + (lng - .06) + ',' + (lat + .06) + ',' + (lng + .06) + ',' + (lat - .06) + '&accept-language=en';
  fetch(url, {headers: {'Accept-Language': 'en'}})
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data && data.length > 0) {
        renderHospitals(data, lat, lng);
      } else {
        renderHospitals(getMockHospitals(lat, lng), lat, lng);
        showToast('Using demo hospital data for your area', true);
      }
    })
    .catch(function() {
      renderHospitals(getMockHospitals(lat, lng), lat, lng);
      showToast('Offline mode: showing demo hospital data', true);
    });
}

function getMockHospitals(lat, lng) {
  var names = ['City General Hospital','Apollo Clinic','AIIMS Regional','Fortis Healthcare','Max Super Speciality','Manipal Hospital','Medanta Medical','Narayana Health','District Hospital','Community Health Centre'];
  var result = [];
  for (var i = 0; i < names.length; i++) {
    result.push({
      display_name: names[i] + ', Sector ' + (i + 1) + ', Nearby',
      lat: lat + (Math.random() - .5) * .04,
      lon: lng + (Math.random() - .5) * .04,
      name: names[i]
    });
  }
  return result;
}

function renderHospitals(data, userLat, userLng) {
  for (var m = 0; m < hospMarkers.length; m++) leafletMap.removeLayer(hospMarkers[m]);
  hospMarkers = [];
  var hospIcon = L.divIcon({
    className: '',
    html: '<div style="width:28px;height:28px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 2px 8px rgba(239,68,68,.6);display:flex;align-items:center;justify-content:center;font-size:13px;color:white;font-weight:bold">H</div>',
    iconSize: [28, 28], iconAnchor: [14, 14]
  });
  var list = document.getElementById('hospList');
  if (!data || !data.length) { list.innerHTML = '<p class="text-sm font-bold opacity-50 text-center py-6">No hospitals found nearby.</p>'; return; }
  list.innerHTML = '';
  var count = Math.min(data.length, 8);
  for (var i = 0; i < count; i++) {
    var h = data[i];
    var hlat = parseFloat(h.lat);
    var hlng = parseFloat(h.lon);
    var dist = getDistKm(userLat, userLng, hlat, hlng).toFixed(1);
    var name = h.name || (h.display_name || 'Hospital').split(',')[0];
    var addr = (h.display_name || '').split(',').slice(1, 3).join(',').trim() || 'Nearby';
    var rating = (3.5 + Math.random() * 1.5).toFixed(1);
    var starCount = Math.round(parseFloat(rating));
    var stars = '';
    for (var s = 0; s < starCount; s++) stars += '&#9733;';
    for (var s = starCount; s < 5; s++) stars += '&#9734;';
    var marker = L.marker([hlat, hlng], {icon: hospIcon}).addTo(leafletMap);
    marker.bindPopup('<b>' + name + '</b><br>' + addr + '<br>Rating: ' + rating + '<br>Distance: ' + dist + ' km');
    hospMarkers.push(marker);
    var card = document.createElement('div');
    card.className = 'hosp-card';
    card.innerHTML = '<div class="flex items-start justify-between gap-2">' +
      '<div class="flex items-start gap-3">' +
      '<div class="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center text-lg shrink-0">&#127973;</div>' +
      '<div><p class="font-bold text-sm">' + name + '</p>' +
      '<p class="text-[11px] opacity-50 font-semibold mb-1">' + addr.slice(0, 40) + '</p>' +
      '<div class="flex items-center gap-2"><span class="stars" style="color:#facc15;font-size:13px">' + stars + '</span>' +
      '<span class="text-xs font-bold opacity-60">' + rating + '</span>' +
      '<span class="badge badge-info text-[10px]">' + dist + ' km</span></div></div></div>' +
      '<a href="https://www.google.com/maps/dir/?api=1&destination=' + hlat + ',' + hlng + '" target="_blank" class="btn-p px-3 py-1.5 text-[10px] shrink-0">ROUTE</a></div>';
    (function(idx, mk) {
      card.onclick = function() { leafletMap.setView([parseFloat(data[idx].lat), parseFloat(data[idx].lon)], 16); mk.openPopup(); };
    })(i, marker);
    list.appendChild(card);
  }
  var bounds = hospMarkers.map(function(m) { return m.getLatLng(); });
  if (bounds.length) leafletMap.fitBounds(bounds, {padding: [30, 30]});
  showToast('Found ' + count + ' hospitals nearby!');
}

function getDistKm(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dL = (lat2 - lat1) * Math.PI / 180;
  var dG = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dL / 2) * Math.sin(dL / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dG / 2) * Math.sin(dG / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// THEME
function toggleTheme() {
  isDark = !isDark;
  var body = document.getElementById('body');
  var bgMap = document.getElementById('bgMap');
  var grid = document.getElementById('gridBg');
  var pts = document.querySelectorAll('.pt');
  if (isDark) {
    body.className = 'dark bg-gray-950 text-cyan-50 overflow-x-hidden';
    bgMap.className = bgMap.className.replace('map-light', 'map-dark');
    grid.className = grid.className.replace('grid-lt', 'grid-dk');
    pts.forEach(function(p) { p.classList.remove('pt-l'); p.classList.add('pt-d'); });
    document.getElementById('themeIcon').innerHTML = '&#9728;&#65039;';
  } else {
    body.className = 'light bg-slate-100 text-slate-800 overflow-x-hidden';
    bgMap.className = bgMap.className.replace('map-dark', 'map-light');
    grid.className = grid.className.replace('grid-dk', 'grid-lt');
    pts.forEach(function(p) { p.classList.remove('pt-d'); p.classList.add('pt-l'); });
    document.getElementById('themeIcon').innerHTML = '&#127769;';
  }
}

// MODAL
function openModal(id) { document.getElementById(id).classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow = ''; }

// NAVIGATION
function goTo(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({behavior:'smooth', block:'start'}); }
function toggleMenu() { document.getElementById('mobileMenu').classList.toggle('hidden'); }

window.addEventListener('scroll', function() {
  var ids = ['hero','symptoms','tips','risk','medicines','hospitals'];
  var cur = 'hero';
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el && el.getBoundingClientRect().top < 100) cur = ids[i];
  }
  var links = document.querySelectorAll('.nav-link');
  for (var i = 0; i < links.length; i++) {
    links[i].classList.remove('active');
    if (links[i].textContent.toLowerCase().replace(' ','').indexOf(cur.slice(0,5)) !== -1) links[i].classList.add('active');
  }
}, {passive: true});

// SCROLL REVEAL
function setupReveal() {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('show'); });
  }, {threshold: 0.06});
  document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });
}

// PARTICLES
function spawnParticles() {
  var c = document.getElementById('particles');
  for (var i = 0; i < 30; i++) {
    var p = document.createElement('div');
    p.className = 'pt pt-d';
    var sz = Math.random() * 4 + 2;
    p.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;left:' + (Math.random() * 100) + '%;animation-duration:' + (Math.random() * 14 + 10) + 's;animation-delay:' + (Math.random() * 18) + 's;';
    c.appendChild(p);
  }
}

// TOAST

// ============================================================
//  DISEASE PREDICTION ENGINE
// ============================================================
var DP_DISEASES = [
  {
    id:'diabetes', icon:'🩸', label:'Diabetes',
    color:'#f97316',
    questions:[
      {id:'age',   text:'What is your age?',         type:'select', opts:['Under 30','30–45','46–60','Above 60'], scores:[0,1,2,3]},
      {id:'bmi',   text:'What is your body weight status?', type:'select', opts:['Underweight','Normal','Overweight','Obese'], scores:[0,0,2,3]},
      {id:'sugar', text:'Do you consume sugary drinks or sweets daily?', type:'select', opts:['Rarely','1–2 times/week','Daily','Multiple times/day'], scores:[0,1,2,3]},
      {id:'fhist', text:'Does anyone in your family have diabetes?',      type:'select', opts:['No','One grandparent','One parent or sibling','Both parents'], scores:[0,1,2,3]},
      {id:'exer',  text:'How often do you exercise?',  type:'select', opts:['Daily','3–4 times/week','Rarely','Never'], scores:[0,1,2,3]},
      {id:'thirst',text:'Do you experience excessive thirst or frequent urination?', type:'select', opts:['Never','Occasionally','Often','Always'], scores:[0,1,2,3]},
      {id:'bp',    text:'Do you have high blood pressure?', type:'select', opts:['No','Borderline','Yes, controlled','Yes, uncontrolled'], scores:[0,1,2,3]},
      {id:'sleep', text:'How many hours do you sleep per night?', type:'select', opts:['7–9 hrs','6–7 hrs','5–6 hrs','Less than 5 hrs'], scores:[0,1,2,3]}
    ],
    maxScore:24,
    riskLevels:[
      {min:0,  max:6,  level:'Low Risk',      color:'#4ade80', badge:'badge-ok',   icon:'🟢'},
      {min:7,  max:13, level:'Moderate Risk',  color:'#facc15', badge:'badge-warn', icon:'🟡'},
      {min:14, max:19, level:'High Risk',      color:'#f97316', badge:'badge-alert',icon:'🟠'},
      {min:20, max:24, level:'Very High Risk', color:'#f87171', badge:'badge-alert',icon:'🔴'}
    ],
    factors:[
      {name:'Age above 45',        impact:'High',   tip:'Risk increases significantly after 40. Regular HbA1c screening advised.'},
      {name:'Obesity / High BMI',  impact:'High',   tip:'Each 5-unit rise in BMI increases diabetes risk by 30%. Target BMI under 25.'},
      {name:'Family History',      impact:'High',   tip:'Having a parent with diabetes doubles your lifetime risk.'},
      {name:'Physical Inactivity', impact:'Medium', tip:'30 minutes of daily walking reduces diabetes risk by up to 35%.'},
      {name:'High Sugar Diet',     impact:'Medium', tip:'Excess refined sugar and white rice spike insulin resistance over time.'},
      {name:'Hypertension',        impact:'Medium', tip:'High BP and diabetes frequently coexist and worsen each other.'},
      {name:'Poor Sleep',          impact:'Low',    tip:'Less than 6 hrs sleep raises cortisol and disrupts glucose metabolism.'}
    ],
    prevention:['Walk 30 minutes daily after meals','Replace white rice with millets or brown rice','Annual fasting blood sugar and HbA1c test','Maintain BMI below 25','Reduce refined sugar and processed food intake']
  },
  {
    id:'heart', icon:'❤️', label:'Heart Disease',
    color:'#ef4444',
    questions:[
      {id:'age',   text:'What is your age?',    type:'select', opts:['Under 35','35–45','46–60','Above 60'], scores:[0,1,2,3]},
      {id:'smoke', text:'Do you smoke or use tobacco?', type:'select', opts:['Never','Quit over 5 yrs ago','Quit under 5 yrs ago','Currently smoking'], scores:[0,1,2,3]},
      {id:'bp',    text:'What is your blood pressure status?', type:'select', opts:['Normal (below 120/80)','Borderline (120–139)','High (140–160)','Very high (above 160)'], scores:[0,1,2,3]},
      {id:'chol',  text:'Have you been told your cholesterol is high?', type:'select', opts:['No / Never tested','Borderline','Yes, managed','Yes, unmanaged'], scores:[0,1,2,3]},
      {id:'exer',  text:'How often do you exercise?', type:'select', opts:['Daily','3–4 times/week','Rarely','Never'], scores:[0,1,2,3]},
      {id:'stress',text:'How would you rate your daily stress level?', type:'select', opts:['Low','Moderate','High','Very High / Chronic'], scores:[0,1,2,3]},
      {id:'diet',  text:'How is your diet?', type:'select', opts:['Mostly fruits, veg, low fat','Moderate junk food','Frequent fried and processed food','Daily fast food and red meat'], scores:[0,1,2,3]},
      {id:'fhist', text:'Does your family have history of heart attack?', type:'select', opts:['No','One distant relative','One parent or sibling','Multiple family members'], scores:[0,1,2,3]}
    ],
    maxScore:24,
    riskLevels:[
      {min:0,  max:5,  level:'Low Risk',      color:'#4ade80', badge:'badge-ok',   icon:'🟢'},
      {min:6,  max:12, level:'Moderate Risk',  color:'#facc15', badge:'badge-warn', icon:'🟡'},
      {min:13, max:18, level:'High Risk',      color:'#f97316', badge:'badge-alert',icon:'🟠'},
      {min:19, max:24, level:'Very High Risk', color:'#f87171', badge:'badge-alert',icon:'🔴'}
    ],
    factors:[
      {name:'Smoking / Tobacco',      impact:'High',   tip:'Smoking doubles heart disease risk. Quitting reduces risk by 50% within 1 year.'},
      {name:'High Blood Pressure',    impact:'High',   tip:'Hypertension strains artery walls directly. Target below 120/80 mmHg.'},
      {name:'High Cholesterol',       impact:'High',   tip:'LDL above 130 mg/dL accelerates arterial plaque buildup significantly.'},
      {name:'Family History',         impact:'High',   tip:'First-degree relative with heart attack before 55 is a major risk flag.'},
      {name:'Sedentary Lifestyle',    impact:'Medium', tip:'Aerobic exercise 150 min/week reduces heart disease risk by 30–35%.'},
      {name:'Chronic Stress',         impact:'Medium', tip:'Cortisol from chronic stress raises BP and promotes arterial inflammation.'},
      {name:'Poor Diet',              impact:'Medium', tip:'Mediterranean-style diet reduces cardiac events by up to 30% in studies.'},
      {name:'Age above 45',           impact:'Low',    tip:'Cardiovascular risk increases steadily after 45. Annual ECG recommended.'}
    ],
    prevention:['Quit smoking immediately — the single highest-impact action','Check BP monthly — target below 130/80','Reduce saturated fat and sodium intake','Exercise 150+ minutes weekly','Annual lipid profile blood test']
  },
  {
    id:'hyper', icon:'🔴', label:'Hypertension',
    color:'#dc2626',
    questions:[
      {id:'age',   text:'What is your age?',    type:'select', opts:['Under 30','30–45','46–60','Above 60'], scores:[0,1,2,3]},
      {id:'salt',  text:'How much salt do you consume?', type:'select', opts:['Very low (no added salt)','Moderate','High (pickle, papad, salty snacks daily)','Very high'], scores:[0,1,2,3]},
      {id:'stress',text:'How is your daily stress level?', type:'select', opts:['Low','Moderate','High','Very High / Chronic'], scores:[0,1,2,3]},
      {id:'weight',text:'What is your weight status?', type:'select', opts:['Normal BMI','Slightly overweight','Overweight','Obese'], scores:[0,1,2,3]},
      {id:'drink', text:'Do you consume alcohol?', type:'select', opts:['Never','Occasionally','Regularly (weekly)','Daily'], scores:[0,1,2,3]},
      {id:'sleep', text:'How many hours do you sleep?', type:'select', opts:['7–9 hrs','6–7 hrs','5–6 hrs','Under 5 hrs'], scores:[0,1,2,3]},
      {id:'fhist', text:'Family history of high blood pressure?', type:'select', opts:['None','One grandparent','One parent or sibling','Both parents'], scores:[0,1,2,3]},
      {id:'exer',  text:'Exercise frequency?', type:'select', opts:['Daily','3–4 times/week','Rarely','Never'], scores:[0,1,2,3]}
    ],
    maxScore:24,
    riskLevels:[
      {min:0,  max:6,  level:'Low Risk',      color:'#4ade80', badge:'badge-ok',   icon:'🟢'},
      {min:7,  max:13, level:'Moderate Risk',  color:'#facc15', badge:'badge-warn', icon:'🟡'},
      {min:14, max:19, level:'High Risk',      color:'#f97316', badge:'badge-alert',icon:'🟠'},
      {min:20, max:24, level:'Very High Risk', color:'#f87171', badge:'badge-alert',icon:'🔴'}
    ],
    factors:[
      {name:'High Salt Intake',       impact:'High',   tip:'Every 1g reduction in daily sodium lowers systolic BP by 1–2 mmHg.'},
      {name:'Obesity',                impact:'High',   tip:'Losing just 5kg can reduce systolic pressure by 5–10 mmHg.'},
      {name:'Chronic Stress',         impact:'High',   tip:'Cortisol chronically elevates vascular tone and heart rate.'},
      {name:'Family History',         impact:'High',   tip:'Genetics account for 35–50% of hypertension risk.'},
      {name:'Alcohol Consumption',    impact:'Medium', tip:'More than 2 drinks/day raises BP by 2–4 mmHg significantly.'},
      {name:'Poor Sleep',             impact:'Medium', tip:'Sleep apnea and under 6hrs sleep both elevate nocturnal BP.'},
      {name:'Physical Inactivity',    impact:'Medium', tip:'Regular aerobic exercise lowers resting BP by 5–8 mmHg on average.'},
      {name:'Age above 50',           impact:'Low',    tip:'Arteries stiffen with age — systolic BP naturally rises slightly.'}
    ],
    prevention:['Reduce added salt below 5g per day (1 teaspoon)','Lose 5–10% of body weight if overweight','DASH diet: fruits, vegetables, low-fat dairy','Limit alcohol to 1 drink max per day','Check BP at home weekly']
  },
  {
    id:'tb', icon:'🫁', label:'Tuberculosis',
    color:'#a855f7',
    questions:[
      {id:'cough', text:'Do you have a cough lasting more than 2 weeks?', type:'select', opts:['No','Mild occasional','Yes, moderate','Yes, with blood'], scores:[0,1,2,3]},
      {id:'contact',text:'Have you had close contact with a TB patient?', type:'select', opts:['No','Brief contact','Regular contact','Living in same house'], scores:[0,1,2,3]},
      {id:'immune',text:'Is your immunity compromised?', type:'select', opts:['No known issues','Mild illness recently','Diabetes or chronic disease','HIV positive or on immunosuppressants'], scores:[0,0,2,3]},
      {id:'crowd', text:'Do you live or work in a crowded place?', type:'select', opts:['No, open space','Moderate density','Crowded housing','Slum, prison, or shelter'], scores:[0,1,2,3]},
      {id:'sweat', text:'Do you experience night sweats or unexplained fever?', type:'select', opts:['Never','Occasionally','Often','Almost nightly'], scores:[0,1,2,3]},
      {id:'weight',text:'Have you had unexplained weight loss recently?', type:'select', opts:['No','Slight','Noticeable (3–5kg)','Significant (over 5kg)'], scores:[0,1,2,3]},
      {id:'nutri', text:'How is your nutritional status?', type:'select', opts:['Well-nourished','Adequate','Mildly malnourished','Severely malnourished'], scores:[0,1,2,3]},
      {id:'smk',   text:'Do you smoke?', type:'select', opts:['Never','Quit','Occasionally','Daily'], scores:[0,1,1,2]}
    ],
    maxScore:23,
    riskLevels:[
      {min:0,  max:4,  level:'Low Risk',     color:'#4ade80', badge:'badge-ok',   icon:'🟢'},
      {min:5,  max:10, level:'Moderate Risk', color:'#facc15', badge:'badge-warn', icon:'🟡'},
      {min:11, max:16, level:'High Risk',     color:'#f97316', badge:'badge-alert',icon:'🟠'},
      {min:17, max:23, level:'Very High Risk',color:'#f87171', badge:'badge-alert',icon:'🔴'}
    ],
    factors:[
      {name:'Close Contact with TB Patient', impact:'High',   tip:'Most TB transmission occurs through prolonged indoor exposure to sputum droplets.'},
      {name:'Compromised Immunity',          impact:'High',   tip:'HIV, diabetes, or steroids suppress immune control of latent TB bacteria.'},
      {name:'Malnutrition',                  impact:'High',   tip:'Undernutrition is the largest single risk factor for TB in India.'},
      {name:'Crowded Living Conditions',     impact:'High',   tip:'Poor ventilation and overcrowding amplify airborne TB transmission dramatically.'},
      {name:'Persistent Cough',             impact:'Medium', tip:'Any cough lasting over 2 weeks with fever or weight loss needs sputum test.'},
      {name:'Night Sweats and Fever',        impact:'Medium', tip:'Classic triad of TB: cough + night sweats + unexplained weight loss.'},
      {name:'Smoking',                       impact:'Medium', tip:'Smokers are 2.5 times more likely to develop active TB disease.'},
      {name:'Weight Loss',                   impact:'Low',    tip:'Unexplained weight loss is a systemic symptom of active tuberculosis.'}
    ],
    prevention:['BCG vaccination for all newborns','Ensure good ventilation in living and working spaces','Maintain adequate nutrition (protein-rich diet)','Seek sputum test if cough lasts over 2 weeks','Complete the full 6-month TB treatment course without stopping']
  },
  {
    id:'anemia', icon:'🫀', label:'Anaemia',
    color:'#ec4899',
    questions:[
      {id:'fatigue',text:'Do you feel unusually tired or weak?', type:'select', opts:['Rarely','Occasionally','Often','Almost always'], scores:[0,1,2,3]},
      {id:'diet',   text:'How is your iron intake in diet?', type:'select', opts:['Good (meat, leafy greens, lentils daily)','Moderate','Low (mostly rice/wheat)','Very poor (skips meals)'], scores:[0,1,2,3]},
      {id:'gender', text:'What is your gender and menstrual status?', type:'select', opts:['Male','Post-menopausal female','Pre-menopausal female, light periods','Pre-menopausal, heavy periods'], scores:[0,0,1,3]},
      {id:'pale',   text:'Do you notice paleness in your skin, nails or eyes?', type:'select', opts:['No','Slightly','Noticeably','Severely pale gums or nails'], scores:[0,1,2,3]},
      {id:'breath', text:'Do you get breathless on mild exertion?', type:'select', opts:['Never','Only on heavy exercise','Climbing stairs','At rest or walking'], scores:[0,1,2,3]},
      {id:'veg',    text:'Are you strictly vegetarian or vegan?', type:'select', opts:['No, eat meat/fish','Vegetarian but eat eggs/dairy','Strict vegetarian','Strict vegan'], scores:[0,1,2,3]},
      {id:'preg',   text:'Are you currently pregnant or have been recently?', type:'select', opts:['No','Pregnant, taking iron supplements','Pregnant, no supplements','Recent delivery, no iron support'], scores:[0,0,2,3]},
      {id:'histo',  text:'Have you been told you have low haemoglobin before?', type:'select', opts:['No','Once, was treated','Yes, recurrent','Yes, ongoing untreated'], scores:[0,1,2,3]}
    ],
    maxScore:24,
    riskLevels:[
      {min:0,  max:5,  level:'Low Risk',      color:'#4ade80', badge:'badge-ok',   icon:'🟢'},
      {min:6,  max:12, level:'Moderate Risk',  color:'#facc15', badge:'badge-warn', icon:'🟡'},
      {min:13, max:18, level:'High Risk',      color:'#f97316', badge:'badge-alert',icon:'🟠'},
      {min:19, max:24, level:'Very High Risk', color:'#f87171', badge:'badge-alert',icon:'🔴'}
    ],
    factors:[
      {name:'Iron-Poor Diet',              impact:'High',   tip:'Iron deficiency is the cause of over 50% of anaemia in India. Eat spinach, lentils, jaggery.'},
      {name:'Heavy Menstrual Bleeding',    impact:'High',   tip:'Losing over 80ml blood per cycle depletes iron stores rapidly.'},
      {name:'Pregnancy',                   impact:'High',   tip:'Iron demand doubles in pregnancy. Supplementation is essential.'},
      {name:'Strict Vegetarian / Vegan',   impact:'Medium', tip:'Plant-based iron (non-haem) is absorbed at only 2–20% vs 15–35% from meat.'},
      {name:'Paleness and Fatigue',        impact:'Medium', tip:'These are the two most reliable clinical signs of significant anaemia.'},
      {name:'Previous Anaemia',            impact:'Medium', tip:'Recurrent anaemia suggests a structural issue or malabsorption needing investigation.'},
      {name:'Breathlessness',              impact:'Low',    tip:'Breathlessness at rest indicates haemoglobin likely below 7 g/dL — urgent care needed.'},
      {name:'Strict Vegan Diet',           impact:'Low',    tip:'Vitamin B12 deficiency from vegan diet causes megaloblastic anaemia separate from iron deficiency.'}
    ],
    prevention:['Eat iron-rich foods daily: spinach, lentils, jaggery, pomegranate','Take iron + folic acid supplements if pregnant or at risk','Consume Vitamin C with iron-rich meals to triple absorption','Annual CBC blood test to check haemoglobin levels','Cook in iron cookware — it actually increases dietary iron intake']
  }
];

var dpCurrentDisease = null;

function dpInit() {
  var grid = document.getElementById('dpDiseaseGrid');
  if (!grid) return;
  grid.innerHTML = '';
  for (var i = 0; i < DP_DISEASES.length; i++) {
    (function(idx) {
      var d = DP_DISEASES[idx];
      var btn = document.createElement('button');
      btn.style.cssText = 'padding:14px 8px;border-radius:14px;cursor:pointer;transition:all .2s;border:1.5px solid rgba(0,229,255,.2);text-align:center;background:rgba(0,229,255,.04);width:100%';
      btn.innerHTML = '<div style="font-size:26px;margin-bottom:6px">' + d.icon + '</div>' +
        '<div style="font-family:Cinzel Decorative,serif;font-size:10px;font-weight:700;letter-spacing:1px;color:' + d.color + '">' + d.label + '</div>';
      btn.onmouseover = function() { this.style.transform = 'translateY(-3px)'; this.style.boxShadow = '0 8px 24px ' + d.color + '33'; };
      btn.onmouseout  = function() { this.style.transform = ''; this.style.boxShadow = ''; };
      btn.onclick = function() { dpSelectDisease(idx); };
      grid.appendChild(btn);
    })(i);
  }
}

function dpSelectDisease(idx) {
  dpCurrentDisease = DP_DISEASES[idx];
  document.getElementById('dpStep1').classList.add('hidden');
  document.getElementById('dpStep2').classList.remove('hidden');
  document.getElementById('dpDiseaseTitle').textContent = dpCurrentDisease.icon + '  ' + dpCurrentDisease.label + ' Risk Assessment';

  var qHtml = '';
  for (var i = 0; i < dpCurrentDisease.questions.length; i++) {
    var q = dpCurrentDisease.questions[i];
    var opts = '';
    for (var j = 0; j < q.opts.length; j++) {
      opts += '<option value="' + j + '">' + q.opts[j] + '</option>';
    }
    qHtml += '<div style="padding:14px 16px;border-radius:14px;background:rgba(0,229,255,.04);border:1px solid rgba(0,229,255,.14)">' +
      '<p style="font-size:13px;font-weight:700;margin-bottom:8px;opacity:.9">' +
      '<span style="color:#00e5ff;font-weight:900;margin-right:6px">' + (i+1) + '.</span>' + q.text + '</p>' +
      '<select id="dpQ_' + q.id + '" class="inp" style="cursor:pointer">' + opts + '</select>' +
      '</div>';
  }
  document.getElementById('dpQuestions').innerHTML = qHtml;
  document.getElementById('dpStep2').scrollIntoView({behavior:'smooth', block:'start'});
}

function dpCalculate() {
  if (!dpCurrentDisease) return;
  var total = 0;
  var d = dpCurrentDisease;
  for (var i = 0; i < d.questions.length; i++) {
    var el = document.getElementById('dpQ_' + d.questions[i].id);
    if (el) total += d.questions[i].scores[parseInt(el.value)];
  }

  var pct = Math.round((total / d.maxScore) * 100);
  var rl = d.riskLevels[0];
  for (var i = 0; i < d.riskLevels.length; i++) {
    if (total >= d.riskLevels[i].min && total <= d.riskLevels[i].max) { rl = d.riskLevels[i]; break; }
  }

  var impactOrder = ['High','Medium','Low'];
  var fRows = '';
  for (var imp = 0; imp < impactOrder.length; imp++) {
    for (var fi = 0; fi < d.factors.length; fi++) {
      var f = d.factors[fi];
      if (f.impact !== impactOrder[imp]) continue;
      var ib = f.impact === 'High' ? 'badge-alert' : f.impact === 'Medium' ? 'badge-warn' : 'badge-ok';
      fRows += '<div style="padding:12px 14px;border-radius:12px;margin-bottom:8px;background:rgba(0,229,255,.04);border:1px solid rgba(0,229,255,.12)">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
        '<span style="font-size:13px;font-weight:700">' + f.name + '</span>' +
        '<span class="badge ' + ib + '" style="font-size:10px">' + f.impact + ' Impact</span></div>' +
        '<p style="font-size:12px;font-weight:600;opacity:.65;line-height:1.5">' + f.tip + '</p></div>';
    }
  }

  var prevRows = '';
  for (var pi = 0; pi < d.prevention.length; pi++) {
    prevRows += '<li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px">' +
      '<span style="color:#00e5ff;font-weight:900;flex-shrink:0">&#8594;</span>' +
      '<span style="font-size:13px;font-weight:600;opacity:.85">' + d.prevention[pi] + '</span></li>';
  }

  var dash = 283;
  var offset = dash - (dash * Math.min(pct,100) / 100);

  var resultDiv = document.getElementById('dpResult');
  resultDiv.innerHTML = '';

  // Score + badge row
  var topRow = document.createElement('div');
  topRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-bottom:20px';

  // SVG circle
  var svgWrap = document.createElement('div');
  svgWrap.style.cssText = 'position:relative;width:120px;height:120px;flex-shrink:0';
  svgWrap.innerHTML = '<svg viewBox="0 0 120 120" style="transform:rotate(-90deg);width:120px;height:120px">' +
    '<circle cx="60" cy="60" r="45" stroke="rgba(0,229,255,.1)" stroke-width="10" fill="none"/>' +
    '<circle cx="60" cy="60" r="45" stroke="' + rl.color + '" stroke-width="10" fill="none" ' +
    'stroke-dasharray="' + dash + '" stroke-dashoffset="' + offset + '" stroke-linecap="round" ' +
    'style="transition:stroke-dashoffset 1.5s ease"/></svg>' +
    '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
    '<span style="font-size:24px;font-weight:900;color:' + rl.color + '">' + pct + '%</span>' +
    '<span style="font-size:9px;font-weight:700;opacity:.5;letter-spacing:1px">RISK</span></div>';

  // Label
  var labelDiv = document.createElement('div');
  labelDiv.innerHTML = '<div style="font-size:18px;font-weight:900;color:' + rl.color + ';margin-bottom:4px">' + rl.icon + ' ' + rl.level + '</div>' +
    '<div style="font-size:13px;font-weight:600;opacity:.65;margin-bottom:10px">for ' + d.label + ' &middot; Score ' + total + ' / ' + d.maxScore + '</div>' +
    '<span class="badge ' + rl.badge + '">' + d.icon + ' ' + d.label + '</span>';

  topRow.appendChild(svgWrap);
  topRow.appendChild(labelDiv);
  resultDiv.appendChild(topRow);

  // Factors heading
  var fHead = document.createElement('p');
  fHead.style.cssText = 'font-size:10px;font-weight:700;letter-spacing:2px;opacity:.5;margin-bottom:10px;text-transform:uppercase';
  fHead.textContent = '⚠ Key Risk Factors for ' + d.label;
  resultDiv.appendChild(fHead);

  // Factors
  var fContainer = document.createElement('div');
  fContainer.innerHTML = fRows;
  resultDiv.appendChild(fContainer);

  // Prevention box
  var prevBox = document.createElement('div');
  prevBox.style.cssText = 'margin-top:16px;padding:16px;border-radius:14px;background:rgba(74,222,128,.06);border:1px solid rgba(74,222,128,.2)';
  prevBox.innerHTML = '<p style="font-size:10px;font-weight:700;letter-spacing:2px;color:#4ade80;margin-bottom:10px;text-transform:uppercase">&#10003; Prevention Steps</p>' +
    '<ul style="list-style:none;padding:0;margin:0">' + prevRows + '</ul>';
  resultDiv.appendChild(prevBox);

  // Disclaimer
  var disc = document.createElement('p');
  disc.style.cssText = 'font-size:10px;font-weight:700;opacity:.3;margin-top:12px';
  disc.textContent = 'This prediction is based on known epidemiological risk factors. It is not a clinical diagnosis. Please consult a doctor for confirmation.';
  resultDiv.appendChild(disc);

  document.getElementById('dpStep2').classList.add('hidden');
  document.getElementById('dpStep3').classList.remove('hidden');
  document.getElementById('dpStep3').scrollIntoView({behavior:'smooth', block:'start'});
  showToast('Risk analysis complete!');
}

function dpReset() {
  dpCurrentDisease = null;
  document.getElementById('dpStep1').classList.remove('hidden');
  document.getElementById('dpStep2').classList.add('hidden');
  document.getElementById('dpStep3').classList.add('hidden');
  document.getElementById('dpResult').innerHTML = '';
}

function showToast(msg, isErr) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = isErr ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : 'linear-gradient(135deg,#00e5ff,#0ea5e9)';
  t.style.color = isErr ? '#fff' : '#030712';
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(function() { t.classList.remove('show'); }, 3200);
}

var chatOpen = false;
var chatHistory = [];
var chatFirstOpen = true;
var chatLastFeature = '';

function toggleChat() {
  chatOpen = !chatOpen;
  var panel = document.getElementById('chatPanel');
  var badge = document.getElementById('chatBadge');
  if (chatOpen) {
    panel.classList.add('open');
    badge.style.display = 'none';
    if (chatFirstOpen) {
      chatFirstOpen = false;
      setTimeout(function() {
        addChatBubble('ai', 'Namaste! 🙏 I\'m your <strong>Care AI Health Guardian</strong>. I\'m here to help you with:\n\n• 🩺 Understanding symptoms & conditions\n• 💊 Medicine suggestions for common illnesses\n• ⚠️ Knowing when to see a doctor\n• 🏥 Finding nearby hospitals\n• 📖 Using this Care AI platform\n\nHow can I help you today? Tell me your symptoms or ask me anything!');
      }, 300);
    }
    setTimeout(function() {
      document.getElementById('chatInput').focus();
      scrollChatBottom();
    }, 400);
  } else {
    panel.classList.remove('open');
  }
}

function addChatBubble(role, html) {
  var msgs = document.getElementById('chatMessages');
  var div = document.createElement('div');
  div.className = 'cb ' + (role === 'ai' ? 'cb-ai' : 'cb-user');
  // Convert plain newlines to <br> and preserve formatting
  var formatted = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/• /g, '• ');
  div.innerHTML = formatted;
  msgs.appendChild(div);
  scrollChatBottom();
  return div;
}

function addTypingIndicator() {
  var msgs = document.getElementById('chatMessages');
  var div = document.createElement('div');
  div.className = 'cb cb-ai';
  div.id = 'typingIndicator';
  div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  msgs.appendChild(div);
  scrollChatBottom();
}

function removeTypingIndicator() {
  var el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function scrollChatBottom() {
  var msgs = document.getElementById('chatMessages');
  setTimeout(function() { msgs.scrollTop = msgs.scrollHeight; }, 80);
}

function sendQuick(msg) {
  document.getElementById('chatInput').value = msg;
  sendChatMessage();
}

function chatKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

function autoResizeChat(el) {
  el.style.height = '42px';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

function containsAny(t, arr) { var x = t.toLowerCase(); for (var i = 0; i < arr.length; i++) if (x.indexOf(arr[i]) !== -1) return true; return false; }

function detectIntent(msg) {
  var severe = ['chest pain','breathless','shortness of breath','breathing issue','difficulty breathing','cannot breathe','faint','fainted','unconscious','blue lips','severe bleeding','seizure','stroke','heart attack'];
  if (containsAny(msg, severe)) return 'emergency';
  var symptomWords = ['fever','cough','cold','headache','pain','ache','nausea','vomiting','diarrhea','diarrhoea','rash','dizziness','sore throat','fatigue','body pain','body ache','chills'];
  if (containsAny(msg, symptomWords) || msg.toLowerCase().indexOf('i have') !== -1) return 'symptoms';
  var riskWords = ['risk','chance','likelihood','probability','predict','prediction','at risk','risk of'];
  if (containsAny(msg, riskWords)) return 'risk';
  var medWords = ['medicine','medication','tablet','dose','reminder','remind','pill','take my'];
  if (containsAny(msg, medWords)) return 'medicine';
  return 'general';
}

function actionLink(label, action) {
  return '<span onclick="' + action + '" style="color:#00e5ff;cursor:pointer;font-weight:700;text-decoration:underline">' + label + ' →</span>';
}

function craftReply(msg) {
  var intent = detectIntent(msg);
  var lines = [];
  var feature = '';
  if (intent === 'emergency') {
    lines.push('These symptoms can be serious.');
    lines.push('Please consult a doctor or visit a nearby hospital.');
    lines.push(actionLink('Find Nearby Hospitals', "document.getElementById('hospitals').scrollIntoView({behavior:'smooth'}); toggleChat();"));
    lines.push('This is not a medical diagnosis.');
    feature = 'hospitals';
  } else if (intent === 'symptoms') {
    lines.push('I can help check your symptoms and guide next steps.');
    lines.push('How long have you had them?');
    lines.push(actionLink(chatLastFeature==='symptoms'?'Open now':'Open Symptom Analyzer', "document.getElementById('symptoms').scrollIntoView({behavior:'smooth'}); toggleChat();"));
    feature = 'symptoms';
  } else if (intent === 'risk') {
    lines.push('We can estimate your disease risk with a quick quiz.');
    lines.push('Which condition do you want to check?');
    lines.push(actionLink(chatLastFeature==='diseasePred'?'Open now':'Try Risk Predictor', "document.getElementById('diseasePred').scrollIntoView({behavior:'smooth'}); toggleChat();"));
    lines.push('This is not a medical diagnosis.');
    feature = 'diseasePred';
  } else if (intent === 'medicine') {
    lines.push('Medicine reminders help you take doses on time.');
    lines.push('Do you want to add a reminder now?');
    lines.push(actionLink(chatLastFeature==='medicines'?'Open now':'Open Medicine Reminder', "openModal('medModal'); toggleChat();"));
    feature = 'medicines';
  } else {
    var wantsScore = containsAny(msg, ['score','assessment','assess','check health','health check']);
    lines.push('Happy to help with general health questions.');
    lines.push('Is there a specific goal — sleep, diet, or exercise?');
    if (wantsScore) {
      lines.push(actionLink(chatLastFeature==='risk'?'Open now':'Open Health Risk Assessment', "document.getElementById('risk').scrollIntoView({behavior:'smooth'}); toggleChat();"));
      feature = 'risk';
    } else {
      lines.push(actionLink('Explore Daily Tips', "document.getElementById('tips').scrollIntoView({behavior:'smooth'}); toggleChat();"));
      feature = 'tips';
    }
  }
  return { text: lines.join('\n'), feature: feature };
}

async function sendChatMessage() {
  var input = document.getElementById('chatInput');
  var msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  input.style.height = '42px';

  var sendBtn = document.getElementById('chatSend');
  sendBtn.disabled = true;

  addChatBubble('user', msg);

  chatHistory.push({ role: 'user', content: msg });

  addTypingIndicator();

  var out = craftReply(msg);
  removeTypingIndicator();
  chatHistory.push({ role: 'assistant', content: out.text });
  addChatBubble('ai', out.text);
  chatLastFeature = out.feature || chatLastFeature;

  sendBtn.disabled = false;
  scrollChatBottom();
}

setTimeout(function() {
  if (!chatOpen) {
    var badge = document.getElementById('chatBadge');
    badge.style.display = 'flex';
  }
}, 3000);
