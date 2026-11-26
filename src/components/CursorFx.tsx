// Cursor animation for the web build (the browser version / artifact) with a mouse or trackpad:
// a cyan ring trails the pointer on a soft spring, grows over anything tappable, squeezes while
// pressed, fades over text fields, and lets a few bubbles rise where you click.
// Does nothing on phones (Expo Go), on touch screens, or when the viewer asked for reduced motion.
// It draws plain DOM elements on a layer that never takes clicks, so it cannot get in the way.
import { useEffect } from "react";
import { Platform } from "react-native";
import { C } from "../theme";

const TAPPABLE = '[role="button"],[role="tab"],[role="link"],[role="radio"],[role="checkbox"],a,button,[tabindex="0"]';
const TEXT = "input,textarea,[contenteditable='true']";
const RING = 34;

export function CursorFx() {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const w: any = globalThis as any;
    const doc: any = w.document;
    if (!doc || !w.matchMedia) return;
    if (!w.matchMedia("(pointer: fine)").matches || w.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = (css: string) => { const d = doc.createElement("div"); d.style.cssText = css; return d; };
    const layer = el("position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:hidden;");
    const ring = el(`position:fixed;left:0;top:0;width:${RING}px;height:${RING}px;margin:${-RING / 2}px 0 0 ${-RING / 2}px;border-radius:50%;border:1.5px solid;opacity:0;transition:opacity .2s,background-color .2s,border-color .2s;will-change:transform;`);
    const dot = el("position:fixed;left:0;top:0;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;opacity:0;transition:opacity .2s;will-change:transform;");
    layer.append(ring, dot);
    doc.body.appendChild(layer);

    let mx = -100, my = -100, rx = -100, ry = -100, s = 1;
    let hover = false, text = false, pressed = false, shown = false, raf = 0;

    const paint = () => {
      ring.style.borderColor = C.primary;
      // a thin halo in the page colour keeps the ring visible over cyan buttons too
      ring.style.boxShadow = `0 0 0 1px ${C.bg}, inset 0 0 0 1px ${C.bg}`;
      dot.style.boxShadow = `0 0 0 1.5px ${C.bg}`;
      ring.style.backgroundColor = hover && !pressed ? C.primaryTint : "transparent";
      dot.style.backgroundColor = C.primary;
      ring.style.opacity = shown && !text ? "1" : "0";
      dot.style.opacity = shown && !text ? "1" : "0";
    };
    const tick = () => {
      // ease the ring toward the pointer and toward its target size
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      const target = pressed ? 0.78 : hover ? 1.65 : 1;
      s += (target - s) * 0.2;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) scale(${s})`;
      const still = Math.abs(mx - rx) < 0.1 && Math.abs(my - ry) < 0.1 && Math.abs(target - s) < 0.002;
      raf = still ? 0 : w.requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf) raf = w.requestAnimationFrame(tick); };

    const onMove = (e: any) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      mx = e.clientX; my = e.clientY;
      if (!shown) { rx = mx; ry = my; shown = true; }
      dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
      const t = e.target && e.target.closest ? e.target : null;
      hover = !!(t && t.closest(TAPPABLE));
      text = !!(t && t.closest(TEXT));
      paint(); wake();
    };
    const onDown = (e: any) => { if (e.pointerType === "mouse") { pressed = true; paint(); wake(); } };
    const onUp = (e: any) => { if (e.pointerType === "mouse") { pressed = false; paint(); wake(); } };
    const onLeave = (e: any) => { if (!e.relatedTarget) { shown = false; paint(); } };
    const onClick = (e: any) => {
      if (text || !shown) return;
      for (let i = 0; i < 5; i++) {
        const size = 5 + Math.random() * 5;
        const b = el(`position:fixed;left:${e.clientX - size / 2}px;top:${e.clientY - size / 2}px;width:${size}px;height:${size}px;border-radius:50%;border:1px solid ${C.primary};background:${C.primaryTint};`);
        layer.appendChild(b);
        const dx = (Math.random() - 0.5) * 34, dy = -(36 + Math.random() * 46);
        const anim = b.animate(
          [{ transform: "translate(0,0) scale(.5)", opacity: 0.95 }, { transform: `translate(${dx}px,${dy}px) scale(1)`, opacity: 0 }],
          { duration: 650 + Math.random() * 450, easing: "cubic-bezier(.2,.7,.3,1)", delay: i * 35 }
        );
        anim.onfinish = () => b.remove();
      }
    };

    doc.addEventListener("pointermove", onMove, { passive: true });
    doc.addEventListener("pointerdown", onDown, { passive: true });
    doc.addEventListener("pointerup", onUp, { passive: true });
    doc.addEventListener("pointerout", onLeave, { passive: true });
    doc.addEventListener("click", onClick, { passive: true });
    return () => {
      if (raf) w.cancelAnimationFrame(raf);
      doc.removeEventListener("pointermove", onMove);
      doc.removeEventListener("pointerdown", onDown);
      doc.removeEventListener("pointerup", onUp);
      doc.removeEventListener("pointerout", onLeave);
      doc.removeEventListener("click", onClick);
      layer.remove();
    };
  }, []);
  return null;
}
