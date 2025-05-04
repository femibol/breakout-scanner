
function debug(message) {
  let debugBox = document.getElementById("debug-log");
  if (!debugBox) {
    debugBox = document.createElement("div");
    debugBox.id = "debug-log";
    debugBox.style.background = "#222";
    debugBox.style.color = "#0f0";
    debugBox.style.padding = "10px";
    debugBox.style.fontFamily = "monospace";
    debugBox.style.margin = "10px";
    debugBox.style.whiteSpace = "pre-wrap";
    document.body.insertBefore(debugBox, document.body.firstChild);
  }
  debugBox.innerText = message + "\n" + debugBox.innerText;
}
debug("Live race scanner script loaded. Now plug in the logic or API.");
