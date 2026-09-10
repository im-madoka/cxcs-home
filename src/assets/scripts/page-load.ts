/** Initialize on a full load and on every Astro navigation. */
export const onPageLoad = (initialize: () => void) => {
  document.addEventListener('astro:page-load', initialize);

  // A component's module can first load during navigation. In that case the
  // pending astro:page-load initializes it; running now would replay its entrance.
  if (document.readyState !== 'complete') initialize();
};
