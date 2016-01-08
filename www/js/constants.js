angular.module('cyfclient.constants', [])

  .constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })

  .constant('USER_ROLES', {
    master: 'master_role',
    child: 'child_role',
    guest: 'guest_role'
  })

  .constant('API_ENDPOINT', {
    url: 'api'
  })

;
