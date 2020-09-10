importScripts('./ngsw-worker.js');
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  console.log(notification)
  if (notification && notification.data.patientID && notification.data.visitID) {
    navigationUrl = `intelehealth/visitSummary/${notification.data.patientID}/${notification.data.visitID}`;
    event.waitUntil(
      clients.matchAll({type: 'window'})
        .then(clients => clients.filter(client => {
          console.log(client)
          return client.url === 'https://testing.intelehealth.org/intelehealth/home'
        }))
        .then(matchingClients => {
          console.log(matchingClients)
          if (matchingClients[0]) {
            return matchingClients[0].navigate(navigationUrl)
                     .then(client => client.focus());
          }
    
          return clients.openWindow(navigationUrl);
        })
    );
  }
});

self.addEventListener('sync', function(event) {
  console.log(event)
  if (event.tag == 'myFirstSync') {
    
  }
});