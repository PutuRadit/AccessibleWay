import { gsap } from "gsap";

/** Scroll entrances share one observer; the scene camera and model stay intact. */
export function initLandingMotion(root) {
  const media = gsap.matchMedia();
  const groups = [
    { trigger: ".hero__copy", targets: "[data-hero-reveal]", y: 64, x: -24, blur: 8, stagger: .13 },
    { trigger: ".hero", targets: ".hero-visual", y: 60, x: 70, blur: 0, duration: 1.15 },
    { trigger: ".hiw__intro", targets: ".hiw__heading, .hiw__subtitle", y: 58, blur: 4, stagger: .15 },
    { trigger: ".hiw__tabs", targets: ".hiw__tabs", y: 42, blur: 0 },
    { trigger: ".hiw__stage", targets: ".hiw__stage", y: 76, blur: 0, duration: 1.05 },
    { trigger: ".about__copy", targets: ".about__badge, .about__heading, .about__body, .about__scope", y: 42, x: -18, blur: 4, stagger: .1 },
    { trigger: ".about__showcase", targets: ".about__showcase", y: 44, x: 28, blur: 0, duration: 1 },
    { trigger: ".about__story", targets: ".about__story-card", y: 40, blur: 0, stagger: .12 },
    { trigger: ".about__features-header", targets: ".about__features-header", y: 36, blur: 0 },
    { trigger: ".about__feature-grid", targets: ".about__feature", y: 40, blur: 0, stagger: .1 },
    { trigger: ".about__team-header", targets: ".about__team-header", y: 36, blur: 0 },
    { trigger: ".about__team", targets: ".about__member", y: 36, blur: 0, stagger: .12 },
    { trigger: ".contact__copy", targets: ".contact__badge, .contact__heading, .contact__intro", y: 40, x: -18, blur: 4, stagger: .1 },
    { trigger: ".contact__topics", targets: ".contact__topic", y: 36, blur: 0, stagger: .1 },
    { trigger: ".contact__info-note", targets: ".contact__info-note", y: 24, blur: 0 },
    { trigger: ".contact__panel", targets: ".contact__panel", y: 44, blur: 0, duration: 1 },
  ];

  media.add("(prefers-reduced-motion: no-preference)", () => {
    const records = new Map();
    const context = gsap.context(() => {
      for (const group of groups) {
        const trigger = root.querySelector(group.trigger);
        const targets = [...root.querySelectorAll(group.targets)];
        if (!trigger || !targets.length) continue;
        const from = { y: group.y, x: group.x ?? 0, opacity: 0,
          ...(group.blur ? { filter: `blur(${group.blur}px)` } : {}) };
        records.set(trigger, { group, targets, from, timeline: null, revealed: false });
        gsap.set(targets, from);
      }
    }, root);
    function reveal(trigger, record, immediate = false) {
      record.revealed = true;
      record.timeline?.kill();
      if (immediate) {
        gsap.set(record.targets, { clearProps: "transform,opacity,visibility,filter" });
        trigger.dataset.scrollReveal = "visible";
        return;
      }
      trigger.dataset.scrollReveal = "entering";
      record.timeline = gsap.to(record.targets, {
        x: 0, y: 0, opacity: 1, ...(record.group.blur ? { filter: "blur(0px)" } : {}),
        duration: record.group.duration ?? .9, stagger: record.group.stagger ?? 0,
        ease: "power3.out", clearProps: "transform,opacity,visibility,filter",
        onComplete() { trigger.dataset.scrollReveal = "visible"; },
      });
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const record = records.get(entry.target);
        if (!record) continue;
        if (entry.isIntersecting && entry.intersectionRatio >= .12 && !record.revealed) {
          reveal(entry.target, record);
        } else if (!entry.isIntersecting && record.revealed &&
          !record.targets.some(target => target.contains(document.activeElement))) {
          record.revealed = false;
          record.timeline?.kill();
          gsap.set(record.targets, record.from);
          entry.target.dataset.scrollReveal = "waiting";
        }
      }
    }, { threshold: [0, .12], rootMargin: "0px 0px -24px 0px" });
    records.forEach((_, trigger) => observer.observe(trigger));
    const onFocus = event => records.forEach((record, trigger) => {
      if (record.targets.some(target => target.contains(event.target))) reveal(trigger, record, true);
    });
    root.addEventListener("focusin", onFocus);

    return () => {
      observer.disconnect();
      root.removeEventListener("focusin", onFocus);
      records.forEach(record => {
        record.timeline?.kill();
        gsap.set(record.targets, { clearProps: "transform,opacity,visibility,filter" });
      });
      context.revert();
    };
  });
  return () => media.revert();
}
