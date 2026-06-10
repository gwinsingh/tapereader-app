import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  Dumbbell, Flame, Trophy, Activity, X, Youtube, ChevronRight,
  Beef, Plus, Scale, Calendar as CalIcon, Target, BookOpen, Heart,
  Users, Pencil, Check,
} from "lucide-react";

/* ---- STORAGE
   shared:true  -> Cloudflare KV via Pages Function (cloud, cross-device)
   shared:false -> per-device localStorage (only the "who am I here" pointer) ---- */
const API = "/4-week-challenge/api/kv";
const WRITE_KEY = import.meta.env.VITE_WRITE_KEY || "";

const LS = {
  get(k) { try { const v = localStorage.getItem(k); return v == null ? null : { key: k, value: v }; } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return { key: k, value: v }; } catch { return null; } },
};
const remote = {
  async get(k) {
    try {
      const r = await fetch(`${API}?key=${encodeURIComponent(k)}`);
      if (!r.ok) return null;
      const d = await r.json();
      return d && d.value != null ? { key: k, value: d.value } : null;
    } catch { return null; }
  },
  async set(k, v) {
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-write-key": WRITE_KEY },
        body: JSON.stringify({ key: k, value: v }),
      });
      return r.ok ? { key: k, value: v } : null;
    } catch { return null; }
  },
};
const store = {
  async get(k, shared) { return shared ? remote.get(k) : LS.get(k); },
  async set(k, v, shared) { return shared ? remote.set(k, v) : LS.set(k, v); },
};

