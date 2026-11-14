import { gsap } from "gsap";

export function initStepMotion(section) {
  const strip = section.querySelector(".hiw__tabs");
  const indicator = section.querySelector(".hiw__tab-indicator");
  const tabs = [...strip.querySelectorAll("[role=tab]")];
  const numbers = tabs.map(tab => tab.querySelector(".hiw__number"));
  const title = section.querySelector("[data-step-title]");
  const description = section.querySelector("[data-step-description]");
  const count = section.querySelector("[data-step-number]");
  const actions = section.querySelector(".hiw__actions");
  const segments = [...section.querySelectorAll(".hiw__segment")];
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const animated = [...numbers, ...segments, title, description, count, actions];
  let active = 0, disposed = false, transition;

  function position(immediate = false) {
    const tab = tabs[active];
    if (!tab || !strip.clientWidth) return;
    const values = { x: tab.offsetLeft, y: tab.offsetTop, width: tab.offsetWidth, height: tab.offsetHeight };
    gsap.killTweensOf(indicator);
    if (immediate || motion.matches || !strip.dataset.stepMotion) gsap.set(indicator, values);
    else gsap.to(indicator, { ...values, duration: .48, ease: "back.out(1.3)", overwrite: true });
    strip.dataset.stepMotion = "ready";
  }

  function select(index, { animate = true, direction = 1 } = {}) {
    const previous = active;
    active = index;
    transition?.kill();
    gsap.killTweensOf(animated);
    gsap.set(animated, { clearProps: "transform,opacity,visibility,filter" });
    position(!animate);
    if (!animate || motion.matches) { section.dataset.stepTransition = "idle"; return; }
    section.dataset.stepTransition = "moving";
    transition = gsap.timeline({ onComplete() { section.dataset.stepTransition = "idle"; } });
    transition.fromTo(numbers[index], { scale: .65, rotation: direction * -16 },
      { scale: 1, rotation: 0, duration: .6, ease: "back.out(2.2)", clearProps: "transform" }, 0);
    transition.fromTo(count, { y: direction * -18, opacity: 0 },
      { y: 0, opacity: 1, duration: .38, ease: "power3.out", clearProps: "transform,opacity" }, .02);
    transition.fromTo([title, description, actions], { x: direction * 28, y: 14, opacity: 0, filter: "blur(5px)" },
      { x: 0, y: 0, opacity: 1, filter: "blur(0px)", duration: .46, stagger: .06,
        ease: "power3.out", clearProps: "transform,opacity,filter" }, .04);
    const changed = segments.slice(Math.min(previous, index), Math.max(previous, index) + 1);
    transition.fromTo(changed, { scaleX: .3, transformOrigin: direction > 0 ? "left center" : "right center" },
      { scaleX: 1, duration: .35, stagger: .04, ease: "power2.out", clearProps: "transform,transformOrigin" }, .05);
  }

  const resizeObserver = new ResizeObserver(() => position(true));
  resizeObserver.observe(strip);
  const onMotionChange = () => select(active, { animate: false });
  motion.addEventListener("change", onMotionChange);
  document.fonts.ready.then(() => { if (!disposed) position(true); });
  position(true);
  return { select, destroy() {
    disposed = true;
    transition?.kill();
    resizeObserver.disconnect();
    motion.removeEventListener("change", onMotionChange);
    gsap.killTweensOf([...animated, indicator]);
    gsap.set(animated, { clearProps: "transform,opacity,visibility,filter" });
  } };
}
