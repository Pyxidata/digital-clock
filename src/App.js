import Clock from "./Clock.js";

const App = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const lat = queryParams.get('lat');
    const lon = queryParams.get('lon');
    const tz = queryParams.get('tz');
    
    const x = queryParams.get('x');
    const y = queryParams.get('y');
    const z = queryParams.get('z');
    const del = queryParams.get('del');
    const pov = queryParams.get('pov');
    const rot = queryParams.get('rot');
    const det = queryParams.get('det');

    const tOff = queryParams.get('tOff');
    const spd = queryParams.get('spd');

    return (
        <Clock 
            lat={lat} lon={lon} tz={tz}
            x={x} y={y} z={z} del={del} pov={pov} rot={rot} det={det}
            tOff={tOff} spd={spd}/>
    )
}

export default App;
