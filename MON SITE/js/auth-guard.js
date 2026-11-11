/**
 * MALTY AUTH GUARD
 * Include this script in every page that requires authentication.
 * <script src="js/auth-guard.js"></script>
 */
(function() {
  // Pages that are fully accessible without an account (publicPages must be checked!)
  var publicPages = ['login.html', 'signup.html', 'index.html', 'admin.html', 'ou-acheter.html', 'support.html', 'brief.html', 'maintenance.html', 'merci.html'];
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Skip auth guard for admin.html (has its own auth)
  if (currentPage === 'admin.html') return;

  var token = localStorage.getItem('malty_token');
  var userEmail = localStorage.getItem('malty_email');
  var guestMode = localStorage.getItem('malty_guest');

  // Pages that require a real account (no guest access)
  var authRequired = ['espace-client.html', 'abonnement.html'];

  // Guest mode: allow browsing on public pages, block on sensitive pages
  if (guestMode) {
    window.maltyIsGuest = true;
    if (authRequired.indexOf(currentPage) !== -1) {
      window.location.href = 'signup.html';
      return;
    }
  }

  // If on login/signup, redirect to index if already logged in
  if (currentPage === 'login.html' || currentPage === 'signup.html') {
    if ((token && userEmail) || guestMode) {
      window.location.href = 'index.html';
    }
    return;
  }

  // Global logout function
  window.maltyLogout = function() {
    fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'logout', email: userEmail }),
      headers: { 'Content-Type': 'application/json' }
    }).catch(function() {});

    localStorage.removeItem('malty_token');
    localStorage.removeItem('malty_email');
    localStorage.removeItem('malty_user');
    localStorage.removeItem('malty_guest');
    window.location.href = 'login.html';
  };

  // Get current user
  window.maltyGetUser = function() {
    if (window.maltyIsGuest) return { name: 'Invité', email: '', guest: true };
    try {
      return JSON.parse(localStorage.getItem('malty_user'));
    } catch (e) {
      return null;
    }
  };

  // Prompt login for actions that require account
  window.maltyRequireAuth = function(callback) {
    if (!window.maltyIsGuest && (!token || !userEmail)) {
      if (confirm('Cette action nécessite un compte. Se connecter maintenant ?')) {
        window.location.href = 'login.html';
      }
      return false;
    }
    if (window.maltyIsGuest) {
      if (confirm('Cette action nécessite un compte. Créer un compte maintenant ?')) {
        window.location.href = 'signup.html';
      }
      return false;
    }
    if (callback) callback();
    return true;
  };

  // If not logged in: only pages outside publicPages require an account
  if (!token || !userEmail) {
    if (publicPages.indexOf(currentPage) === -1) {
      window.location.href = 'login.html';
    }
    return;
  }

  // Verify token with API (silent check)
  fetch('/api/auth', {
    method: 'POST',
    body: JSON.stringify({ action: 'check', email: userEmail, token: token }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (!d.ok) {
      localStorage.removeItem('malty_token');
      localStorage.removeItem('malty_email');
      localStorage.removeItem('malty_user');
      if (publicPages.indexOf(currentPage) === -1) {
        window.location.href = 'login.html';
      }
    } else {
      // Update user info in localStorage
      localStorage.setItem('malty_user', JSON.stringify(d.user));
      // Dispatch event for pages that need user info
      window.dispatchEvent(new CustomEvent('malty-auth', { detail: d.user }));
    }
  })
  .catch(function() {
    // On network error, allow access (offline mode)
    var user = localStorage.getItem('malty_user');
    if (user) {
      window.dispatchEvent(new CustomEvent('malty-auth', { detail: JSON.parse(user) }));
    }
  });
})();
