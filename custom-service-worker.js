(function () {
  "use strict";
  console.log("custom-worker-2");

  self.addEventListener("notificationclick", (event) => {
    if (clients.openWindow && event.notification.data.url) {
      event.waitUntil(clients.openWindow(event.notification.data.url));
    }
  });
})();
