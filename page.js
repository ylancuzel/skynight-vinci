"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// [titre, durée en secondes] - conducteur VINCI Centre-Est, jeudi 26 novembre 2026
const SEQ = [
  ["Entrée en salle - Accueil café + badges", 2700],
  ["Lancement / Montée sur scène", 30],
  ["Mot d’accueil, consignes sécurité, intro", 300],
  ["Interaction salle - créez votre réseau", 120],
  ["Transition - Intro VINCI c’est quoi ?", 30],
  ["FILM 1 - Comment VINCI est devenu VINCI", 960],
  ["Chiffres clés du Groupe", 300],
  ["Transition - Et en Centre-Est ?", 60],
  ["FILM 2 - VINCI en Centre-Est", 240],
  ["Infos clés VINCI en Centre-Est", 360],
  ["Interaction salle - 2 questions Vrai/Faux", 240],
  ["Transition - Intro performance sociale et sociétale", 30],
  ["Interaction salle - quiz promesse employeur", 300],
  ["AXE 1 - Employeur responsable - qui protège", 240],
  ["FILM 3 - Santé sécurité + appel Lionel", 120],
  ["Employeur responsable - qui protège (Club Pivot Prévention)", 180],
  ["Employeur responsable - qui favorise le développement", 120],
  ["FILM 4 - Employeur responsable", 180],
  ["Employeur responsable - qui rassemble", 120],
  ["Appel sur scène de Françoise", 30],
  ["Employeur responsable - qui rassemble (Trajeo’h)", 180],
  ["Appel sur scène de Margaux, Marie, Alicia et Émilie", 30],
  ["AXE 2 - Entreprise responsable - employabilité durable", 240],
  ["Entreprise responsable - employabilité durable (ViE)", 180],
  ["Entreprise responsable - engagement citoyen", 240],
  ["Conclusion de la séquence", 60],
  ["FILM 5 - Culture RH", 120],
  ["Transition - Intro performance environnementale / Appel Isabelle", 30],
  ["Ambition environnementale de VINCI", 300],
  ["Appel sur scène de Cécile, Dominique, Marie", 30],
  ["Présentation du Club Pivot environnement", 150],
  ["Slideshow en musique", 30],
  ["AXE 1 CLIMAT", 270],
  ["Appel sur scène d’Hélène, Zoé, Lionel", 30],
  ["AXE 2 ÉCO CIRCULAIRE", 90],
  ["FILM 6 - BACKIN", 136],
  ["Backin", 150],
  ["AXE 3 MILIEUX NATURELS", 450],
  ["Conclusion séquence environnement", 150],
  ["Annonce pause déjeuner + village innovation IA", 30],
  ["PAUSE DÉJEUNER + Village innovation IA", 5400],
  ["Retour en salle", 900],
  ["Générique", 30],
  ["Transition - Intro performance économique", 30],
  ["FILM 7 - Grégoire Thibault", 180],
  ["Appel sur scène des 4 intervenants", 30],
  ["Comment VINCI contribue à l’émergence d’un territoire ?", 300],
  ["Comment VINCI participe au cycle de vie d’une infrastructure", 300],
  ["Mégatendance besoins électriques : le nucléaire", 180],
  ["FILM 8 - Nucléaire", 150],
  ["Transition - Et à l’échelle du Groupe ?", 30],
  ["FILM 9 - Thierry Mirville", 180],
  ["Transition - Intro stratégie et perspectives", 30],
  ["FILM 10 - Christophe Ferrer", 180],
  ["Appel et montée sur scène Pierre Anjolras", 30],
  ["Stratégie, perspectives du Groupe", 1500],
  ["Interaction salle / Q&A", 2700],
  ["Conclusion journée + photo de groupe", 120],
];

const KEY = "vinci-timer-v1";
const INITIAL = { idx: -1, startTs: 0, running: false, done: false };

const pad = (n) => (n < 10 ? "0" : "") + n;
const fmt = (x) => {
  const h = Math.floor(x / 3600);
  const m = Math.floor((x % 3600) / 60);
  const s = x % 60;
  return (h > 0 ? pad(h) + ":" : "") + pad(m) + ":" + pad(s);
};

