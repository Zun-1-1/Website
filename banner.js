(function () {
  const SCALE = 0.7;

  const cmProbe = document.createElement('div');
  cmProbe.style.position = 'absolute';
  cmProbe.style.visibility = 'hidden';
  cmProbe.style.height = '1cm';
  document.body.appendChild(cmProbe);
  const CM = cmProbe.getBoundingClientRect().height * SCALE;
  cmProbe.remove();

  window.SCALE = SCALE;
  window.CM = CM;

  const narrowQuery = window.matchMedia('(max-width: 700px), (max-height: 520px)');
  window.isNarrow = () => narrowQuery.matches;

  let lockedWidth = window.innerWidth;
  let lockedHeight = window.innerHeight;

  window.addEventListener('resize', () => {
    if (window.innerWidth !== lockedWidth) {
      lockedWidth = window.innerWidth;
      lockedHeight = window.innerHeight;
    }
  });

  window.viewportHeight = () => lockedHeight;

  const banner = document.createElement('div');
  banner.style.position = 'fixed';
  banner.style.top = '0';
  banner.style.left = '0';
  banner.style.width = '100%';
  banner.style.boxSizing = 'border-box';
  banner.style.backgroundColor = 'white';
  banner.style.padding = `${0.9 * CM}px 0 ${0.5 * CM}px ${2.3 * CM}px`;
  banner.style.zIndex = '10';
  banner.style.pointerEvents = 'none';

  const h1 = document.createElement('a');
  h1.textContent = 'Osmolska';
  h1.href = 'index.html';
  h1.style.pointerEvents = 'auto';
  h1.style.textDecoration = 'none';
  h1.style.color = 'black';
  h1.style.cursor = 'pointer';
  h1.style.fontFamily = 'Georgia, serif';
  h1.style.display = 'block';
  h1.style.fontWeight = 'bold';
  h1.style.fontSize = `${49 * SCALE}px`;
  h1.style.lineHeight = '0.8';
  h1.style.margin = '0';

  banner.appendChild(h1);
  document.body.appendChild(banner);

  function layoutBanner() {
    const narrow = window.isNarrow();
    h1.style.fontSize = narrow ? '26px' : `${49 * SCALE}px`;
    h1.style.lineHeight = narrow ? '0.85' : '0.8';
    banner.style.padding = narrow
      ? `${0.5 * CM}px 0 ${0.4 * CM}px ${1.4 * CM}px`
      : `${0.9 * CM}px 0 ${0.5 * CM}px ${2.3 * CM}px`;
  }

  window.addEventListener('resize', layoutBanner);
  layoutBanner();

  window.bannerHeight = () => banner.getBoundingClientRect().height;

  window.keepClearOfBanner = (element) => {
    element.style.marginTop = window.bannerHeight() + 'px';
  };
})();