# Smoke Stream

Wallpaper Engine Visualizer.

Modified from [Colorful Fluid Animation](https://github.com/Delivator/WebGL-Fluid-Simulation).

## Development Options

### Option 1
From https://steamcommunity.com/sharedfiles/filedetails/?id=974875711:
- Load the wallpaper in Wallpaper Engine
  - Open Wallpaper -> Open offline wallpaper (animated)
  - Open smoke_stream.html
- Open Settings -> General
- For CEF Dev Tools, input an unused port (1337 should work) 
- Go to http://localhost:1337 and click the Smoke Stream link to open a nested browser
- Make edits to `script.js` and hit the refresh button on the nested browser to see and debug the changes


### Option 2
Open `index.html` in the browswer, then click Play.
This allows you load an .mp3 file or use sound from your microphone for testing.
To make changes to `script.js` on the fly:
- F12 to access dev tools
- go to Sources and find `script.js`
- make edits and save (this only saves over the copy in the browser cache, not your local version)
Otherwise, if you're okay with restarting the simulation, you can just refresh the page after making changes to script.js.
