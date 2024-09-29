<h1>
  Description
</h1>

<p>
  A cool little online digital clock.
</p>

<p>
  <a href="https://pyxidata.github.io/digital-clock/" target="_blank" rel="noopener noreferrer">
    Click this link to open this website.
  </a>
</p>

<p>
  It includes a floating island (my first ever 3D model) orbited by a sun, moon, 7 other planets, Pluto, and the ISS.  
  Positions of these celestial bodies are calculated based on the local position of the user (neat!).  
  Clock runs at 40 FPS by default, but if you want it running in the background somewhere, you can reduce it to 10 FPS to somewhat reduce your electricity bill (use the UI).
</p>

<p>
  UI texts are green during day, blue during night, and orange during sunrise/sunset (sun altitude between -18 and -18 degrees, i.e. based on astronomical twilight).  
  House light turns on when sun altitude is below -6 degrees (i.e. based on civil twilight).
  You can also see solar eclipses with this clock (but not lunar eclipses, cuz those are lame).
</p>

#### Web link parameters:
- `lat` and `lon` overrides the local latitude and longitude (in degrees). Use them together; only setting one of them won't have any effect.
- `tz` overrides the local timezone in reference to UTC time (in minutes).

*Example:* `https://pyxidata.github.io/digital-clock/?lat=33.3&lon=-84.5&tz=60` *sets the local position as (-33.3, -84.5) and timezone as UTC+1.*

#### Advanced web link parameters:
- `del` sets frame duration in milliseconds (made as a developer tool; UI will not reflect this value).
- `pov` sets perspective. Options: `1` (1st PoV) or `3` (3rd PoV).
- `rot` sets 3D rotation option. Options: `true` or `false`.
- `det` sets detailed view option. Options: `true` or `false`.
- `tOff` sets the time offset in milliseconds.
- `spd` sets the speed at which time goes (float value).

<h1>
  Completeness: 🟠🟠⚪⚪⚪
</h1>

<dl>
  <dd>🔵🔵🔵🔵🔵: Features are ready and have gone through plenty of testing.</dd>
  <dd>🟢🟢🟢🟢⚪: The features are there, but I haven't tested them thoroughly.</dd>
  <dd>🟡🟡🟡⚪⚪: It's got the basic features. Expect some bugs.</dd>
  <dd>🟠🟠⚪⚪⚪: Lacking most of the features. I wouldn't recommend trying it out.</dd>
  <dd>🔴⚪⚪⚪⚪: I'm not sure if this would even compile.</dd>
</dl>

<h1>
  Requirements
</h1>

Internet (and your locational data >:D )

<h1>
  Development
</h1>

<p>
  <code>HTML</code>, 
  <code>CSS</code>, 
  <code>JavaScript</code>,
  <code>Node.js</code>,
  <code>Three.js</code>,
</p>
