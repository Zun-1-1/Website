
(function () {
  'use strict';

  const narrow = window.matchMedia('(max-width: 700px), (max-height: 520px)');

  const scale = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--scale')) || 1;

  const cmProbe = document.createElement('div');
  cmProbe.style.height = '1cm';
  const vhProbe = document.createElement('div');
  vhProbe.style.height = '100vh';
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:absolute;top:0;visibility:hidden;pointer-events:none';
  probe.append(cmProbe, vhProbe);
  document.body.append(probe);

  const CM = cmProbe.getBoundingClientRect().height * scale;
  const viewportHeight = () => vhProbe.getBoundingClientRect().height;

  function fade(distance, leaving) {
    if (distance <= CM) return 1;
    const reach = narrow.matches
      ? viewportHeight() * (leaving ? 0.35 : 1.15)
      : viewportHeight() * 0.5;
    const t = Math.min(1, (distance - CM) / Math.max(1, reach - CM));
    return 1 - t * t * (3 - 2 * t);
  }

  function init(options) {
    const items = Array.from(options.items);
    const tracks = Array.from(options.tracks);


    const flowOnMobile = !!options.flowOnMobile;

    const labels = items.map(item =>
      Array.from(item.querySelectorAll('.gallery__label')));

    const panels = items.map(item => {
      const content = item.querySelector('.gallery__panel');
      return content ? { window: content.parentElement, content } : null;
    });

    let overflows = items.map(() => 0);


    function measure() {
      const isNarrow = narrow.matches;
      const vh = viewportHeight();

      panels.forEach((panel, i) => {
        if (!panel) return;
        panel.window.style.height = isNarrow
          ? ''
          : items[i].querySelector('.gallery__photo')
              .getBoundingClientRect().width + 'px';
      });

      overflows = panels.map(panel =>
        !panel || isNarrow ? 0
          : Math.max(0, panel.content.scrollHeight - panel.window.clientHeight));

      tracks.forEach((track, i) => {

        track.style.height = !isNarrow && overflows[i] > 0
          ? vh + overflows[i] + 'px'
          : '';
      });


      labels.forEach(sideLabels => {
        sideLabels.forEach(label => label.style.removeProperty('--label-shift'));
      });
      if (!isNarrow) {
        const limit = window.innerWidth - CM;
        labels.forEach(sideLabels => {
          sideLabels.forEach(label => {
            const box = label.getBoundingClientRect();
            const shift = box.left < CM ? CM - box.left
              : box.right > limit ? limit - box.right
              : 0;
            if (shift) label.style.setProperty('--label-shift', shift + 'px');
          });
        });
      }
    }

    function place() {
      const isNarrow = narrow.matches;
      const vh = viewportHeight();
      const centre = vh / 2;


      const rects = tracks.map(track => track.getBoundingClientRect());

      items.forEach((item, i) => {
        if (isNarrow && flowOnMobile) return;

        const rect = rects[i];
        const shiftX = isNarrow ? 0 : -50;
        const overflow = overflows[i];

        if (overflow > 0) {
          const sweep = vh + rect.height;
          const travel = Math.max(0, (sweep - overflow) / 2);
          const holdStart = vh - travel;
          const holdEnd = holdStart - overflow;

          if (rect.top >= holdStart) {
            const d = rect.top - holdStart;
            item.style.transform = `translate(${shiftX}%, calc(-50% + ${d * 0.5}px))`;
            item.style.opacity = fade(d, false);
          } else if (rect.top <= holdEnd) {
            const d = holdEnd - rect.top;
            item.style.transform = `translate(${shiftX}%, calc(-50% + ${-d * 0.5}px))`;
            item.style.opacity = fade(d, true);
          } else {
            item.style.transform = `translate(${shiftX}%, -50%)`;
            item.style.opacity = 1;
            const progress = Math.min(1,
              Math.max(0, (holdStart - rect.top) / overflow));
            panels[i].content.style.transform =
              `translateY(${-(overflow * progress)}px)`;
          }
        } else {
          const offset = rect.top + rect.height / 2 - centre;
          item.style.transform =
            `translate(${shiftX}%, calc(-50% + ${offset * 0.5}px))`;
          item.style.opacity = fade(Math.abs(offset), offset < 0);
        }
      });
    }

    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    }

    function onResize() {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      measure();
      place();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);

    onResize();

    return { refresh: onResize };
  }

  window.Gallery = { init, viewportHeight };
})();
