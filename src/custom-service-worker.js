importScripts("./ngsw-worker.js");

(function () {
  "use strict";
  console.log("custom-worker-loaded.-");

  self.addEventListener("notificationclick", (event) => {
    if (clients.openWindow && event.notification.data.url) {
      event.waitUntil(clients.openWindow(event.notification.data.url));
    }
  });
})();
