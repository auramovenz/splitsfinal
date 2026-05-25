import { useState, useCallback } from "react";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function parseTime(input) {
  const s = String(input).trim();
  if (!s) return null;
  const parts = s.split(":");
  if (parts.length === 1) {
    const v = parseFloat(parts[0]);
    return isNaN(v) ? null : v;
  }
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10);
    const sec = parseFloat(parts[1]);
    if (isNaN(m) || isNaN(sec)) return null;
    return m * 60 + sec;
  }
  return null;
}

function formatTime(secs, alwaysMinutes = false) {
  if (secs == null || isNaN(secs)) return "--";
  if (secs >= 60 || alwaysMinutes) {
    const m = Math.floor(secs / 60);
    const s = (secs - m * 60).toFixed(2).padStart(5, "0");
    return `${m}:${s}`;
  }
  return secs.toFixed(2);
}

function secondsToHms(secs) {
  if (secs == null) return "--";
  if (secs < 60) return `${secs.toFixed(2)}s`;
  return formatTime(secs, true);
}

// ─── EVENTS ──────────────────────────────────────────────────────────────────
const EVENT_GROUPS = [
  {
    group: "Freestyle",
    events: [
      { label: "50m Freestyle - 50m pool",   dist: 50,   laps: 1,  pool: 50, stroke: "FR" },
      { label: "50m Freestyle - 25m pool",   dist: 50,   laps: 2,  pool: 25, stroke: "FR" },
      { label: "100m Freestyle - 50m pool",  dist: 100,  laps: 2,  pool: 50, stroke: "FR" },
      { label: "100m Freestyle - 25m pool",  dist: 100,  laps: 4,  pool: 25, stroke: "FR" },
      { label: "200m Freestyle - 50m pool",  dist: 200,  laps: 4,  pool: 50, stroke: "FR" },
      { label: "200m Freestyle - 25m pool",  dist: 200,  laps: 8,  pool: 25, stroke: "FR" },
      { label: "400m Freestyle - 50m pool",  dist: 400,  laps: 8,  pool: 50, stroke: "FR" },
      { label: "400m Freestyle - 25m pool",  dist: 400,  laps: 16, pool: 25, stroke: "FR" },
      { label: "800m Freestyle - 50m pool",  dist: 800,  laps: 16, pool: 50, stroke: "FR" },
      { label: "800m Freestyle - 25m pool",  dist: 800,  laps: 32, pool: 25, stroke: "FR" },
      { label: "1500m Freestyle - 50m pool", dist: 1500, laps: 30, pool: 50, stroke: "FR" },
      { label: "1500m Freestyle - 25m pool", dist: 1500, laps: 60, pool: 25, stroke: "FR" },
    ],
  },
  {
    group: "Backstroke",
    events: [
      { label: "50m Backstroke - 50m pool",  dist: 50,  laps: 1, pool: 50, stroke: "BK" },
      { label: "50m Backstroke - 25m pool",  dist: 50,  laps: 2, pool: 25, stroke: "BK" },
      { label: "100m Backstroke - 50m pool", dist: 100, laps: 2, pool: 50, stroke: "BK" },
      { label: "100m Backstroke - 25m pool", dist: 100, laps: 4, pool: 25, stroke: "BK" },
      { label: "200m Backstroke - 50m pool", dist: 200, laps: 4, pool: 50, stroke: "BK" },
      { label: "200m Backstroke - 25m pool", dist: 200, laps: 8, pool: 25, stroke: "BK" },
    ],
  },
  {
    group: "Breaststroke",
    events: [
      { label: "50m Breaststroke - 50m pool",  dist: 50,  laps: 1, pool: 50, stroke: "BR" },
      { label: "50m Breaststroke - 25m pool",  dist: 50,  laps: 2, pool: 25, stroke: "BR" },
      { label: "100m Breaststroke - 50m pool", dist: 100, laps: 2, pool: 50, stroke: "BR" },
      { label: "100m Breaststroke - 25m pool", dist: 100, laps: 4, pool: 25, stroke: "BR" },
      { label: "200m Breaststroke - 50m pool", dist: 200, laps: 4, pool: 50, stroke: "BR" },
      { label: "200m Breaststroke - 25m pool", dist: 200, laps: 8, pool: 25, stroke: "BR" },
    ],
  },
  {
    group: "Butterfly",
    events: [
      { label: "50m Butterfly - 50m pool",  dist: 50,  laps: 1, pool: 50, stroke: "FLY" },
      { label: "50m Butterfly - 25m pool",  dist: 50,  laps: 2, pool: 25, stroke: "FLY" },
      { label: "100m Butterfly - 50m pool", dist: 100, laps: 2, pool: 50, stroke: "FLY" },
      { label: "100m Butterfly - 25m pool", dist: 100, laps: 4, pool: 25, stroke: "FLY" },
      { label: "200m Butterfly - 50m pool", dist: 200, laps: 4, pool: 50, stroke: "FLY" },
      { label: "200m Butterfly - 25m pool", dist: 200, laps: 8, pool: 25, stroke: "FLY" },
    ],
  },
  {
    group: "Individual Medley",
    events: [
      { label: "100m IM - 25m pool",  dist: 100, laps: 4,  pool: 25, stroke: "IM", legs: 4 },
      { label: "200m IM - 50m pool",  dist: 200, laps: 4,  pool: 50, stroke: "IM", legs: 4 },
      { label: "200m IM - 25m pool",  dist: 200, laps: 8,  pool: 25, stroke: "IM", legs: 4 },
      { label: "400m IM - 50m pool",  dist: 400, laps: 8,  pool: 50, stroke: "IM", legs: 4 },
      { label: "400m IM - 25m pool",  dist: 400, laps: 16, pool: 25, stroke: "IM", legs: 4 },
    ],
  },
  {
    group: "Open Water / Triathlon",
    events: [
      { label: "750m - Sprint Triathlon",         dist: 750,   laps: null, pool: null, stroke: "OW" },
      { label: "1500m - Olympic Triathlon",        dist: 1500,  laps: null, pool: null, stroke: "OW" },
      { label: "1900m - 70.3 Half Ironman",        dist: 1900,  laps: null, pool: null, stroke: "OW" },
      { label: "3800m - Full Ironman",             dist: 3800,  laps: null, pool: null, stroke: "OW" },
      { label: "5km Open Water",                   dist: 5000,  laps: null, pool: null, stroke: "OW" },
      { label: "10km Open Water",                  dist: 10000, laps: null, pool: null, stroke: "OW" },
    ],
  },
];

