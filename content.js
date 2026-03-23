function removeShorts(root = document) {
  // Remove ANY Shorts video links
  root.querySelectorAll('a[href^="/shorts"]').forEach(el => {
    el.closest(`
      ytd-rich-item-renderer,
      ytd-video-renderer,
      ytd-grid-video-renderer,
      ytm-shorts-lockup-view-model-v2,
      ytm-shorts-lockup-view-model
    `)?.remove();
  });

  // Remove ALL Shorts shelves (even renamed ones like "Easy Tie Knots")
  root.querySelectorAll('grid-shelf-view-model').forEach(shelf => {
    if (
      shelf.querySelector('ytm-shorts-lockup-view-model') || 
      shelf.querySelector('a[href^="/shorts"]')
    ) shelf.remove();
  });

  // Remove homepage Shorts shelves
  root.querySelectorAll('ytd-rich-shelf-renderer').forEach(el => {
    if (el.hasAttribute('is-shorts') || el.querySelector('a[href^="/shorts"]')) el.remove();
  });

  // Remove Shorts chips (top filter)
  root.querySelectorAll('yt-chip-cloud-chip-renderer').forEach(chip => {
    if (chip.textContent.includes("Shorts")) chip.remove();
  });

  // Remove sidebar Shorts (main + mini)
  root.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer').forEach(el => {
    const link = el.querySelector('a[href^="/shorts"]');
    const label = el.textContent || "";
    if (link || label.includes("Shorts")) el.remove();
  });

  // Remove stray Shorts components
  root.querySelectorAll('ytm-shorts-lockup-view-model-v2, ytm-shorts-lockup-view-model').forEach(el => el.remove());
}


function processYouTube() {
  if (!location.hostname.includes("youtube.com")) return;

  // Redirect home to Subscriptions
  if (location.pathname === "/" || location.pathname === "/feed/trending" || location.pathname === "/home") {
    location.replace("/feed/subscriptions");
    return; // stop further processing until page reloads
  }

  // Remove Shorts immediately
  removeShorts();

  // Observe dynamic content (SPA)
  if (!window.__shortsObserver__) {
    window.__shortsObserver__ = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) removeShorts(node);
        }
      }
    });
    window.__shortsObserver__.observe(document.body, { childList: true, subtree: true });
  }
}


// Initial run
processYouTube();


// Handle tab visibility (user switches tabs)
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && location.hostname.includes("youtube.com")) {
    processYouTube();
  } else if (window.__shortsObserver__) {
    window.__shortsObserver__.disconnect();
    window.__shortsObserver__ = null;
  }
});