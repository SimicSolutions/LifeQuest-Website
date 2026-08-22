(function () {
  if (window.__metricoolTrackerLoaded) return;
  window.__metricoolTrackerLoaded = true;

  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://tracker.metricool.com/resources/be.js";
  script.onload = function () {
    if (window.beTracker) {
      window.beTracker.t({ hash: "8ff290495957c24e4b3b76c9c55d3f89" });
    }
  };
  document.head.appendChild(script);
})();