const ALL_EVENTS = EVENT_GROUPS.flatMap(g => g.events);

// ─── STROKE THEMES ────────────────────────────────────────────────────────────
const STROKE_THEME = {
  FR:  { accent: "#0D7377", light: "#EBF7F8", border: "#99D4D6", label: "Freestyle" },
  BK:  { accent: "#3A6BD5", light: "#EBF0FF", border: "#99B3E0", label: "Backstroke" },
  BR:  { accent: "#7B5EA7", light: "#F3EEFF", border: "#C4A8E8", label: "Breaststroke" },
  FLY: { accent: "#D56B3A", light: "#FFF3EC", border: "#F0B899", label: "Butterfly" },
  IM:  { accent: "#2EAA6A", light: "#EDFAF3", border: "#8FDCB8", label: "Individual Medley" },
  OW:  { accent: "#1A7DB5", light: "#E6F4FB", border: "#7DC2E8", label: "Open Water" },
};

// ─── SPLIT PROFILES ───────────────────────────────────────────────────────────
const PROFILES = [
  { key: "Even",      label: "Even",           splits: [0.500, 0.500], desc: "50/50 - perfectly paced" },
  { key: "Negative",  label: "Negative",       splits: [0.505, 0.495], desc: "Slightly faster back half - ideal race execution" },
  { key: "StrongNeg", label: "Strong Negative",splits: [0.515, 0.485], desc: "Back end clearly faster - distance specialist" },
  { key: "Positive",  label: "Positive",       splits: [0.495, 0.505], desc: "Faster front half - sprinter tactic" },
  { key: "StrongPos", label: "Strong Positive",splits: [0.480, 0.520], desc: "Went out too hard - classic over-pacing" },
];

