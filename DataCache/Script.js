//check if service worker in browser or not
if (navigator.serviceWorker) {
  navigator.serviceWorker
    .register("./sw.js")
    .then((registration) => {
      registration.update(); // Force update
    })
    .catch((err) => {
      console.log("Service Worker Not Registered", err);
    });
}
