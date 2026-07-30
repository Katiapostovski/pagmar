
// Error detective - loads app_v5.js as text and tries to parse it
fetch('app_v5.js')
  .then(r => r.text())
  .then(src => {
    try {
      new Function(src);
      document.getElementById('app').innerHTML = '<div style="color:lime;padding:20px;font-size:20px;">SYNTAX OK - no parse errors!</div>';
    } catch(e) {
      document.getElementById('app').innerHTML = 
        '<div style="color:yellow;background:#111;padding:20px;font-size:14px;font-family:monospace;white-space:pre-wrap;position:fixed;top:0;left:0;right:0;bottom:0;overflow:auto;z-index:9999">' +
        'PARSE ERROR FOUND:\n\n' + e.name + ': ' + e.message + 
        '</div>';
    }
  })
  .catch(err => {
    document.getElementById('app').innerHTML = '<div style="color:red;padding:20px;">Fetch failed: ' + err + '</div>';
  });