const blankRecord = () => ({ bodyweight: 175, calTarget: 2200, caloriesLogged: 0, weighIns: [], strength: [] });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 14) || "lifter";
const yt = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " proper form technique")}`;

const FIN_C1 = [
  { name: "Leg Extension", scheme: "3 × 12–15", tip: "Quads. Slow tempo, squeeze hard at the top, control the descent. Don't kick the weight up.", q: "leg extension machine" },
  { name: "Calf Raise", scheme: "3 × 12–15", tip: "Calves. Full stretch at the bottom, pause and squeeze at the top. No bouncing.", q: "standing calf raise" },
  { name: "Cable Fly", scheme: "3 × 12–15", tip: "Chest. Keep a soft bend in the elbows, hug the reps in, feel the stretch across the pecs.", q: "cable chest fly" },
];
const FIN_C2 = [
  { name: "Face Pull", scheme: "3 × 12–15", tip: "Rear delts + upper back. Pull rope to your forehead, elbows high, rotate hands out at the end.", q: "cable face pull" },
  { name: "Tricep Pushdown", scheme: "3 × 12–15", tip: "Triceps. Pin the elbows to your sides, full lockout, slow negative.", q: "tricep pushdown cable" },
  { name: "Hammer Curl", scheme: "3 × 12–15", tip: "Biceps + forearms. Neutral grip, no swinging, full range top to bottom.", q: "dumbbell hammer curl" },
];
const FIN_ABS = [
  { name: "Plank", scheme: "3 × 30–45s", tip: "Brace abs and squeeze glutes, straight line head to heels. Don't let the hips sag or pike.", q: "plank abs" },
  { name: "Leg Raise", scheme: "3 × 12–15", tip: "Lower abs. Control the descent, keep the lower back glued to the floor throughout.", q: "lying leg raise abs" },
  { name: "Crunch", scheme: "3 × 15", tip: "Abs. Curl the ribcage toward the pelvis, slow and controlled, never pull on your neck.", q: "crunch abs" },
];

const SCHEDULE = [
  { day: "MON", title: "Lower + Push", intensity: "high", warmup: true, finishers: FIN_C1, note: "Heavy compound day. Warm up thoroughly and leave 1–2 reps in the tank.", exercises: [
    { name: "Back Squat", scheme: "4 × 5", tip: "Brace your core, drive knees out, keep the bar over mid-foot. Hit at least parallel.", q: "barbell back squat" },
    { name: "Bench Press", scheme: "4 × 6", tip: "Shoulder blades pinched and down, slight arch, bar to lower chest, elbows ~45°.", q: "barbell bench press" },
    { name: "Overhead Press", scheme: "3 × 8", tip: "Squeeze glutes, bar travels straight up past the chin, finish with biceps by ears.", q: "standing overhead press" },
  ]},
  { day: "TUE", title: "Pull + Hinge", intensity: "high", warmup: true, finishers: FIN_C2, note: "Posterior chain focus. Reset every deadlift rep for a tight setup.", exercises: [
    { name: "Deadlift", scheme: "3 × 5", tip: "Hips between knee and shoulder height, lats engaged, push the floor away. Flat back throughout.", q: "conventional deadlift" },
    { name: "Barbell Row", scheme: "4 × 8", tip: "Hinge to ~45°, pull to lower ribs, drive elbows back, avoid yanking with momentum.", q: "barbell bent over row" },
    { name: "Pull-Ups", scheme: "3 × AMRAP", tip: "Full hang to chin over bar. Use a band or negatives if you can't hit reps yet.", q: "pull up" },
  ]},
  { day: "WED", title: "Active Recovery", intensity: "recovery", note: "Keep heart rate easy (Zone 2). Movement, not punishment — this aids recovery.", exercises: [
    { name: "Incline Walk", scheme: "30–40 min", tip: "Treadmill at 8–12% incline, conversational pace. Great low-impact calorie burn.", q: "incline treadmill walk zone 2 cardio" },
    { name: "Easy Cycling", scheme: "25–35 min", tip: "Steady spin, RPE 4–5/10. Flushes the legs without adding fatigue.", q: "steady state cycling zone 2" },
    { name: "Mobility Flow", scheme: "10–15 min", tip: "Hips, t-spine, shoulders. Prep the joints you load hardest on lift days.", q: "full body mobility routine" },
  ]},
  { day: "THU", title: "Lower + Push", intensity: "high", progressive: true, warmup: true, finishers: FIN_C1, note: "Repeat of Monday — add 5–10 lb to any lift where you completed all reps last session.", exercises: [
    { name: "Back Squat", scheme: "4 × 5  ↑", tip: "Same technique as Monday. Add load only if your last sets felt strong and clean.", q: "barbell back squat" },
    { name: "Bench Press", scheme: "4 × 6  ↑", tip: "Progress the bar by 5 lb when you hit all reps two sessions running.", q: "barbell bench press" },
    { name: "Overhead Press", scheme: "3 × 8  ↑", tip: "Smallest jumps here — micro-plates if you have them. Strict, no leg drive.", q: "standing overhead press" },
  ]},
  { day: "FRI", title: "Pull + Hinge", intensity: "high", progressive: true, warmup: true, finishers: FIN_C2, note: "Repeat of Tuesday — add weight where last week's reps were solid. Then deload your grip into the weekend.", exercises: [
    { name: "Deadlift", scheme: "3 × 5  ↑", tip: "Biggest weekly jump can live here (10 lb). Keep the bar close and the back flat.", q: "conventional deadlift" },
    { name: "Barbell Row", scheme: "4 × 8  ↑", tip: "Add load only if you can keep the torso angle honest. No cheat-rowing.", q: "barbell bent over row" },
    { name: "Pull-Ups", scheme: "3 × AMRAP", tip: "Add reps or add weight via a belt once bodyweight sets exceed ~10.", q: "weighted pull up" },
  ]},
  { day: "SAT", title: "Isolation / HIIT", intensity: "optional", badge: "OPTIONAL", warmup: true, finishers: FIN_ABS, note: "Optional. Pick light isolation work OR a 15–20 min HIIT finisher — whatever you've got left. Skip it guilt-free if you're beat.", exercises: [
    { name: "Hanging Leg Raise", scheme: "3 × 12", tip: "Abs. Control the descent, avoid swinging. Knee raises if straight legs are too hard.", q: "hanging leg raise abs" },
    { name: "Dumbbell Curl", scheme: "3 × 12", tip: "Biceps. Elbows pinned to your sides, no swinging, full stretch at the bottom.", q: "dumbbell bicep curl" },
    { name: "Tricep Pushdown", scheme: "3 × 12", tip: "Triceps. Lock the elbows in place, full extension, squeeze at the bottom.", q: "tricep pushdown cable" },
    { name: "Lateral Raise", scheme: "3 × 15", tip: "Side delts. Lead with the elbows, slight forward lean, light weight + clean reps.", q: "dumbbell lateral raise" },
  ]},
  { day: "SUN", title: "Rest", intensity: "rest", badge: "MANDATORY", note: "Mandatory rest. No training today — sleep, eat your protein, and meal-prep the week. Recovery is when you actually grow.", exercises: [] },
];

const ALL_LIFTS = [
  { key: "Squat", label: "Squat", color: "#ff5630", group: "compound" },
  { key: "Bench", label: "Bench", color: "#37c5f0", group: "compound" },
  { key: "Deadlift", label: "Deadlift", color: "#c8ff00", group: "compound" },
  { key: "OHP", label: "OHP", color: "#ff8a3d", group: "compound" },
  { key: "Row", label: "Row", color: "#ff5c9d", group: "compound" },
  { key: "PullUp", label: "Pull-Up", color: "#a78bfa", group: "compound" },
  { key: "FacePull", label: "Face Pull", color: "#22d3ee", group: "accessory" },
  { key: "TricepPushdown", label: "Tricep Pushdown", color: "#f472b6", group: "accessory" },
  { key: "BicepCurl", label: "Bicep Curl", color: "#fbbf24", group: "accessory" },
  { key: "LegExtension", label: "Leg Extension", color: "#34d399", group: "accessory" },
  { key: "CalfRaise", label: "Calf Raise", color: "#fb923c", group: "accessory" },
  { key: "CableFly", label: "Cable Fly", color: "#c084fc", group: "accessory" },
];
const LIFT_KEYS = ALL_LIFTS.map(l => l.key);

const INTENSITY = {
  high:     { label: "Heavy",    color: "#ff5630" },
  recovery: { label: "Recovery", color: "#37c5f0" },
  optional: { label: "Optional", color: "#ff5c9d" },
  rest:     { label: "Rest",     color: "#52525b" },
};

const RESOURCES = [
  { label: "Compound lift fundamentals", q: "compound lifts for beginners explained" },
  { label: "Progressive overload guide", q: "progressive overload explained" },
  { label: "Protein intake for muscle", q: "how much protein to build muscle explained" },
  { label: "Eating in a calorie deficit", q: "calorie deficit fat loss explained" },
  { label: "Isolation & HIIT finishers", q: "isolation exercises and HIIT for muscle" },
  { label: "Warming up before lifting", q: "how to warm up before lifting weights" },
];

function StatCard({ icon: Icon, label, value, unit, accent }) {
  const showUnit = unit && value !== "—";
  return (
    <div className="stat">
      <div className="stat-top"><Icon size={16} strokeWidth={2.5} style={{ color: accent }} /><span className="mono stat-label">{label}</span></div>
      <div className="stat-val">{value}{showUnit && <span className="stat-unit">{unit}</span>}</div>
    </div>
  );
}
const Bar = ({ pct, color }) => (
  <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }} /></div>
);
function SectionHead({ icon: Icon, kicker, title }) {
  return (
    <div className="sec-head">
      <span className="sec-kicker mono"><Icon size={13} /> {kicker}</span>
      <h2 className="sec-title">{title}</h2>
    </div>
  );
}
const TT = { background: "#161618", border: "1px solid #2b2b30", borderRadius: 8, fontSize: 12, color: "#f4f4f2" };

function WarmUp({ firstLift, isLift }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState({});
  const items = [
    { k: "cardio", label: "5 min light cardio", detail: "Raise the body temp — bike, row, or a brisk incline walk." },
    { k: "dynamic", label: "Dynamic stretching", detail: "Leg swings · hip circles · arm circles · bodyweight squats." },
    { k: "activation", label: "Activation", detail: "Glute bridges · band pull-aparts." },
    { k: "ramp", label: isLift ? "2 ramp-up sets @ ~50%" : "Light ramp-up", detail: isLift ? `Two warm-up sets of ${firstLift || "your first lift"} at about 50% of your working weight.` : "A light set or two of your first movement to groove the pattern." },
  ];
  const toggle = (k) => setDone((p) => ({ ...p, [k]: !p[k] }));
  const count = items.filter((i) => done[i.k]).length;
  return (
    <div className="warm">
      <button className="warm-toggle" onClick={() => setOpen(!open)}>
        <Flame size={14} style={{ color: "#ff8a3d" }} />
        <span className="mono">WARM-UP</span>
        <span className="warm-sub">{count}/{items.length} done · ~5 min</span>
        <ChevronRight size={16} className={`fin-chev ${open ? "on" : ""}`} />
      </button>
      {open && (
        <div className="warm-list">
          {items.map((i) => (
            <button key={i.k} className={`warm-item ${done[i.k] ? "checked" : ""}`} onClick={() => toggle(i.k)}>
              <span className="warm-check">{done[i.k] && <Check size={13} strokeWidth={3} />}</span>
              <span className="warm-text">
                <span className="warm-label">{i.label}</span>
                <span className="warm-detail">{i.detail}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("loading");
  const [roster, setRoster] = useState([]);
  const [data, setData] = useState({});
  const [meId, setMeId] = useState(null);

  useEffect(() => {
    (async () => {
      const got = await store.get("roster", true);
      const r = got ? JSON.parse(got.value) : [];
      const d = {};
      for (const a of r) { const rec = await store.get(`athlete:${a.id}`, true); d[a.id] = rec ? JSON.parse(rec.value) : blankRecord(); }
      const meGot = await store.get("me", false);
      const me = meGot ? meGot.value : null;
      setRoster(r); setData(d);
      if (r.length === 0) setPhase("setup");
      else if (me && r.find((x) => x.id === me)) { setMeId(me); setPhase("dash"); }
      else setPhase("picker");
    })();
  }, []);

  const updateMe = useCallback((updater) => {
    setData((prev) => {
      const cur = prev[meId] || blankRecord();
      const next = updater(cur);
      store.set(`athlete:${meId}`, JSON.stringify(next), true);
      return { ...prev, [meId]: next };
    });
  }, [meId]);

  const pickMe = (id) => { setMeId(id); store.set("me", id, false); setPhase("dash"); };

  if (phase === "loading") return <Shell><div className="center mono">LOADING…</div></Shell>;
  if (phase === "setup")  return <Setup roster={roster} onSave={(r) => { setRoster(r); setPhase("picker"); }} setData={setData} />;
  if (phase === "picker") return <Picker roster={roster} data={data} onPick={pickMe} onEdit={() => setPhase("setup")} />;
  return <Dashboard roster={roster} data={data} meId={meId} updateMe={updateMe} onSwitch={pickMe} />;
}

function Shell({ children }) { return <div className="root"><style>{CSS}</style>{children}</div>; }

function Setup({ roster, onSave, setData }) {
  const [names, setNames] = useState(() => { const b = ["","","",""]; roster.forEach((r,i) => { if(i<4) b[i]=r.name; }); return b; });
  const save = async () => {
    const clean = names.map(n=>n.trim()).filter(Boolean); if(!clean.length) return;
    const seen = {};
    const r = clean.map(name => { let id=slug(name); while(seen[id]) id+=Math.floor(Math.random()*9); seen[id]=1; return {id,name}; });
    await store.set("roster", JSON.stringify(r), true);
    const d = {};
    for (const a of r) { const ex = await store.get(`athlete:${a.id}`,true); d[a.id]=ex?JSON.parse(ex.value):blankRecord(); if(!ex) await store.set(`athlete:${a.id}`,JSON.stringify(d[a.id]),true); }
    setData(d); onSave(r);
  };
  return (
    <Shell><div className="gate">
      <div className="hero-tag mono"><Users size={13} /> SHARED CREW · ONE-TIME SETUP</div>
      <h1 className="gate-title">SET UP<br />YOUR CREW</h1>
      <p className="gate-sub">Add the three of you. Everyone who opens this link shares the same roster and can see each other's progress.</p>
      <div className="gate-fields">{[0,1,2,3].map(i=>(
        <input key={i} className="gate-input" placeholder={`Lifter ${i+1}${i>0?" (optional)":""}`} value={names[i]} onChange={e=>setNames(p=>p.map((v,j)=>j===i?e.target.value:v))} />
      ))}</div>
      <button className="btn full big" onClick={save}>Lock in the crew <ChevronRight size={18} /></button>
      <p className="gate-foot mono">SHARED · VISIBLE TO ANYONE WITH THE LINK</p>
    </div></Shell>
  );
}

function Picker({ roster, data, onPick, onEdit }) {
  return (
    <Shell><div className="gate">
      <div className="hero-tag mono"><Dumbbell size={13} /> 4-WEEK STRENGTH + CUT</div>
      <h1 className="gate-title">WHO'S<br />TRAINING?</h1>
      <p className="gate-sub">Tap your name. This device will remember you next time.</p>
      <div className="picker-list">{roster.map(a => {
        const rec = data[a.id]||blankRecord();
        const w = rec.weighIns?.length ? rec.weighIns[rec.weighIns.length-1].weight : rec.bodyweight;
        return (
          <button key={a.id} className="picker-card" onClick={()=>onPick(a.id)}>
            <span className="picker-avatar mono">{a.name.slice(0,2).toUpperCase()}</span>
            <span className="picker-info"><span className="picker-name">{a.name}</span><span className="picker-meta mono">{w} lb · {rec.weighIns?.length||0} weigh-ins</span></span>
            <ChevronRight size={20} className="picker-chev" />
          </button>
        );
      })}</div>
      <button className="link-btn mono" onClick={onEdit}><Pencil size={12} /> EDIT CREW</button>
    </div></Shell>
  );
}

function Dashboard({ roster, data, meId, updateMe, onSwitch }) {
  const me = data[meId] || blankRecord();
  const [openDay, setOpenDay] = useState(null);
  const [activeEx, setActiveEx] = useState(null);
  const [calDay, setCalDay] = useState(null);
  const [finOpen, setFinOpen] = useState(null);
  const [weighInput, setWeighInput] = useState("");
  const [calInput, setCalInput] = useState("");
  const [liftInput, setLiftInput] = useState({});
  const meName = roster.find(r=>r.id===meId)?.name || "Lifter";

  const proteinLow = Math.round(me.bodyweight * 0.8);
  const proteinHigh = Math.round(me.bodyweight * 1);
  const fatG = Math.round((me.calTarget * 0.25) / 9);
  const carbG = Math.round((me.calTarget - proteinHigh * 4 - fatG * 9) / 4);
  const macros = [
    { name: "Protein", g: proteinHigh, kcal: proteinHigh*4, color: "#c8ff00" },
    { name: "Carbs",   g: carbG,       kcal: carbG*4,       color: "#37c5f0" },
    { name: "Fat",     g: fatG,        kcal: fatG*9,        color: "#ff8a3d" },
  ];

  const wi = me.weighIns || [];
  const st = me.strength || [];
  const currentWeight = wi.length ? wi[wi.length-1].weight : me.bodyweight;
  const weightDelta = wi.length >= 2 ? (currentWeight - wi[0].weight).toFixed(1) : null;
  const prs = useMemo(() => {
    const out = {};
    LIFT_KEYS.forEach(k => { const vals = st.map(s=>s[k]||0); out[k] = vals.length ? Math.max(...vals) : null; });
    return out;
  }, [st]);

  const addWeighIn = () => { const w=parseFloat(weighInput); if(!w) return; updateMe(c=>({...c,weighIns:[...(c.weighIns||[]),{week:`W${(c.weighIns?.length||0)+1}`,weight:w}]})); setWeighInput(""); };
  const logCalories = () => { const c=parseInt(calInput,10); if(!c) return; updateMe(r=>({...r,caloriesLogged:(r.caloriesLogged||0)+c})); setCalInput(""); };
  const logLift = (key) => {
    const v = parseFloat(liftInput[key]); if (!v) return;
    updateMe(c => {
      const arr = [...(c.strength || [])];
      if (arr.length === 0) {
        const entry = { week: "#1" };
        LIFT_KEYS.forEach(k => { entry[k] = 0; });
        entry[key] = v;
        arr.push(entry);
      } else {
        const last = { ...arr[arr.length - 1] };
        last[key] = v;
        arr[arr.length - 1] = last;
      }
      return { ...c, strength: arr };
    });
    setLiftInput(p => ({ ...p, [key]: "" }));
  };
  const newWeek = () => {
    updateMe(c => {
      const arr = c.strength || [];
      if (!arr.length) return c;
      const prev = arr[arr.length - 1];
      const entry = { ...prev, week: `#${arr.length + 1}` };
      return { ...c, strength: [...arr, entry] };
    });
  };

  const calendar = useMemo(() => { const cells=[]; for(let i=0;i<28;i++) cells.push({n:i+1,week:Math.floor(i/7)+1,plan:SCHEDULE[i%7]}); return cells; }, []);

  return (
    <Shell>
      <div className="crew">
        <span className="crew-label mono"><Users size={12} /> CREW</span>
        <div className="crew-chips">{roster.map(a => {
          const rec=data[a.id]||blankRecord();
          const w=rec.weighIns?.length?rec.weighIns[rec.weighIns.length-1].weight:rec.bodyweight;
          return (
            <button key={a.id} className={`chip ${a.id===meId?"on":""}`} onClick={()=>onSwitch(a.id)}>
              <span className="chip-name">{a.name}</span><span className="chip-w mono">{w}lb</span>
            </button>
          );
        })}</div>
      </div>

      <header className="hero">
        <div className="hero-tag mono">4-WEEK STRENGTH + CUT · {meName.toUpperCase()}</div>
        <h1 className="hero-title">THE&nbsp;PROGRAM</h1>
        <p className="hero-sub">Six training days, one mandatory rest, a moderate deficit — your one place to check before every session.</p>
        <div className="stat-grid">
          <StatCard icon={Scale} label="CURRENT WEIGHT" value={currentWeight} unit="lb" accent="#c8ff00" />
          <StatCard icon={Activity} label="CHANGE" value={weightDelta===null?"—":`${weightDelta>0?"+":""}${weightDelta}`} unit="lb" accent="#37c5f0" />
          <StatCard icon={Flame} label="CALORIES LOGGED" value={(me.caloriesLogged||0).toLocaleString()} unit="kcal" accent="#ff8a3d" />
          <StatCard icon={Trophy} label="SQUAT PR" value={prs.Squat??"—"} unit="lb" accent="#ff5630" />
        </div>
      </header>

      <section className="section">
        <SectionHead icon={Dumbbell} kicker="01 / TRAINING" title="6-Day Split" />
        <div className="days">
          {SCHEDULE.map(d => {
            const meta=INTENSITY[d.intensity]; const open=openDay===d.day; const isWorkout=d.exercises.length>0;
            return (
              <div key={d.day} className={`day ${open?"open":""}`} style={{"--ix":meta.color}}>
                <button className="day-head" onClick={()=>isWorkout&&setOpenDay(open?null:d.day)} disabled={!isWorkout}>
                  <div className="day-id"><span className="day-name mono">{d.day}</span><span className="ix-dot" style={{background:meta.color}} /></div>
                  <div className="day-meta">
                    <span className="day-title">{d.title}{d.progressive&&<span className="prog-tag mono">↑ PROGRESSIVE</span>}</span>
                    <span className="day-int mono" style={{color:meta.color}}>{meta.label}</span>
                  </div>
                  {d.badge&&<span className="badge mono" style={{color:meta.color,borderColor:meta.color}}>{d.badge}</span>}
                  {isWorkout&&<ChevronRight className="day-chev" size={18} />}
                </button>
                {open && (
                  <div className="day-body">
                    <p className="day-note">{d.note}</p>
                    {d.warmup && <WarmUp firstLift={d.exercises[0]?.name} isLift={d.intensity==="high"} />}
                    <div className="ex-group-label mono">MAIN WORK</div>
                    {d.exercises.map(ex => (
                      <button key={ex.name} className="ex" onClick={()=>setActiveEx(ex)}>
                        <span className="ex-name">{ex.name}</span>
                        <span className="ex-right"><span className="ex-scheme mono">{ex.scheme}</span><ChevronRight size={14} className="ex-chev" /></span>
                      </button>
                    ))}
                    {d.finishers && (
                      <div className="fin">
                        <button className="fin-toggle" onClick={()=>setFinOpen(finOpen===d.day?null:d.day)}>
                          <span className="mono">IF TIME REMAINS</span>
                          <span className="fin-sub">{d.finishers.length} optional finishers</span>
                          <ChevronRight size={16} className={`fin-chev ${finOpen===d.day?"on":""}`} />
                        </button>
                        {finOpen===d.day && d.finishers.map(ex => (
                          <button key={ex.name} className="ex fin-ex" onClick={()=>setActiveEx(ex)}>
                            <span className="ex-name">{ex.name}</span>
                            <span className="ex-right"><span className="ex-scheme mono">{ex.scheme}</span><ChevronRight size={14} className="ex-chev" /></span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <SectionHead icon={Beef} kicker="02 / NUTRITION" title="Fuel" />
        <div className="nut-grid">
          <div className="card">
            <div className="card-label mono">YOUR INPUTS</div>
            <label className="field"><span>Bodyweight (lb)</span>
              <input type="number" value={me.bodyweight} onChange={e=>updateMe(c=>({...c,bodyweight:+e.target.value||0}))} />
            </label>
            <div className="field"><span>Daily calorie target</span>
              <div className="stepper">
                <button onClick={()=>updateMe(c=>({...c,calTarget:Math.max(1200,c.calTarget-100)}))}>–</button>
                <strong className="mono">{me.calTarget.toLocaleString()}</strong>
                <button onClick={()=>updateMe(c=>({...c,calTarget:c.calTarget+100}))}>+</button>
              </div>
            </div>
            <p className="hint">Aim for a moderate deficit (~300–500 kcal under maintenance). Adjust to how your weight and energy actually respond.</p>
          </div>
          <div className="card">
            <div className="card-label mono">PROTEIN</div>
            <div className="big-num">{proteinLow}–{proteinHigh}<span className="big-unit">g</span></div>
            <p className="hint">0.8–1.0 g per lb of bodyweight per day. Spread across 3–4 meals.</p>
            <div className="protein-pill mono">≈ {Math.round(proteinHigh/4)}g per meal · 4 meals</div>
          </div>
          <div className="card span-2">
            <div className="card-label mono">MACRO BREAKDOWN · {me.calTarget.toLocaleString()} KCAL</div>
            {macros.map(m => { const pct=Math.round((m.kcal/me.calTarget)*100); return (
              <div key={m.name} className="macro-row">
                <div className="macro-meta"><span className="macro-name">{m.name}</span><span className="mono macro-g">{m.g}g · {pct}%</span></div>
                <Bar pct={pct} color={m.color} />
              </div>
            ); })}
          </div>
        </div>
        <div className="card logger">
          <div className="card-label mono">LOG TODAY'S CALORIES</div>
          <div className="log-row">
            <input type="number" placeholder="e.g. 650" value={calInput} onChange={e=>setCalInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&logCalories()} />
            <button className="btn" onClick={logCalories}><Plus size={15} /> Add</button>
            <button className="btn ghost" onClick={()=>updateMe(c=>({...c,caloriesLogged:0}))}>Reset</button>
          </div>
          <div className="log-meter">
            <div className="log-meta">
              <span className="mono">{(me.caloriesLogged||0).toLocaleString()} / {me.calTarget.toLocaleString()} kcal</span>
              <span className="mono" style={{color:me.caloriesLogged>me.calTarget?"#ff5630":"#c8ff00"}}>{me.caloriesLogged>me.calTarget?"+":""}{((me.caloriesLogged||0)-me.calTarget).toLocaleString()}</span>
            </div>
            <Bar pct={((me.caloriesLogged||0)/me.calTarget)*100} color={me.caloriesLogged>me.calTarget?"#ff5630":"#c8ff00"} />
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHead icon={Target} kicker="03 / PROGRESS" title="The Numbers" />
        <div className="prog-grid">
          <div className="card">
            <div className="card-label mono">WEIGH-INS</div>
            {wi.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={wi} margin={{top:8,right:8,left:-18,bottom:0}}>
                  <CartesianGrid stroke="#26262b" strokeDasharray="3 3" />
                  <XAxis dataKey="week" stroke="#6a6a72" fontSize={11} />
                  <YAxis stroke="#6a6a72" fontSize={11} domain={["dataMin - 2","dataMax + 2"]} />
                  <Tooltip contentStyle={TT} />
                  <Line type="monotone" dataKey="weight" stroke="#c8ff00" strokeWidth={2.5} dot={{r:4,fill:"#c8ff00"}} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="empty mono">NO WEIGH-INS YET — LOG YOUR FIRST BELOW</div>}
            <div className="log-row">
              <input type="number" placeholder="this week's weight" value={weighInput} onChange={e=>setWeighInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addWeighIn()} />
              <button className="btn" onClick={addWeighIn}><Plus size={15} /> Log</button>
            </div>
          </div>
          <div className="card span-2">
            <div className="card-label mono">STRENGTH PROGRESSION</div>
            {st.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={st} margin={{top:8,right:8,left:-18,bottom:0}}>
                  <CartesianGrid stroke="#26262b" strokeDasharray="3 3" />
                  <XAxis dataKey="week" stroke="#6a6a72" fontSize={11} />
                  <YAxis stroke="#6a6a72" fontSize={11} />
                  <Tooltip contentStyle={TT} /><Legend wrapperStyle={{fontSize:10}} />
                  {ALL_LIFTS.map(l => (
                    <Line key={l.key} type="monotone" dataKey={l.key} name={l.label} stroke={l.color} strokeWidth={l.group==="compound"?2.5:1.5} strokeDasharray={l.group==="accessory"?"5 3":undefined} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="empty mono">NO LIFTS LOGGED YET — LOG YOUR FIRST BELOW</div>}
            <div className="lift-log-list">
              {ALL_LIFTS.map(l => {
                const cur = st.length ? (st[st.length-1][l.key]||0) : 0;
                return (
                  <div key={l.key} className="lift-row">
                    <span className="lift-dot" style={{background:l.color}} />
                    <span className="lift-name">{l.label}</span>
                    <span className="lift-cur mono">{cur||"—"}</span>
                    <input type="number" className="lift-input" placeholder="lb" value={liftInput[l.key]||""} onChange={e=>setLiftInput(p=>({...p,[l.key]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&logLift(l.key)} />
                    <button className="btn-sm" onClick={()=>logLift(l.key)}>Log</button>
                  </div>
                );
              })}
            </div>
            <button className="btn full" style={{marginTop:12}} onClick={newWeek}><Plus size={15} /> New Entry</button>
          </div>
        </div>
        <div className="pr-strip">
          {ALL_LIFTS.map(l => { const v=prs[l.key]; return (
            <div key={l.key} className="pr">
              <Trophy size={14} style={{color:"#ffce3f"}} />
              <span className="pr-name mono">{l.label}</span>
              <span className="pr-val">{v??"—"}{v!=null&&<span className="pr-unit">lb</span>}</span>
            </div>
          ); })}
        </div>
      </section>

      <section className="section">
        <SectionHead icon={CalIcon} kicker="04 / OVERVIEW" title="The 28 Days" />
        <div className="legend">{Object.values(INTENSITY).map(m=>(
          <span key={m.label} className="legend-item mono"><span className="ix-dot" style={{background:m.color}} /> {m.label}</span>
        ))}</div>
        <div className="cal">
          <div className="cal-dows">{["M","T","W","T","F","S","S"].map((d,i)=><span key={i} className="mono">{d}</span>)}</div>
          <div className="cal-grid">{calendar.map(c => {
            const meta=INTENSITY[c.plan.intensity];
            return (
              <button key={c.n} className="cal-cell" style={{"--c":meta.color}} onClick={()=>setCalDay(c)}>
                <span className="cal-n mono">{c.n}</span>
                <span className="cal-bar" style={{background:meta.color}} />
              </button>
            );
          })}</div>
        </div>
      </section>

      <section className="section">
        <SectionHead icon={BookOpen} kicker="05 / LEARN" title="Resources" />
        <div className="res-grid">{RESOURCES.map(r=>(
          <a key={r.label} href={yt(r.q)} target="_blank" rel="noreferrer" className="res">
            <Youtube size={16} style={{color:"#ff5630"}} /><span>{r.label}</span><ChevronRight size={15} className="res-chev" />
          </a>
        ))}</div>
        <p className="footnote"><Heart size={12} style={{color:"#ff5630",verticalAlign:"middle"}} /> General guidance for a healthy adult — not medical or nutrition advice. If you have health conditions or feel unwell, check in with a doctor or registered dietitian.</p>
      </section>

      {activeEx && (
        <div className="overlay" onClick={()=>setActiveEx(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <button className="modal-x" onClick={()=>setActiveEx(null)}><X size={18} /></button>
            <div className="modal-kicker mono">FORM CUE</div>
            <h3 className="modal-title">{activeEx.name}</h3>
            <div className="modal-scheme mono">{activeEx.scheme}</div>
            <p className="modal-tip">{activeEx.tip}</p>
            <a href={yt(activeEx.q)} target="_blank" rel="noreferrer" className="btn full"><Youtube size={16} /> Watch tutorial</a>
          </div>
        </div>
      )}

      {calDay && (
        <div className="overlay" onClick={()=>setCalDay(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <button className="modal-x" onClick={()=>setCalDay(null)}><X size={18} /></button>
            <div className="modal-kicker mono">DAY {calDay.n} · WEEK {calDay.week}</div>
            <h3 className="modal-title">{calDay.plan.title}</h3>
            <div className="modal-scheme mono" style={{color:INTENSITY[calDay.plan.intensity].color}}>{INTENSITY[calDay.plan.intensity].label}{calDay.plan.badge?` · ${calDay.plan.badge}`:""}</div>
            <p className="modal-tip">{calDay.plan.note}</p>
            {calDay.plan.exercises.map(ex=>(
              <div key={ex.name} className="modal-ex"><span>{ex.name}</span><span className="mono">{ex.scheme}</span></div>
            ))}
          </div>
        </div>
      )}

      <footer className="foot mono">CHECK · TRAIN · LOG · REPEAT</footer>
    </Shell>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
.root{
  --bg:#0b0b0c; --surface:#161618; --surface2:#1c1c1f; --border:#2b2b30;
  --text:#f4f4f2; --muted:#8e8e96; --accent:#c8ff00;
  background:var(--bg); color:var(--text); min-height:100vh; font-family:'Hanken Grotesk',sans-serif;
  -webkit-font-smoothing:antialiased;
  background-image:radial-gradient(circle at 12% -10%, rgba(200,255,0,.07), transparent 45%),radial-gradient(circle at 100% 0%, rgba(55,197,240,.06), transparent 40%);
}
.root *{box-sizing:border-box;}
.mono{font-family:'Space Mono',monospace;}
.center{display:flex; align-items:center; justify-content:center; min-height:100vh; color:var(--muted); letter-spacing:.3em; font-size:13px;}
.gate{max-width:480px; margin:0 auto; padding:64px 24px; min-height:100vh; display:flex; flex-direction:column; justify-content:center;}
.gate-title{font-family:'Anton',sans-serif; font-weight:400; font-size:clamp(52px,15vw,88px); line-height:.86; margin:14px 0 0; text-transform:uppercase; background:linear-gradient(170deg,#fff 35%,#7b7b82); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;}
.gate-sub{color:var(--muted); line-height:1.55; margin:18px 0 28px; font-size:15px;}
.gate-fields{display:flex; flex-direction:column; gap:10px; margin-bottom:22px;}
.gate-input{background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; color:var(--text); font-family:inherit; font-size:16px;}
.gate-input:focus{outline:none; border-color:var(--accent);}
.gate-foot{font-size:10px; letter-spacing:.18em; color:var(--muted); margin-top:18px; text-align:center;}
.link-btn{display:inline-flex; align-items:center; gap:6px; align-self:center; margin-top:20px; background:none; border:none; color:var(--muted); font-size:11px; letter-spacing:.16em; cursor:pointer;}
.link-btn:hover{color:var(--accent);}
.picker-list{display:flex; flex-direction:column; gap:10px;}
.picker-card{display:flex; align-items:center; gap:16px; background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:16px; cursor:pointer; color:inherit; font-family:inherit; transition:border-color .15s, transform .1s;}
.picker-card:hover{border-color:var(--accent); transform:translateX(3px);}
.picker-avatar{width:46px; height:46px; flex-shrink:0; border-radius:11px; background:var(--accent); color:#0b0b0c; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:15px;}
.picker-info{display:flex; flex-direction:column; flex:1; gap:3px; text-align:left;}
.picker-name{font-size:18px; font-weight:700;}
.picker-meta{font-size:11px; color:var(--muted);}
.picker-chev{color:var(--muted);}
.crew{position:sticky; top:0; z-index:20; display:flex; align-items:center; gap:12px; padding:12px 16px; background:rgba(11,11,12,.82); backdrop-filter:blur(10px); border-bottom:1px solid var(--border); overflow-x:auto;}
.crew-label{display:inline-flex; align-items:center; gap:6px; font-size:9px; letter-spacing:.16em; color:var(--muted); flex-shrink:0;}
.crew-chips{display:flex; gap:8px;}
.chip{display:flex; align-items:center; gap:8px; background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:7px 13px; cursor:pointer; color:var(--text); font-family:inherit; font-size:13px; white-space:nowrap;}
.chip.on{border-color:var(--accent); background:rgba(200,255,0,.08);}
.chip-name{font-weight:600;}
.chip-w{font-size:11px; color:var(--muted);}
.chip.on .chip-w{color:var(--accent);}
.hero{padding:40px 20px 32px; max-width:1100px; margin:0 auto;}
.hero-tag{display:inline-flex; align-items:center; gap:7px; font-size:11px; letter-spacing:.24em; color:var(--accent); margin-bottom:14px;}
.hero-title{font-family:'Anton',sans-serif; font-weight:400; line-height:.86; font-size:clamp(60px,16vw,140px); letter-spacing:-.01em; margin:0; text-transform:uppercase; background:linear-gradient(170deg,#fff 30%,#7b7b82); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;}
.hero-sub{color:var(--muted); max-width:460px; margin:16px 0 30px; font-size:15px; line-height:1.55;}
.stat-grid{display:grid; grid-template-columns:repeat(2,1fr); gap:12px;}
.stat{background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:16px;}
.stat-top{display:flex; align-items:center; gap:8px; margin-bottom:10px;}
.stat-label{font-size:9.5px; letter-spacing:.14em; color:var(--muted);}
.stat-val{font-family:'Anton',sans-serif; font-size:34px; line-height:1;}
.stat-unit{font-family:'Space Mono',monospace; font-size:13px; color:var(--muted); margin-left:5px;}
.section{max-width:1100px; margin:0 auto; padding:30px 20px;}
.sec-head{margin-bottom:22px;}
.sec-kicker{display:inline-flex; align-items:center; gap:6px; font-size:10.5px; letter-spacing:.2em; color:var(--accent);}
.sec-title{font-family:'Anton',sans-serif; font-weight:400; font-size:clamp(34px,7vw,52px); margin:4px 0 0; text-transform:uppercase; letter-spacing:-.01em;}
.days{display:flex; flex-direction:column; gap:10px;}
.day{background:var(--surface); border:1px solid var(--border); border-radius:14px; overflow:hidden; transition:border-color .2s;}
.day.open{border-color:var(--ix);}
.day-head{width:100%; display:flex; align-items:center; gap:14px; padding:18px; background:none; border:none; color:inherit; cursor:pointer; text-align:left; font-family:inherit;}
.day-head:disabled{cursor:default;}
.day-id{display:flex; align-items:center; gap:10px; width:72px; flex-shrink:0;}
.day-name{font-size:17px; font-weight:700; letter-spacing:.05em;}
.ix-dot{width:9px; height:9px; border-radius:50%; flex-shrink:0;}
.day-meta{display:flex; flex-direction:column; flex:1; gap:3px; min-width:0;}
.day-title{font-size:16px; font-weight:600; display:flex; align-items:center; gap:8px; flex-wrap:wrap;}
.prog-tag{font-size:8.5px; letter-spacing:.1em; color:var(--accent); border:1px solid var(--border); border-radius:6px; padding:2px 5px;}
.day-int{font-size:10px; letter-spacing:.16em; text-transform:uppercase;}
.badge{font-size:8.5px; letter-spacing:.12em; border:1px solid; border-radius:6px; padding:3px 7px; flex-shrink:0;}
.day-chev{color:var(--muted); transition:transform .2s; flex-shrink:0;}
.day.open .day-chev{transform:rotate(90deg); color:var(--ix);}
.day-body{padding:0 18px 18px; display:flex; flex-direction:column; gap:8px;}
.day-note{color:var(--muted); font-size:13px; line-height:1.5; margin:0 0 6px; padding-top:4px; border-top:1px solid var(--border);}
.ex{display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--surface2); border:1px solid var(--border); border-radius:10px; padding:13px 15px; cursor:pointer; color:inherit; font-family:inherit; transition:border-color .15s, transform .1s;}
.ex:hover{border-color:var(--accent); transform:translateX(2px);}
.ex-name{font-weight:600; font-size:14.5px;}
.ex-right{display:flex; align-items:center; gap:10px;}
.ex-scheme{font-size:12px; color:var(--accent); white-space:nowrap;}
.ex-chev{color:var(--muted);}
.ex-group-label{font-size:9px; letter-spacing:.16em; color:var(--muted); margin:6px 0 0;}
.warm{border:1px solid var(--border); border-radius:10px; overflow:hidden; background:var(--surface2); margin-bottom:2px;}
.warm-toggle{width:100%; display:flex; align-items:center; gap:10px; padding:13px 14px; background:none; border:none; color:var(--text); cursor:pointer; font-family:inherit;}
.warm-toggle .mono{font-size:11px; letter-spacing:.14em;}
.warm-sub{font-size:11px; color:var(--muted); margin-left:auto;}
.warm-list{display:flex; flex-direction:column; gap:6px; padding:0 12px 12px;}
.warm-item{display:flex; align-items:flex-start; gap:11px; background:var(--surface); border:1px solid var(--border); border-radius:9px; padding:11px 12px; cursor:pointer; color:inherit; font-family:inherit; text-align:left; transition:border-color .15s;}
.warm-item.checked{border-color:#ff8a3d;}
.warm-check{width:20px; height:20px; flex-shrink:0; margin-top:1px; border-radius:6px; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; color:#0b0b0c; background:transparent; transition:background .15s;}
.warm-item.checked .warm-check{background:#ff8a3d; border-color:#ff8a3d;}
.warm-text{display:flex; flex-direction:column; gap:2px;}
.warm-label{font-size:13.5px; font-weight:600;}
.warm-item.checked .warm-label{text-decoration:line-through; color:var(--muted);}
.warm-detail{font-size:12px; color:var(--muted); line-height:1.45;}
.fin{margin-top:4px;}
.fin-toggle{width:100%; display:flex; align-items:center; gap:10px; padding:13px 14px; background:var(--surface2); border:1px dashed var(--border); border-radius:10px; color:var(--text); cursor:pointer; font-family:inherit;}
.fin-toggle .mono{font-size:11px; letter-spacing:.14em; color:var(--accent);}
.fin-sub{font-size:11px; color:var(--muted); margin-left:auto;}
.fin-chev{color:var(--muted); transition:transform .2s;}
.fin-chev.on{transform:rotate(90deg); color:var(--accent);}
.fin-ex{margin-top:8px;}
.nut-grid{display:grid; grid-template-columns:repeat(2,1fr); gap:12px;}
.card{background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:18px;}
.card.span-2{grid-column:1 / -1;}
.card-label{font-size:10px; letter-spacing:.18em; color:var(--muted); margin-bottom:16px; text-transform:uppercase;}
.field{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px; font-size:14px; color:var(--muted);}
.field input{width:96px; background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:9px 11px; color:var(--text); font-family:'Space Mono',monospace; font-size:14px; text-align:right;}
.field input:focus{outline:none; border-color:var(--accent);}
.stepper{display:flex; align-items:center; gap:12px;}
.stepper button{width:30px; height:30px; border-radius:8px; border:1px solid var(--border); background:var(--surface2); color:var(--text); font-size:18px; cursor:pointer; line-height:1;}
.stepper button:hover{border-color:var(--accent); color:var(--accent);}
.stepper strong{font-size:17px; min-width:62px; text-align:center;}
.hint{font-size:12px; color:var(--muted); line-height:1.55; margin:6px 0 0;}
.big-num{font-family:'Anton',sans-serif; font-size:56px; line-height:1; color:var(--accent);}
.big-unit{font-family:'Space Mono',monospace; font-size:18px; color:var(--muted); margin-left:4px;}
.protein-pill{display:inline-block; margin-top:14px; font-size:11px; padding:7px 12px; border:1px solid var(--border); border-radius:20px; color:var(--muted);}
.macro-row{margin-bottom:15px;}
.macro-meta{display:flex; justify-content:space-between; margin-bottom:7px;}
.macro-name{font-weight:600; font-size:14px;}
.macro-g{font-size:12px; color:var(--muted);}
.bar-track{height:8px; background:var(--surface2); border-radius:10px; overflow:hidden;}
.bar-fill{height:100%; border-radius:10px; transition:width .4s ease;}
.logger{margin-top:12px;}
.log-row{display:flex; gap:8px; margin-top:6px;}
.log-row input{flex:1; min-width:0; background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:11px 13px; color:var(--text); font-family:'Space Mono',monospace; font-size:14px;}
.log-row input:focus{outline:none; border-color:var(--accent);}
.btn{display:inline-flex; align-items:center; justify-content:center; gap:6px; background:var(--accent); color:#0b0b0c; border:none; border-radius:8px; padding:11px 16px; font-family:inherit; font-weight:700; font-size:14px; cursor:pointer; white-space:nowrap; transition:opacity .15s;}
.btn:hover{opacity:.85;}
.btn.ghost{background:var(--surface2); color:var(--text); border:1px solid var(--border);}
.btn.full{width:100%; margin-top:10px;}
.btn.big{padding:16px; font-size:16px; margin-top:4px;}
.log-meter{margin-top:16px;}
.log-meta{display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px;}
.prog-grid{display:grid; grid-template-columns:repeat(2,1fr); gap:12px;}
.empty{height:200px; display:flex; align-items:center; justify-content:center; text-align:center; color:var(--muted); font-size:11px; letter-spacing:.12em; border:1px dashed var(--border); border-radius:10px; padding:20px;}
.lift-log-list{display:flex; flex-direction:column; gap:6px; margin-top:14px;}
.lift-row{display:flex; align-items:center; gap:10px; padding:8px 12px; background:var(--surface2); border:1px solid var(--border); border-radius:10px;}
.lift-dot{width:8px; height:8px; border-radius:50%; flex-shrink:0;}
.lift-name{font-size:13px; font-weight:600; flex:1; min-width:0;}
.lift-cur{font-size:12px; color:var(--muted); width:44px; text-align:right; flex-shrink:0;}
.lift-input{width:64px; min-width:0; background:var(--bg); border:1px solid var(--border); border-radius:7px; padding:7px 8px; color:var(--text); font-family:'Space Mono',monospace; font-size:12px; text-align:right; flex-shrink:0;}
.lift-input:focus{outline:none; border-color:var(--accent);}
.btn-sm{background:var(--accent); color:#0b0b0c; border:none; border-radius:7px; padding:7px 12px; font-family:inherit; font-weight:700; font-size:12px; cursor:pointer; white-space:nowrap; flex-shrink:0; transition:opacity .15s;}
.btn-sm:hover{opacity:.85;}
.pr-strip{display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-top:12px;}
.pr{background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:6px;}
.pr-name{font-size:10px; letter-spacing:.12em; color:var(--muted); text-transform:uppercase;}
.pr-val{font-family:'Anton',sans-serif; font-size:30px; line-height:1;}
.pr-unit{font-family:'Space Mono',monospace; font-size:12px; color:var(--muted); margin-left:4px;}
.legend{display:flex; flex-wrap:wrap; gap:16px; margin-bottom:16px;}
.legend-item{display:inline-flex; align-items:center; gap:7px; font-size:11px; color:var(--muted);}
.cal{background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:18px;}
.cal-dows{display:grid; grid-template-columns:repeat(7,1fr); gap:8px; margin-bottom:10px;}
.cal-dows span{text-align:center; font-size:11px; color:var(--muted);}
.cal-grid{display:grid; grid-template-columns:repeat(7,1fr); gap:8px;}
.cal-cell{aspect-ratio:1; background:var(--surface2); border:1px solid var(--border); border-radius:10px; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; color:var(--text); font-family:inherit; padding:4px; transition:transform .12s, border-color .15s;}
.cal-cell:hover{transform:translateY(-2px); border-color:var(--c);}
.cal-n{font-size:13px;}
.cal-bar{width:60%; height:4px; border-radius:4px;}
.res-grid{display:grid; grid-template-columns:repeat(2,1fr); gap:10px;}
.res{display:flex; align-items:center; gap:12px; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:15px 16px; color:var(--text); text-decoration:none; font-size:14px; font-weight:500; transition:border-color .15s, transform .1s;}
.res:hover{border-color:var(--accent); transform:translateX(3px);}
.res-chev{margin-left:auto; color:var(--muted);}
.footnote{margin-top:18px; font-size:12px; color:var(--muted); line-height:1.6;}
.overlay{position:fixed; inset:0; background:rgba(5,5,6,.78); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:20px; z-index:50; animation:fade .2s ease;}
.modal{position:relative; background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:30px 26px 26px; max-width:430px; width:100%; animation:rise .25s cubic-bezier(.2,.8,.2,1); max-height:88vh; overflow-y:auto;}
.modal-x{position:absolute; top:16px; right:16px; background:var(--surface2); border:1px solid var(--border); border-radius:9px; width:34px; height:34px; display:flex; align-items:center; justify-content:center; color:var(--text); cursor:pointer;}
.modal-x:hover{border-color:var(--accent);}
.modal-kicker{font-size:10px; letter-spacing:.2em; color:var(--accent);}
.modal-title{font-family:'Anton',sans-serif; font-weight:400; font-size:34px; margin:8px 0 4px; text-transform:uppercase;}
.modal-scheme{font-size:13px; color:var(--accent); margin-bottom:16px;}
.modal-tip{color:var(--muted); line-height:1.6; font-size:14.5px; margin:0 0 20px;}
.modal-ex{display:flex; justify-content:space-between; padding:11px 0; border-top:1px solid var(--border); font-size:14px;}
.modal-ex .mono{color:var(--accent); font-size:12px;}
.foot{text-align:center; padding:36px 20px 44px; font-size:11px; letter-spacing:.3em; color:var(--muted); border-top:1px solid var(--border); margin-top:24px;}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes rise{from{opacity:0; transform:translateY(14px)}to{opacity:1; transform:translateY(0)}}
@media(min-width:720px){ .stat-grid{grid-template-columns:repeat(4,1fr);} }
@media(max-width:560px){ .nut-grid,.prog-grid,.res-grid{grid-template-columns:1fr;} .pr-strip{grid-template-columns:repeat(3,1fr);} .stat-val{font-size:30px;} }
`;
