(function() {
  if (sessionStorage.getItem('malty_tracked')) return;
  sessionStorage.setItem('malty_tracked', '1');

  var data = {
    page: window.location.pathname + window.location.hash,
    referrer: document.referrer || '',
    screen: window.screen.width + 'x' + window.screen.height,
    lang: navigator.language || '',
    ua: navigator.userAgent || ''
  };

  send(data);

  function send(d) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/admin?action=track-visit', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(d));
    } catch(e) {}
  }
})();