// ─── SPLIT BAR ────────────────────────────────────────────────────────────────
function SplitBar({ front, back, theme }) {
  const total = front + back;
  if (!total) return null;
  const fp = (front / total) * 100;
  const bp = 100 - fp;
  const neg = back < front - 0.01;
  const even = Math.abs(fp - 50) < 0.05;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 28 }}>
        <div style={{
          width: `${fp}%`, background: neg ? theme.accent : "#8BABD8",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 800, color: "white", transition: "width 0.35s ease", minWidth: 28,
        }}>{fp.toFixed(1)}%</div>
        <div style={{
          width: `${bp}%`, background: neg ? "#8BABD8" : theme.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 800, color: "white", transition: "width 0.35s ease", minWidth: 28,
        }}>{bp.toFixed(1)}%</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "#8B9AAB" }}>
        <span>Front half</span>
        <span style={{ fontWeight: 700, color: neg ? "#2EAA6A" : even ? "#8B9AAB" : "#D5508A" }}>
          {neg ? "Negative split" : even ? "Even split" : "Positive split"}
        </span>
        <span>Back half</span>
      </div>
    </div>
  );
}

// ─── PACE STATS ───────────────────────────────────────────────────────────────
function PaceStats({ totalSecs, event, theme }) {
  if (!totalSecs || !event) return null;
  const per100 = (totalSecs / event.dist) * 100;
  const per50  = per100 / 2;
  const perLap = event.laps ? totalSecs / event.laps : null;
  const cells = [
    { label: "PACE / 100m", value: formatTime(per100, true) },
    { label: "PACE / 50m",  value: formatTime(per50, per50 >= 60) },
    ...(perLap ? [{ label: `AVG / ${event.pool}m LAP`, value: formatTime(perLap) }] : []),
  ];
  return (
    <div style={{
      marginTop: 14, display: "grid",
      gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
      background: theme.light, borderRadius: 8, border: `1px solid ${theme.border}`,
      overflow: "hidden",
    }}>
      {cells.map((c, i) => (
        <div key={i} style={{
          textAlign: "center", padding: "8px 6px",
          borderLeft: i > 0 ? `1px solid ${theme.border}` : "none",
        }}>
          <div style={{ fontSize: 9, color: "#8B9AAB", fontWeight: 700, letterSpacing: 0.8 }}>{c.label}</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#0A2540", fontFamily: "monospace" }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── LAP BREAKDOWN ────────────────────────────────────────────────────────────
function LapBreakdown({ totalSecs, event, frontRatio, theme }) {
  if (!totalSecs || !event || !event.laps || event.laps < 4) return null;
  const laps = event.laps;
  const half = Math.floor(laps / 2);
  const frontLap = (totalSecs * frontRatio) / half;
  const backLap  = (totalSecs * (1 - frontRatio)) / (laps - half);
  const MAX_SHOW = 32;
  const show = Math.min(laps, MAX_SHOW);
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#8B9AAB", letterSpacing: 1, marginBottom: 6 }}>
        LAP TIMES ({event.pool}m laps)
        {laps > MAX_SHOW ? ` - first ${MAX_SHOW} of ${laps} shown` : ""}
      </div>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {Array.from({ length: show }, (_, i) => {
          const isFront = i < half;
          const t = isFront ? frontLap : backLap;
          return (
            <div key={i} style={{
              flex: "1 1 44px", maxWidth: 62,
              padding: "5px 3px", borderRadius: 6, textAlign: "center",
              background: isFront ? theme.light : "#EEF2FF",
              border: `1px solid ${isFront ? theme.border : "#B8C8F0"}`,
            }}>
              <div style={{ fontSize: 8, color: "#8B9AAB", fontWeight: 700 }}>L{i + 1}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#0A2540", fontFamily: "monospace" }}>
                {formatTime(t)}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 9, color: "#B0B8C4", marginTop: 5 }}>
        Lap times are averages within each half. Real splits vary with fatigue, turns and race execution.
      </div>
    </div>
  );
}

// ─── IM LEGS ──────────────────────────────────────────────────────────────────
function IMLegs({ totalSecs, event }) {
  if (!event || event.stroke !== "IM" || !totalSecs) return null;
  const legDist = event.dist / 4;
  const legNames = ["Butterfly", "Backstroke", "Breaststroke", "Freestyle"];
  const legWeights = [0.238, 0.245, 0.285, 0.232];
  const legColors = ["#D56B3A", "#3A6BD5", "#7B5EA7", "#0D7377"];
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#8B9AAB", letterSpacing: 1, marginBottom: 7 }}>
        ESTIMATED LEG SPLITS ({legDist}m each)
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5 }}>
        {legNames.map((name, i) => (
          <div key={i} style={{
            padding: "8px 4px", borderRadius: 8, textAlign: "center",
            background: legColors[i] + "18", border: `1.5px solid ${legColors[i]}44`,
          }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: legColors[i], letterSpacing: 0.5 }}>
              {name.toUpperCase()}
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#0A2540", fontFamily: "monospace", marginTop: 2 }}>
              {secondsToHms(totalSecs * legWeights[i])}
            </div>
            <div style={{ fontSize: 8, color: "#8B9AAB", marginTop: 1 }}>
              {(legWeights[i] * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: "#B0B8C4", marginTop: 5 }}>
        Based on typical competitive IM split ratios. Individual variation is significant.
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function SwimSplitCalc() {
  const [timeInput, setTimeInput]     = useState("");
  const [eventKey, setEventKey]       = useState("100m Freestyle - 50m pool");
  const [profileKey, setProfileKey]   = useState("Negative");
  const [customFront, setCustomFront] = useState("");
  const [customBack, setCustomBack]   = useState("");
  const [useCustom, setUseCustom]     = useState(false);
  const [inputMode, setInputMode]     = useState("time"); // "time" | "pace"
  const [paceInput, setPaceInput]     = useState("");

  const event   = ALL_EVENTS.find(e => e.label === eventKey) || ALL_EVENTS[2];
  const profile = PROFILES.find(p => p.key === profileKey) || PROFILES[1];
  const theme   = STROKE_THEME[event.stroke] || STROKE_THEME.FR;
  const isOW    = event.stroke === "OW";

  // Derive totalSecs from whichever input mode is active
  const paceSecs = parseTime(paceInput);
  const paceTotal = (paceSecs != null && paceSecs > 0)
    ? (paceSecs / 100) * event.dist
    : null;

  const rawTimeSecs = parseTime(timeInput);
  const totalSecs = (inputMode === "pace" && isOW)
    ? paceTotal
    : rawTimeSecs;
  const valid = totalSecs != null && totalSecs > 0;

  const splits = (() => {
    if (useCustom) {
      const f = parseTime(customFront);
      const b = parseTime(customBack);
      if (f != null && b != null) return { front: f, back: b, ratio: f / (f + b) };
    }
    if (!valid) return null;
    const [fp, bp] = profile.splits;
    return { front: totalSecs * fp, back: totalSecs * bp, ratio: fp };
  })();

  const diff  = splits ? Math.abs(splits.front - splits.back) : 0;
  const isNeg = splits && splits.back < splits.front - 0.005;
  const isEven = splits && diff < 0.005;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0A2540 0%, #0D3D5C 60%, #0A2540 100%)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "28px 14px 48px",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 580 }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{
            display: "inline-block", background: theme.accent, color: "white",
            fontSize: 10, fontWeight: 800, letterSpacing: 2,
            padding: "4px 16px", borderRadius: 20, marginBottom: 10,
            transition: "background 0.3s",
          }}>
            @auramove.nz
          </div>
          <h1 style={{ color: "white", fontSize: 24, margin: "0 0 5px", fontWeight: 900, letterSpacing: -0.5 }}>
            Swim Split Calculator
          </h1>
          <p style={{ color: "#6AAEC2", fontSize: 12, margin: 0 }}>
            All events · Front &amp; back half splits · Lap breakdown
          </p>
        </div>

        {/* CARD */}
        <div style={{
          background: "white", borderRadius: 18, padding: "22px 22px 26px",
          boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
        }}>

          {/* EVENT DROPDOWN */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block", fontSize: 10, fontWeight: 800,
              color: "#8B9AAB", letterSpacing: 1.2, marginBottom: 6,
            }}>
              EVENT
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={eventKey}
                onChange={e => {
                  const newEvent = ALL_EVENTS.find(ev => ev.label === e.target.value);
                  if (newEvent && newEvent.stroke !== "OW") setInputMode("time");
                  setEventKey(e.target.value);
                }}
                style={{
                  width: "100%", padding: "11px 36px 11px 14px",
                  borderRadius: 9, fontSize: 14, fontWeight: 700,
                  border: `2px solid ${theme.border}`,
                  background: theme.light, color: "#0A2540",
                  appearance: "none", WebkitAppearance: "none",
                  outline: "none", cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                {EVENT_GROUPS.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.events.map(e => (
                      <option key={e.label} value={e.label}>{e.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                pointerEvents: "none", color: theme.accent, fontSize: 14, fontWeight: 900,
              }}>
                ▾
              </div>
            </div>
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                display: "inline-block", background: theme.accent, color: "white",
                fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                padding: "2px 8px", borderRadius: 12,
              }}>
                {theme.label.toUpperCase()}
              </span>
              <span style={{ fontSize: 10, color: "#8B9AAB" }}>
                {event.laps
                  ? `${event.laps} x ${event.pool}m laps · ${event.dist}m total`
                  : `${event.dist}m · open water`}
              </span>
            </div>
          </div>

          {/* TIME / PACE INPUT */}
          <div style={{ marginBottom: 16 }}>

            {/* Mode toggle - only shown for OW events */}
            {isOW && (
              <div style={{ display: "flex", gap: 0, marginBottom: 8, borderRadius: 8, overflow: "hidden", border: `1.5px solid ${theme.border}`, width: "fit-content" }}>
                {[["time", "Finish Time"], ["pace", "Pace / 100m"]].map(([mode, label]) => {
                  const active = inputMode === mode;
                  return (
                    <button key={mode} onClick={() => setInputMode(mode)} style={{
                      padding: "5px 14px", fontSize: 11, fontWeight: 700,
                      background: active ? theme.accent : "white",
                      color: active ? "white" : "#8B9AAB",
                      border: "none", cursor: "pointer",
                      transition: "all 0.15s",
                    }}>{label}</button>
                  );
                })}
              </div>
            )}

            {/* Pace input (OW + pace mode) */}
            {isOW && inputMode === "pace" ? (
              <>
                <label style={{
                  display: "block", fontSize: 10, fontWeight: 800,
                  color: "#8B9AAB", letterSpacing: 1.2, marginBottom: 6,
                }}>
                  PACE PER 100m &nbsp;
                  <span style={{ fontWeight: 400, fontSize: 10 }}>
                    e.g. 1:45.00 &nbsp;·&nbsp; 2:10.00
                  </span>
                </label>
                <input
                  value={paceInput}
                  onChange={e => { setPaceInput(e.target.value); setUseCustom(false); }}
                  placeholder="2:00.00"
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 9,
                    fontSize: 24, fontWeight: 900, fontFamily: "monospace", letterSpacing: 2,
                    border: `2.5px solid ${(paceSecs != null && paceSecs > 0) ? theme.accent : "#D0DAE0"}`,
                    background: (paceSecs != null && paceSecs > 0) ? theme.light : "#FAFBFC",
                    color: "#0A2540", outline: "none", boxSizing: "border-box",
                    transition: "all 0.2s",
                  }}
                />
                {paceInput && !(paceSecs != null && paceSecs > 0) && (
                  <div style={{ color: "#D5508A", fontSize: 11, marginTop: 4 }}>
                    Cannot read that pace - try <b>1:45.00</b> or <b>2:10.00</b>
                  </div>
                )}
                {valid && (
                  <div style={{ fontSize: 11, color: theme.accent, fontWeight: 700, marginTop: 6 }}>
                    → Projected finish time: <span style={{ fontFamily: "monospace" }}>{formatTime(totalSecs, true)}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <label style={{
                  display: "block", fontSize: 10, fontWeight: 800,
                  color: "#8B9AAB", letterSpacing: 1.2, marginBottom: 6,
                }}>
                  TARGET TIME &nbsp;
                  <span style={{ fontWeight: 400, fontSize: 10 }}>
                    e.g. 58.90 &nbsp;·&nbsp; 1:58.45 &nbsp;·&nbsp; 16:24.00
                  </span>
                </label>
                <input
                  value={timeInput}
                  onChange={e => { setTimeInput(e.target.value); setUseCustom(false); }}
                  placeholder="1:58.45"
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 9,
                    fontSize: 24, fontWeight: 900, fontFamily: "monospace", letterSpacing: 2,
                    border: `2.5px solid ${valid ? theme.accent : "#D0DAE0"}`,
                    background: valid ? theme.light : "#FAFBFC",
                    color: "#0A2540", outline: "none", boxSizing: "border-box",
                    transition: "all 0.2s",
                  }}
                />
                {timeInput && !valid && (
                  <div style={{ color: "#D5508A", fontSize: 11, marginTop: 4 }}>
                    Cannot read that time - try <b>58.90</b> or <b>1:58.45</b> or <b>16:24.00</b>
                  </div>
                )}
                {/* For OW + time mode, show the derived pace */}
                {isOW && valid && (
                  <div style={{ fontSize: 11, color: theme.accent, fontWeight: 700, marginTop: 6 }}>
                    → Pace per 100m: <span style={{ fontFamily: "monospace" }}>{formatTime((totalSecs / event.dist) * 100, true)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* SPLIT PROFILE */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block", fontSize: 10, fontWeight: 800,
              color: "#8B9AAB", letterSpacing: 1.2, marginBottom: 6,
            }}>
              SPLIT PROFILE
            </label>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {PROFILES.map(p => {
                const active = !useCustom && profileKey === p.key;
                return (
                  <button key={p.key}
                    onClick={() => { setProfileKey(p.key); setUseCustom(false); }}
                    style={{
                      padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      border: `1.5px solid ${active ? theme.accent : "#D0DAE0"}`,
                      background: active ? theme.accent : "white",
                      color: active ? "white" : "#0A2540",
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                    {p.label}
                  </button>
                );
              })}
            </div>
            {!useCustom && (
              <div style={{ fontSize: 10, color: "#8B9AAB", marginTop: 5 }}>{profile.desc}</div>
            )}
          </div>

          {/* CUSTOM SPLITS */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block", fontSize: 10, fontWeight: 800,
              color: "#8B9AAB", letterSpacing: 1.2, marginBottom: 6,
            }}>
              OR ENTER CUSTOM SPLITS
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[["Front half", customFront, setCustomFront], ["Back half", customBack, setCustomBack]].map(([lbl, val, setter]) => (
                <div key={lbl} style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: "#8B9AAB", fontWeight: 700, marginBottom: 3 }}>{lbl}</div>
                  <input
                    value={val}
                    onChange={e => { setter(e.target.value); setUseCustom(true); }}
                    placeholder="29.50"
                    style={{
                      width: "100%", padding: "9px 10px", borderRadius: 8,
                      fontSize: 15, fontWeight: 800, fontFamily: "monospace",
                      border: `1.5px solid ${useCustom ? theme.accent : "#D0DAE0"}`,
                      background: useCustom ? theme.light : "white",
                      color: "#0A2540", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RESULTS */}
          {valid && splits && (
            <div style={{
              background: "#F7FFFE", borderRadius: 12, padding: "18px 16px",
              border: `2px solid ${theme.border}`, transition: "border-color 0.3s",
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#8B9AAB", letterSpacing: 1.2, marginBottom: 14 }}>
                RESULTS
              </div>

              {/* Split numbers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" }}>
                <div style={{
                  textAlign: "center", padding: "14px 8px", borderRadius: 10,
                  background: theme.light, border: `1.5px solid ${theme.border}`,
                }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: theme.accent, letterSpacing: 1.2 }}>FRONT HALF</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0A2540", fontFamily: "monospace", lineHeight: 1.2 }}>
                    {secondsToHms(splits.front)}
                  </div>
                  <div style={{ fontSize: 10, color: "#8B9AAB", marginTop: 2 }}>{event.dist / 2}m</div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#8B9AAB", fontWeight: 700, marginBottom: 4 }}>TOTAL</div>
                  <div style={{
                    fontSize: 18, fontWeight: 900, color: theme.accent, fontFamily: "monospace",
                    background: "white", padding: "7px 10px", borderRadius: 8,
                    border: `2px solid ${theme.accent}`, transition: "color 0.3s, border-color 0.3s",
                  }}>
                    {secondsToHms(splits.front + splits.back)}
                  </div>
                  <div style={{ fontSize: 9, color: "#8B9AAB", marginTop: 4 }}>
                    {useCustom ? "custom" : "target"}
                  </div>
                </div>

                <div style={{
                  textAlign: "center", padding: "14px 8px", borderRadius: 10,
                  background: "#EEF2FF", border: "1.5px solid #B8C8F0",
                }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#3A6BD5", letterSpacing: 1.2 }}>BACK HALF</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#0A2540", fontFamily: "monospace", lineHeight: 1.2 }}>
                    {secondsToHms(splits.back)}
                  </div>
                  <div style={{ fontSize: 10, color: "#8B9AAB", marginTop: 2 }}>{event.dist / 2}m</div>
                </div>
              </div>

              {/* Diff badge */}
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 12 }}>
                {isEven
                  ? <span style={{ color: "#8B9AAB" }}>Even split</span>
                  : isNeg
                  ? <span style={{ color: "#2EAA6A", fontWeight: 700 }}>
                      Negative split by {diff.toFixed(2)}s
                    </span>
                  : <span style={{ color: "#D5508A", fontWeight: 700 }}>
                      Positive split by {diff.toFixed(2)}s
                    </span>
                }
              </div>

              <SplitBar front={splits.front} back={splits.back} theme={theme} />
              <PaceStats totalSecs={totalSecs} event={event} theme={theme} />
              <IMLegs totalSecs={totalSecs} event={event} />
              <LapBreakdown totalSecs={totalSecs} event={event} frontRatio={splits.ratio} theme={theme} />
            </div>
          )}
        </div>

        <p style={{ color: "#3A7A90", fontSize: 10, textAlign: "center", marginTop: 14 }}>
          auramove.nz · All Events Swim Split Calculator
        </p>
      </div>
    </div>
  );
}
