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

async function analyzeSymptoms() {
  var chips = [];
  document.querySelectorAll('.sym-chip.on').forEach(function(c) { chips.push(c.textContent.trim()); });
  var text = document.getElementById('symText').value.trim();
  if (!chips.length && !text && !scanFile) { showToast('Select symptoms or describe them first!', true); return; }

  var btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px"><span style="width:16px;height:16px;border:2.5px solid #030712;border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite;display:inline-block"></span>ANALYZING WITH AI...</span>';

  var sym = chips.concat(text ? [text] : []).join(', ') || 'Image scan uploaded';
  var now = new Date().toLocaleString('en-IN');

  // Show loading skeleton
  document.getElementById('symResult').classList.remove('hidden');
  document.getElementById('symResultContent').innerHTML =
    '<div style="display:flex;flex-direction:column;gap:10px;padding:8px 0">' +
    '<div style="height:14px;border-radius:8px;background:rgba(0,229,255,.1);width:60%;animation:pulse 1.2s ease-in-out infinite"></div>' +
    '<div style="height:14px;border-radius:8px;background:rgba(0,229,255,.08);width:80%;animation:pulse 1.2s ease-in-out infinite .15s"></div>' +
    '<div style="height:14px;border-radius:8px;background:rgba(0,229,255,.06);width:70%;animation:pulse 1.2s ease-in-out infinite .3s"></div>' +
    '<div style="height:14px;border-radius:8px;background:rgba(0,229,255,.08);width:90%;animation:pulse 1.2s ease-in-out infinite .45s"></div>' +
    '</div>';
  document.getElementById('symResult').scrollIntoView({behavior:'smooth', block:'start'});

  var ANALYSIS_PROMPT = `You are a medical AI assistant for Care AI India. Analyze the following patient symptoms and provide a structured health report.

Patient Symptoms: ${sym}

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "condition": "Most likely condition name",
  "severity": "Low|Moderate|High",
  "description": "Brief 1-2 sentence description of the condition",
  "advice": ["advice 1", "advice 2", "advice 3", "advice 4", "advice 5"],
  "medicines": [
    {"name": "Medicine name (Indian brand if applicable)", "dosage": "dose & frequency", "purpose": "what it treats", "type": "OTC|Prescription"},
    {"name": "Medicine 2", "dosage": "dose & frequency", "purpose": "what it treats", "type": "OTC|Prescription"}
  ],
  "doctor_urgency": "Routine|Soon|Urgent|Emergency",
  "doctor_reason": "Clear reason why and when to see a doctor",
  "warning_signs": ["sign that needs immediate attention 1", "sign 2"],
  "consult": "One sentence on when specifically to consult a doctor"
}

Rules:
- Suggest 3-5 relevant Indian medicines (e.g. Crocin, Dolo 650, Pan-D, Sinarest, Cetirizine, Azithral, etc.)
- doctor_urgency: Emergency=go to ER now, Urgent=within 24h, Soon=within 3 days, Routine=within 2 weeks
- Always be medically accurate for Indian patients
- advice should be practical home care steps`;

  try {
    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: ANALYSIS_PROMPT }]
      })
    });

    var data = await response.json();
    var raw = data.content && data.content[0] ? data.content[0].text : '';

    // Strip possible markdown fences
    raw = raw.replace(/```json|```/g, '').trim();
    var res = JSON.parse(raw);

    lastResult = {
      time: now,
      symptoms: sym,
      condition: res.condition,
      severity: res.severity,
      description: res.description || '',
      advice: res.advice || [],
      medicines: res.medicines || [],
      doctor_urgency: res.doctor_urgency || 'Routine',
      doctor_reason: res.doctor_reason || '',
      warning_signs: res.warning_signs || [],
      consult: res.consult || ''
    };

  } catch(err) {
    // Fallback to AI_POOL if API fails
    var fallback = AI_POOL[Math.floor(Math.random() * AI_POOL.length)];
    lastResult = {
      time: now, symptoms: sym,
      condition: fallback.cond, severity: fallback.severity,
      description: '', advice: fallback.advice,
      medicines: [], doctor_urgency: 'Routine',
      doctor_reason: '', warning_signs: [],
      consult: fallback.consult
    };
    showToast('Using offline analysis mode', true);
  }

  document.getElementById('symResultContent').innerHTML = buildResultHTML(lastResult);
  analysisHistory.unshift(lastResult);
  if (analysisHistory.length > 30) analysisHistory.pop();
  localStorage.setItem('careai_history', JSON.stringify(analysisHistory));
  renderHistory();
  btn.disabled = false;
  btn.textContent = 'ANALYZE WITH AI';
  showToast('AI Analysis complete!');
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
function showToast(msg, isErr) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = isErr ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : 'linear-gradient(135deg,#00e5ff,#0ea5e9)';
  t.style.color = isErr ? '#fff' : '#030712';
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(function() { t.classList.remove('show'); }, 3200);
}

// ============================================================
//  CARE AI CHATBOT ENGINE
// ============================================================
var chatOpen = false;
var chatHistory = [];
var chatFirstOpen = true;