const CSS = `
.vt{--bg:#0d0f12;--fg:#fff;--mut:#8a919c;--btn:#1f2630;--red:#ff2d2d;--cur:#26303c;
min-height:100dvh;box-sizing:border-box;background:var(--bg);color:var(--fg);
font-family:system-ui,-apple-system,"Segoe UI",sans-serif;display:flex;flex-direction:column;
align-items:center;gap:14px;padding:calc(24px + env(safe-area-inset-top,0px)) 12px calc(24px + env(safe-area-inset-bottom,0px));
transition:background .2s}
@media (prefers-color-scheme:light){.vt{--bg:#f3f4f6;--fg:#111;--mut:#5b6470;--btn:#e1e5ea;--cur:#d3dae3}}
.vt.over{background:#2a0a0a;--fg:#fff}
.vt .t{font-family:"SF Mono",Menlo,Consolas,monospace;font-size:min(22vw,160px);font-weight:700;letter-spacing:.02em;line-height:1.1}
.vt.over .t{color:var(--red)}
.vt .s{color:var(--mut);font-size:14px;text-align:center;min-height:20px}
.vt .row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.vt button{background:var(--btn);color:var(--fg);border:0;border-radius:12px;padding:14px 20px;font-size:16px;font-weight:600;cursor:pointer;font-family:inherit}
.vt .ok{background:#1d9e4b;color:#fff}
.vt.over .ok{background:var(--red)}
.vt .list{width:100%;max-width:560px;max-height:42vh;overflow-y:auto;margin-top:6px}
.vt .it{display:flex;gap:8px;padding:8px 10px;border-radius:8px;font-size:13px;cursor:pointer}
.vt .it.cur{background:var(--cur);font-weight:600}
.vt .it .n{color:var(--mut);width:24px;flex:none}
.vt .it .d{margin-left:auto;font-family:Menlo,Consolas,monospace;flex:none}
`;

export default function Page() {
  const [state, setState] = useState(INITIAL);
  const [now, setNow] = useState(0);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(INITIAL);
  const wakeRef = useRef(null);
  stateRef.current = state;

  // Actions (stables : utilisent uniquement des mises à jour fonctionnelles)
  const begin = useCallback((i) => {
    const ts = Date.now();
    setNow(ts);
    setState({ idx: i, startTs: ts, running: true, done: false });
  }, []);

  const valider = useCallback(() => {
    const ts = Date.now();
    setNow(ts);
    setState((p) =>
      p.idx >= SEQ.length - 1 && p.idx >= 0
        ? { ...p, running: false, done: true }
        : { idx: p.idx + 1, startTs: ts, running: true, done: false }
    );
  }, []);

  const back = useCallback(() => {
    const ts = Date.now();
    setNow(ts);
    setState((p) => {
      if (p.idx < 0) return p;
      const i = p.done ? p.idx : Math.max(0, p.idx - 1);
      return { idx: i, startTs: ts, running: true, done: false };
    });
  }, []);

  const reset = useCallback(() => {
    if (stateRef.current.running && !window.confirm("Remettre le conducteur à zéro ?")) return;
    setState(INITIAL);
  }, []);

  // Restauration de l’état après rechargement
  useEffect(() => {
    try {
      const o = JSON.parse(localStorage.getItem(KEY));
      if (o && o.idx >= 0 && o.idx < SEQ.length) {
        setState({ idx: o.idx, startTs: o.startTs, running: !!o.running, done: !!o.done });
      }
    } catch (e) {}
    setNow(Date.now());
    setReady(true);
  }, []);

  // Sauvegarde
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {}
  }, [state, ready]);

  // Horloge (heure réelle : reste juste même si l’onglet est en arrière-plan)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);

  // Clavier : Espace/Entrée = valider, flèches = retour / passer
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        valider();
      } else if (e.code === "ArrowRight") valider();
      else if (e.code === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [valider, back]);

  // Écran maintenu allumé pendant le conducteur
  useEffect(() => {
    const lock = () => {
      try {
        if (state.running && navigator.wakeLock && !wakeRef.current) {
          navigator.wakeLock
            .request("screen")
            .then((w) => {
              wakeRef.current = w;
              w.addEventListener("release", () => (wakeRef.current = null));
            })
            .catch(() => {});
        }
      } catch (e) {}
    };
    lock();
    const onVis = () => !document.hidden && lock();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [state.running]);

  // Affichage
  let text;
  let red = false;
  if (state.done) text = "FIN";
  else if (state.idx < 0) text = fmt(SEQ[0][1]);
  else if (!state.running) text = fmt(SEQ[state.idx][1]);
  else {
    const rem = SEQ[state.idx][1] - (now - state.startTs) / 1000;
    if (rem >= 0) text = fmt(Math.ceil(rem));
    else {
      text = "-" + fmt(Math.floor(-rem));
      red = true;
    }
  }

  const label = state.done
    ? "Conducteur terminé"
    : state.idx < 0
    ? "Prêt"
    : `Séquence ${state.idx + 1}/${SEQ.length} · ${SEQ[state.idx][0]}`;

  useEffect(() => {
    document.title = `${text} · Timer VINCI`;
  }, [text]);

  useEffect(() => {
    const el = document.getElementById("it" + state.idx);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [state.idx]);

  return (
    <div className={"vt" + (red ? " over" : "")}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="t">{text}</div>
      <div className="s">{label}</div>
      <div className="row">
        <button onClick={back} aria-label="Retour">←</button>
        <button className="ok" onClick={valider}>Valider</button>
        <button onClick={valider} aria-label="Passer">→</button>
      </div>
      <div className="row">
        <button onClick={reset}>Reset</button>
      </div>
      <div className="list">
        {SEQ.map((q, i) => (
          <div
            key={i}
            id={"it" + i}
            className={"it" + (i === state.idx ? " cur" : "")}
            onClick={() => begin(i)}
          >
            <span className="n">{i + 1}</span>
            <span>{q[0]}</span>
            <span className="d">{fmt(q[1])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
