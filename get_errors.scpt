tell application "Google Chrome"
    activate
    open location "http://localhost:8081/test.html"
    delay 2
    set jsCode to "JSON.stringify(window.my_errors || []);"
    set theErrors to execute front window's active tab javascript jsCode
    return theErrors
end tell