var GUARDIAN_SYSTEM = `You are CARE AI Health Guardian — an intelligent, empathetic AI health assistant embedded in the Care AI India health platform. Your role is:

1. HEALTH GUIDE: Help users understand symptoms, conditions, and general health information.
2. MEDICINE ADVISOR: When a user describes symptoms or a disease, ALWAYS suggest common over-the-counter or prescription medicines used for that condition (with dosage guidance where appropriate). Clearly label these as general suggestions and advise consulting a pharmacist or doctor for final prescription.
3. DOCTOR REFERRAL: ALWAYS clearly indicate when a symptom or condition requires urgent or scheduled doctor consultation. Use phrases like "⚠️ CONSULT A DOCTOR" with clear urgency levels (Urgent/Routine).
4. WEBSITE GUIDE: Help users navigate the Care AI platform — Symptom Analyzer, Medicine Reminders, Risk Assessment, Daily Tips, Nearby Hospitals, and Health History sections.
5. HEALTH GUARDIAN: Proactively share relevant health tips, reminders, and wellness advice in a warm, caring tone.

RESPONSE FORMAT RULES:
- Use clear sections with emojis as headers (💊 Medicines, ⚠️ Doctor Visit, 💡 Tips, 🏥 Navigate to).
- For medicines: list name, common dosage, and purpose. Add "⚠️ Consult doctor before use" at end.
- For doctor referral urgency: 🔴 Urgent (go today/ER), 🟡 Soon (within 1-3 days), 🟢 Routine (within 1-2 weeks).
- Keep responses concise but complete. Use bullet points.
- Always be warm, caring, and encouraging — like a knowledgeable health friend.
- Context: User is in India. Suggest medicines available in India. Use Indian brand names where helpful (e.g., Crocin, Dolo, Pan-D, Azithral).
- Never diagnose definitively. Always frame as "commonly associated with" or "could indicate".
- If user seems in serious distress, immediately direct them to emergency services (112 in India).`;

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

function getUserContext() {
  // Gather context from the page to give AI relevant info
  var ctx = '';
  try {
    var meds = JSON.parse(localStorage.getItem('careai_medicines') || '[]');
    if (meds.length) {
      ctx += '\n\nUser\'s current medicines in Care AI: ';
      meds.forEach(function(m) { ctx += m.name + ' (' + (m.dosage || 'as prescribed') + '), '; });
    }
    var hist = JSON.parse(localStorage.getItem('careai_history') || '[]');
    if (hist.length) {
      var last = hist[hist.length - 1];
      ctx += '\n\nUser\'s last symptom analysis: Symptoms: ' + last.symptoms + ' | Condition: ' + last.condition + ' | Severity: ' + last.severity;
    }
    var profile = JSON.parse(localStorage.getItem('careai_profile') || '{}');
    if (profile.name) ctx += '\n\nUser name: ' + profile.name;
  } catch(e) {}
  return ctx;
}

async function sendChatMessage() {
  var input = document.getElementById('chatInput');
  var msg = input.value.trim();
  if (!msg) return;

  // Clear input
  input.value = '';
  input.style.height = '42px';

  // Disable send
  var sendBtn = document.getElementById('chatSend');
  sendBtn.disabled = true;

  // Add user bubble
  addChatBubble('user', msg);

  // Push to history
  chatHistory.push({ role: 'user', content: msg });

  // Show typing
  addTypingIndicator();

  // Build system prompt with user context
  var systemWithContext = GUARDIAN_SYSTEM + getUserContext();

  try {
    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemWithContext,
        messages: chatHistory.slice(-10) // keep last 10 for context window
      })
    });

    var data = await response.json();
    removeTypingIndicator();

    var reply = '';
    if (data.content && data.content[0]) {
      reply = data.content[0].text || '';
    } else if (data.error) {
      reply = '⚠️ Sorry, I encountered an issue. Please try again in a moment.';
    }

    // Push AI reply to history
    chatHistory.push({ role: 'assistant', content: reply });

    // Display
    addChatBubble('ai', reply);

    // If reply mentions medicines, offer to add them
    if (reply.toLowerCase().includes('medicine') || reply.toLowerCase().includes('tablet') || reply.toLowerCase().includes('capsule')) {
      setTimeout(function() {
        var hint = document.createElement('div');
        hint.className = 'cb cb-ai';
        hint.style.fontSize = '12px';
        hint.style.opacity = '0';
        hint.style.animation = 'bubbleIn .3s .15s forwards';
        hint.innerHTML = '💊 Want to set a reminder for any of these medicines? <span onclick="openModal(\'medModal\'); toggleChat();" style="color:#00e5ff;cursor:pointer;font-weight:700;text-decoration:underline">Open Medicine Reminders →</span>';
        document.getElementById('chatMessages').appendChild(hint);
        scrollChatBottom();
      }, 600);
    }

    // If reply mentions hospital or emergency
    if (reply.toLowerCase().includes('hospital') || reply.toLowerCase().includes('emergency') || reply.includes('🔴')) {
      setTimeout(function() {
        var hint = document.createElement('div');
        hint.className = 'cb cb-ai';
        hint.style.fontSize = '12px';
        hint.style.opacity = '0';
        hint.style.animation = 'bubbleIn .3s .15s forwards';
        hint.innerHTML = '🏥 <span onclick="document.getElementById(\'hospitals\').scrollIntoView({behavior:\'smooth\'}); toggleChat();" style="color:#00e5ff;cursor:pointer;font-weight:700;text-decoration:underline">Find Nearby Hospitals →</span>';
        document.getElementById('chatMessages').appendChild(hint);
        scrollChatBottom();
      }, 800);
    }

  } catch(err) {
    removeTypingIndicator();
    addChatBubble('ai', '⚠️ Connection issue. Please check your internet and try again.');
  }

  sendBtn.disabled = false;
  scrollChatBottom();
}

// Show badge after 3 seconds to invite user
setTimeout(function() {
  if (!chatOpen) {
    var badge = document.getElementById('chatBadge');
    badge.style.display = 'flex';
  }
}, 3000);
