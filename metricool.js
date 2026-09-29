(function () {
  if (window.__metricoolTrackerLoaded) return;
  window.__metricoolTrackerLoaded = true;

  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://tracker.metricool.com/resources/be.js";
  script.onload = function () {
    if (window.beTracker) {
      window.beTracker.t({ hash: "fa01c8633f4afadb9840d63454b44d64" });
    }
  };
  document.head.appendChild(script);
})();
