# Digital Clock

A cool little online digital clock.  
Visit the [website](https://kevinm1031.github.io/digital-clock/?del=25).

Includes a floating island (my first ever 3D model) orbited by a sun, moon, 7 other planets, Pluto, and the ISS.  
Positions of these celestial bodies are calculated based on the local position of the user (neat).  
Clock runs at 10 FPS by default to reduce computing resource usage (with an option to increase this to 40).

UI texts are green during day, blue during night, and orange during sunrise/sunset (sun altitude between -18 and -18 degrees, i.e. based on astronomical twilight).  
House light turns on when sun altitude is below -6 degrees (i.e. based on civil twilight).

#### Web link parameters
- `lat` and `lon` overrides the local latitude and longitude (in degrees). Use them together; only setting one of them won't have any effect.
- `tz` overrides the local timezone in reference to UTC time (in minutes).

*Example:* `https://kevinm1031.github.io/digital-clock/?lat=33.3&lon=-84.5&tz=60` *sets the local position as (-33.3, -84.5) and timezone as UTC+1.*

#### Advanced web link parameters
- `del` sets frame duration in milliseconds (made as a developer tool; UI does not reflect this value).
- `pov` sets perspective. Options: `1` (1st PoV) or `3` (3rd PoV).
- `rot` sets 3D rotation option. Options: `true` or `false`.
- `det` sets detailed view option. Options: `true` or `false`.
