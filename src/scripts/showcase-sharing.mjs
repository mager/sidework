export function initializeShowcaseSharing(document, navigator) {
  const copy = document.querySelector('#copy-showcase-link');
  const share = document.querySelector('#share-showcase-link');
  const link = document.querySelector('#showcase-public-link');
  const status = document.querySelector('#showcase-copy-status');
  if (!copy || !link || !status) return;
  const announce = message => { status.textContent = message; status.hidden = false; };
  copy.hidden = false;
  copy.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(link.value);
      announce('Showcase link copied. Ready to send.');
    } catch {
      link.focus();
      link.select();
      announce('Link selected. Copy it from the Public link field.');
    }
  });
  if (share && typeof navigator.share === 'function') {
    share.hidden = false;
    share.addEventListener('click', async () => {
      try {
        await navigator.share({ title: link.dataset.shareTitle, url: link.value });
        announce('Showcase shared.');
      } catch (error) {
        if (error?.name !== 'AbortError') announce('Sharing is unavailable. Use Copy link to share your showcase.');
      }
    });
  }
}
