/* Runs before first paint (loaded in <head>) so there is no theme flash. */
(function () {
  var t = 'night';
  try {
    var saved = localStorage.getItem('ks-theme');
    if (saved === 'day' || saved === 'night') t = saved;
    else if (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches) t = 'day';
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.classList.add('js');
})();
