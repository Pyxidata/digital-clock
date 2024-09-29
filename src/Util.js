export function getWidth() {
    return document.documentElement.clientWidth;
}

export function getHeight() {
    return document.documentElement.clientHeight;
}

export function isLandscape() {
    return getHeight() / getWidth() < 1;
}

export function getDateStr(date) {
    let str = date.getFullYear() + '/';
    str += (date.getMonth() < 9 ? '0' + (date.getMonth()+1) : date.getMonth()+1) + '/';
    str += (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    switch(date.getDay()) {
        case 0: str += '(SUN)'; break;
        case 1: str += '(MON)'; break;
        case 2: str += '(TUE)'; break;
        case 3: str += '(WED)'; break;
        case 4: str += '(THU)'; break;
        case 5: str += '(FRI)'; break;
        case 6: str += '(SAT)'; break;
        default: str += '(?)';
    }
    return str;
}

export function getTimeStr(date) {
    const hr = date.getHours() > 12 ? date.getHours() - 12 : date.getHours() === 0 ? 12 : date.getHours();
    let str = (hr < 10 ? '0' + hr : hr) + ':';
    str += (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    str += (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()) + ' ';
    str += date.getHours() > 11 ? 'PM' : 'AM';
    return str;
}

export function getTimezoneStr(tOff) {
    let str = tOff < 0 ? "UTC + " : "UTC - ";
    str += (Math.floor(Math.abs(tOff / 60)) < 10 ? '0' + Math.floor(Math.abs(tOff / 60)) : Math.floor(Math.abs(tOff / 60))) + ":";
    str += "" + Math.floor(Math.abs(tOff % 60)) < 10 ? '0' + Math.floor(Math.abs(tOff % 60)) : Math.floor(Math.abs(tOff % 60));
    return str;
}

export function getSunPos(date, lat, lon) {

    lat = lat / 180 * Math.PI;

    // calculating equatorial coordinates
    // from https://en.wikipedia.org/wiki/Position_of_the_Sun
    const n = (date.getTime() - 946728000000) / 86400000;

    const L = 4.89495042 + 0.0172027923937 * n;
    const g = 6.240040768 + 0.0172019703436 * n;

    const gamma = L + 0.033423055 * Math.sin(g) + 0.0003490659 * Math.sin(2*g);
    const epsilon = 0.409087723 - 0.000000006981317 * n;

    const RA = Math.atan2(Math.cos(epsilon) * Math.sin(gamma), Math.cos(gamma));
    const delta = Math.asin(Math.sin(epsilon) * Math.sin(gamma));

    // calculating local sidereal time
    const UTC_hours = date.getUTCHours() + date.getUTCMinutes()/60 + date.getUTCSeconds()/3600;
    const LST = (100.46 + 0.985647332 * n + lon + 15 * UTC_hours) % 360 / 180 * Math.PI;

    // converting equatorial coordinates to horizontal coordinates
    // from http://www.stargazing.net/kepler/altaz.html
    const H = RA - LST;

    const a = Math.asin(Math.sin(delta) * Math.sin(lat) + Math.cos(delta) * Math.cos(lat) * Math.cos(H));
    const A0 = Math.acos((Math.sin(delta) - Math.sin(a) * Math.sin(lat)) / (Math.cos(a) * Math.cos(lat)));
    const A = Math.sin(H) > 0 ? A0 : Math.PI * 2 - A0;

    return {
        altitude: a,
        azimuth: A,
    };
}

export function getMoonPos(date, lat, lon) {

    lat = lat / 180 * Math.PI;

    // calculating equatorial coordinates
    // from https://www.aa.quae.nl/en/reken/hemelpositie.html#4
    const n = (date.getTime() - 946728000000) / 86400000;

    const L = 3.81033301 + 0.229971493746 * n;
    const M = 2.355548718 + 0.228027144599 * n;
    const F = 1.6279035 + 0.2308957154 * n;

    const gamma = L + 0.10976376 * Math.sin(M);
    const beta = 0.089500484 * Math.sin(F);
    const epsilon = 0.4090999407;

    const RA = Math.atan2(Math.cos(epsilon) * Math.sin(gamma), Math.cos(gamma));
    const delta = Math.asin(Math.sin(beta) * Math.cos(epsilon) + Math.cos(beta) * Math.sin(epsilon) * Math.sin(gamma));

    // calculating local sidereal time
    const UTC_hours = date.getUTCHours() + date.getUTCMinutes()/60 + date.getUTCSeconds()/3600;
    const LST = (100.46 + 0.985647332 * n + lon + 15 * UTC_hours) % 360 / 180 * Math.PI;

    // converting equatorial coordinates to horizontal coordinates
    // from http://www.stargazing.net/kepler/altaz.html
    const H = RA - LST;

    const a = Math.asin(Math.sin(delta) * Math.sin(lat) + Math.cos(delta) * Math.cos(lat) * Math.cos(H));
    const A0 = Math.acos((Math.sin(delta) - Math.sin(a) * Math.sin(lat)) / (Math.cos(a) * Math.cos(lat)));
    const A = Math.sin(H) > 0 ? A0 : Math.PI * 2 - A0;

    return {
        altitude: a,
        azimuth: A,
    };
}

function getEarthHEC(n) {
    const M = 6.240058221 + 0.01720210473 * n;
    const e = 0.01671	;
    const Omega = 3.052109623;
    const omega = 5.027665256;
    const i = 0;
    const a_ = 1;

    const v = M + (2*e-1/4*e*e*e)*Math.sin(M) + 5/4*e*e*Math.sin(2*M) + 13/12*e*e*e*Math.sin(3*M);
    const r = (a_*(1-e*e)) / (1+e*Math.cos(v));

    return {
        x: r * (Math.cos(Omega)*Math.cos(omega+v) - Math.sin(Omega)*Math.cos(i)*Math.sin(omega+v)),
        y: r * (Math.sin(Omega)*Math.cos(omega+v) + Math.cos(Omega)*Math.cos(i)*Math.sin(omega+v)),
        z: r * Math.sin(i)*Math.sin(omega+v),
    };
}

function getMercuryPos(n, earth, lat, LST) {

    // calculating equatorial coordinates
    // from https://www.aa.quae.nl/en/reken/hemelpositie.html#4
    const M = 3.050748266 + 0.07142440569 * n;
    const e = 0.20563;
    const Omega = 0.843535081;
    const omega = 0.508327145;
    const i = 0.12226031;
    const a_ = 0.38710;

    const v = M + (2*e-1/4*e*e*e)*Math.sin(M) + 5/4*e*e*Math.sin(2*M) + 13/12*e*e*e*Math.sin(3*M);
    const r = (a_*(1-e*e)) / (1+e*Math.cos(v));

    const HEC = {
        x: r * (Math.cos(Omega)*Math.cos(omega+v) - Math.sin(Omega)*Math.cos(i)*Math.sin(omega+v)),
        y: r * (Math.sin(Omega)*Math.cos(omega+v) + Math.cos(Omega)*Math.cos(i)*Math.sin(omega+v)),
        z: r * Math.sin(i)*Math.sin(omega+v),
    };
    const GEC = {
        x: HEC.x - earth.x,
        y: HEC.y - earth.y,
        z: HEC.z - earth.z,
    };

    const Delta = Math.sqrt(GEC.x*GEC.x + GEC.y*GEC.y + GEC.z*GEC.z);
    const gamma = Math.atan2(GEC.y, GEC.x);
    const beta = Math.asin(GEC.z / Delta);
    const epsilon = 0.4090999407;

    const RA = Math.atan2(Math.sin(gamma)*Math.cos(epsilon) - Math.tan(beta)*Math.sin(epsilon), Math.cos(gamma));
    const delta = Math.asin(Math.sin(beta)*Math.cos(epsilon) + Math.cos(beta)*Math.sin(epsilon)*Math.sin(gamma));

    // converting equatorial coordinates to horizontal coordinates
    // from http://www.stargazing.net/kepler/altaz.html
    const H = RA - LST;

    const a = Math.asin(Math.sin(delta) * Math.sin(lat) + Math.cos(delta) * Math.cos(lat) * Math.cos(H));
    const A0 = Math.acos((Math.sin(delta) - Math.sin(a) * Math.sin(lat)) / (Math.cos(a) * Math.cos(lat)));
    const A = Math.sin(H) > 0 ? A0 : Math.PI * 2 - A0;

    return {
        altitude: a,
        azimuth: A,
    };
}

function getVenusPos(n, earth, lat, LST) {

    // calculating equatorial coordinates
    // from https://www.aa.quae.nl/en/reken/hemelpositie.html#4
    const M = 0.879925196 + 0.02796254827 * n;
    const e = 0.00677;
    const Omega = 1.3383185;
    const omega = 0.957906507;
    const i = 0.059253928;
    const a_ = 0.72333	;

    const v = M + (2*e-1/4*e*e*e)*Math.sin(M) + 5/4*e*e*Math.sin(2*M) + 13/12*e*e*e*Math.sin(3*M);
    const r = (a_*(1-e*e)) / (1+e*Math.cos(v));

    const HEC = {
        x: r * (Math.cos(Omega)*Math.cos(omega+v) - Math.sin(Omega)*Math.cos(i)*Math.sin(omega+v)),
        y: r * (Math.sin(Omega)*Math.cos(omega+v) + Math.cos(Omega)*Math.cos(i)*Math.sin(omega+v)),
        z: r * Math.sin(i)*Math.sin(omega+v),
    };
    const GEC = {
        x: HEC.x - earth.x,
        y: HEC.y - earth.y,
        z: HEC.z - earth.z,
    };

    const Delta = Math.sqrt(GEC.x*GEC.x + GEC.y*GEC.y + GEC.z*GEC.z);
    const gamma = Math.atan2(GEC.y, GEC.x);
    const beta = Math.asin(GEC.z / Delta);
    const epsilon = 0.4090999407;

    const RA = Math.atan2(Math.sin(gamma)*Math.cos(epsilon) - Math.tan(beta)*Math.sin(epsilon), Math.cos(gamma));
    const delta = Math.asin(Math.sin(beta)*Math.cos(epsilon) + Math.cos(beta)*Math.sin(epsilon)*Math.sin(gamma));

    // converting equatorial coordinates to horizontal coordinates
    // from http://www.stargazing.net/kepler/altaz.html
    const H = RA - LST;

    const a = Math.asin(Math.sin(delta) * Math.sin(lat) + Math.cos(delta) * Math.cos(lat) * Math.cos(H));
    const A0 = Math.acos((Math.sin(delta) - Math.sin(a) * Math.sin(lat)) / (Math.cos(a) * Math.cos(lat)));
    const A = Math.sin(H) > 0 ? A0 : Math.PI * 2 - A0;

    return {
        altitude: a,
        azimuth: A,
    };
}

function getMarsPos(n, earth, lat, LST) {

    // calculating equatorial coordinates
    // from https://www.aa.quae.nl/en/reken/hemelpositie.html#4
    const M = 0.338122636 + 0.00914620596 * n;
    const e = 0.09340;
    const Omega = 0.864950271;
    const omega = 5.000403214;
    const i = 0.03228859;
    const a_ = 1.52368;

    const v = M + (2*e-1/4*e*e*e)*Math.sin(M) + 5/4*e*e*Math.sin(2*M) + 13/12*e*e*e*Math.sin(3*M);
    const r = (a_*(1-e*e)) / (1+e*Math.cos(v));

    const HEC = {
        x: r * (Math.cos(Omega)*Math.cos(omega+v) - Math.sin(Omega)*Math.cos(i)*Math.sin(omega+v)),
        y: r * (Math.sin(Omega)*Math.cos(omega+v) + Math.cos(Omega)*Math.cos(i)*Math.sin(omega+v)),
        z: r * Math.sin(i)*Math.sin(omega+v),
    };
    const GEC = {
        x: HEC.x - earth.x,
        y: HEC.y - earth.y,
        z: HEC.z - earth.z,
    };

    const Delta = Math.sqrt(GEC.x*GEC.x + GEC.y*GEC.y + GEC.z*GEC.z);
    const gamma = Math.atan2(GEC.y, GEC.x);
    const beta = Math.asin(GEC.z / Delta);
    const epsilon = 0.4090999407;

    const RA = Math.atan2(Math.sin(gamma)*Math.cos(epsilon) - Math.tan(beta)*Math.sin(epsilon), Math.cos(gamma));
    const delta = Math.asin(Math.sin(beta)*Math.cos(epsilon) + Math.cos(beta)*Math.sin(epsilon)*Math.sin(gamma));

    // converting equatorial coordinates to horizontal coordinates
    // from http://www.stargazing.net/kepler/altaz.html
    const H = RA - LST;

    const a = Math.asin(Math.sin(delta) * Math.sin(lat) + Math.cos(delta) * Math.cos(lat) * Math.cos(H));
    const A0 = Math.acos((Math.sin(delta) - Math.sin(a) * Math.sin(lat)) / (Math.cos(a) * Math.cos(lat)));
    const A = Math.sin(H) > 0 ? A0 : Math.PI * 2 - A0;

    return {
        altitude: a,
        azimuth: A,
    };
}

function getJupiterPos(n, earth, lat, LST) {

    // calculating equatorial coordinates
    // from https://www.aa.quae.nl/en/reken/hemelpositie.html#4
    const M = 0.34941492 + 0.00144960066 * n;
    const e = 0.04849;
    const Omega = 1.75342758;
    const omega = 4.7798808625;
    const i = 0.02274164;
    const a_ = 5.20260;

    const v = M + (2*e-1/4*e*e*e)*Math.sin(M) + 5/4*e*e*Math.sin(2*M) + 13/12*e*e*e*Math.sin(3*M);
    const r = (a_*(1-e*e)) / (1+e*Math.cos(v));

    const HEC = {
        x: r * (Math.cos(Omega)*Math.cos(omega+v) - Math.sin(Omega)*Math.cos(i)*Math.sin(omega+v)),
        y: r * (Math.sin(Omega)*Math.cos(omega+v) + Math.cos(Omega)*Math.cos(i)*Math.sin(omega+v)),
        z: r * Math.sin(i)*Math.sin(omega+v),
    };
    const GEC = {
        x: HEC.x - earth.x,
        y: HEC.y - earth.y,
        z: HEC.z - earth.z,
    };

    const Delta = Math.sqrt(GEC.x*GEC.x + GEC.y*GEC.y + GEC.z*GEC.z);
    const gamma = Math.atan2(GEC.y, GEC.x);
    const beta = Math.asin(GEC.z / Delta);
    const epsilon = 0.4090999407;

    const RA = Math.atan2(Math.sin(gamma)*Math.cos(epsilon) - Math.tan(beta)*Math.sin(epsilon), Math.cos(gamma));
    const delta = Math.asin(Math.sin(beta)*Math.cos(epsilon) + Math.cos(beta)*Math.sin(epsilon)*Math.sin(gamma));

    // converting equatorial coordinates to horizontal coordinates
    // from http://www.stargazing.net/kepler/altaz.html
    const H = RA - LST;

    const a = Math.asin(Math.sin(delta) * Math.sin(lat) + Math.cos(delta) * Math.cos(lat) * Math.cos(H));
    const A0 = Math.acos((Math.sin(delta) - Math.sin(a) * Math.sin(lat)) / (Math.cos(a) * Math.cos(lat)));
    const A = Math.sin(H) > 0 ? A0 : Math.PI * 2 - A0;

    return {
        altitude: a,
        azimuth: A,
    };
}

function getSaturnPos(n, earth, lat, LST) {

    // calculating equatorial coordinates
    // from https://www.aa.quae.nl/en/reken/hemelpositie.html#4
    const M = 5.533060248 + 0.00058243382 * n;
    const e = 0.05551;
    const Omega = 1.983845948;
    const omega = 5.923490402;
    const i = 0.043441245;
    const a_ = 9.55491	;

    const v = M + (2*e-1/4*e*e*e)*Math.sin(M) + 5/4*e*e*Math.sin(2*M) + 13/12*e*e*e*Math.sin(3*M);
    const r = (a_*(1-e*e)) / (1+e*Math.cos(v));

    const HEC = {
        x: r * (Math.cos(Omega)*Math.cos(omega+v) - Math.sin(Omega)*Math.cos(i)*Math.sin(omega+v)),
        y: r * (Math.sin(Omega)*Math.cos(omega+v) + Math.cos(Omega)*Math.cos(i)*Math.sin(omega+v)),
        z: r * Math.sin(i)*Math.sin(omega+v),
    };
    const GEC = {
        x: HEC.x - earth.x,
        y: HEC.y - earth.y,
        z: HEC.z - earth.z,
    };

    const Delta = Math.sqrt(GEC.x*GEC.x + GEC.y*GEC.y + GEC.z*GEC.z);
    const gamma = Math.atan2(GEC.y, GEC.x);
    const beta = Math.asin(GEC.z / Delta);
    const epsilon = 0.4090999407;

    const RA = Math.atan2(Math.sin(gamma)*Math.cos(epsilon) - Math.tan(beta)*Math.sin(epsilon), Math.cos(gamma));
    const delta = Math.asin(Math.sin(beta)*Math.cos(epsilon) + Math.cos(beta)*Math.sin(epsilon)*Math.sin(gamma));

    // converting equatorial coordinates to horizontal coordinates
    // from http://www.stargazing.net/kepler/altaz.html
    const H = RA - LST;

    const a = Math.asin(Math.sin(delta) * Math.sin(lat) + Math.cos(delta) * Math.cos(lat) * Math.cos(H));
    const A0 = Math.acos((Math.sin(delta) - Math.sin(a) * Math.sin(lat)) / (Math.cos(a) * Math.cos(lat)));
    const A = Math.sin(H) > 0 ? A0 : Math.PI * 2 - A0;

    return {
        altitude: a,
        azimuth: A,
    };
}

function getUranusPos(n, earth, lat, LST) {

    // calculating equatorial coordinates
    // from https://www.aa.quae.nl/en/reken/hemelpositie.html#4
    const M = 2.46178691 + 0.0002041686 * n;
    const e = 0.04630;
    const Omega = 1.29164837;
    const omega = 1.72785851;
    const i = 0.013491395;
    const a_ = 	19.21845;

    const v = M + (2*e-1/4*e*e*e)*Math.sin(M) + 5/4*e*e*Math.sin(2*M) + 13/12*e*e*e*Math.sin(3*M);
    const r = (a_*(1-e*e)) / (1+e*Math.cos(v));

    const HEC = {
        x: r * (Math.cos(Omega)*Math.cos(omega+v) - Math.sin(Omega)*Math.cos(i)*Math.sin(omega+v)),
        y: r * (Math.sin(Omega)*Math.cos(omega+v) + Math.cos(Omega)*Math.cos(i)*Math.sin(omega+v)),
        z: r * Math.sin(i)*Math.sin(omega+v),
    };
    const GEC = {
        x: HEC.x - earth.x,
        y: HEC.y - earth.y,
        z: HEC.z - earth.z,
    };

    const Delta = Math.sqrt(GEC.x*GEC.x + GEC.y*GEC.y + GEC.z*GEC.z);
    const gamma = Math.atan2(GEC.y, GEC.x);
    const beta = Math.asin(GEC.z / Delta);
    const epsilon = 0.4090999407;

    const RA = Math.atan2(Math.sin(gamma)*Math.cos(epsilon) - Math.tan(beta)*Math.sin(epsilon), Math.cos(gamma));
    const delta = Math.asin(Math.sin(beta)*Math.cos(epsilon) + Math.cos(beta)*Math.sin(epsilon)*Math.sin(gamma));

    // converting equatorial coordinates to horizontal coordinates
    // from http://www.stargazing.net/kepler/altaz.html
    const H = RA - LST;

    const a = Math.asin(Math.sin(delta) * Math.sin(lat) + Math.cos(delta) * Math.cos(lat) * Math.cos(H));
    const A0 = Math.acos((Math.sin(delta) - Math.sin(a) * Math.sin(lat)) / (Math.cos(a) * Math.cos(lat)));
    const A = Math.sin(H) > 0 ? A0 : Math.PI * 2 - A0;

    return {
        altitude: a,
        azimuth: A,
    };
}

function getNeptunePos(n, earth, lat, LST) {

    // calculating equatorial coordinates
    // from https://www.aa.quae.nl/en/reken/hemelpositie.html#4
    const M = 4.471969876 + 0.00010410889 * n;
    const e = 0.00899;
    const Omega = 2.300064701;
    const omega = 4.82304285;
    const i = 0.03089233;
    const a_ = 30.11039;

    const v = M + (2*e-1/4*e*e*e)*Math.sin(M) + 5/4*e*e*Math.sin(2*M) + 13/12*e*e*e*Math.sin(3*M);
    const r = (a_*(1-e*e)) / (1+e*Math.cos(v));

    const HEC = {
        x: r * (Math.cos(Omega)*Math.cos(omega+v) - Math.sin(Omega)*Math.cos(i)*Math.sin(omega+v)),
        y: r * (Math.sin(Omega)*Math.cos(omega+v) + Math.cos(Omega)*Math.cos(i)*Math.sin(omega+v)),
        z: r * Math.sin(i)*Math.sin(omega+v),
    };
    const GEC = {
        x: HEC.x - earth.x,
        y: HEC.y - earth.y,
        z: HEC.z - earth.z,
    };

    const Delta = Math.sqrt(GEC.x*GEC.x + GEC.y*GEC.y + GEC.z*GEC.z);
    const gamma = Math.atan2(GEC.y, GEC.x);
    const beta = Math.asin(GEC.z / Delta);
    const epsilon = 0.4090999407;

    const RA = Math.atan2(Math.sin(gamma)*Math.cos(epsilon) - Math.tan(beta)*Math.sin(epsilon), Math.cos(gamma));
    const delta = Math.asin(Math.sin(beta)*Math.cos(epsilon) + Math.cos(beta)*Math.sin(epsilon)*Math.sin(gamma));

    // converting equatorial coordinates to horizontal coordinates
    // from http://www.stargazing.net/kepler/altaz.html
    const H = RA - LST;

    const a = Math.asin(Math.sin(delta) * Math.sin(lat) + Math.cos(delta) * Math.cos(lat) * Math.cos(H));
    const A0 = Math.acos((Math.sin(delta) - Math.sin(a) * Math.sin(lat)) / (Math.cos(a) * Math.cos(lat)));
    const A = Math.sin(H) > 0 ? A0 : Math.PI * 2 - A0;

    return {
        altitude: a,
        azimuth: A,
    };
}

function getPlutoPos(n, earth, lat, LST) {

    // calculating equatorial coordinates
    // from https://www.aa.quae.nl/en/reken/hemelpositie.html#4
    const M = 0.259739899 + 0.0000691849 * n;
    const e = 0.2490;
    const Omega = 1.925220338;
    const omega = 1.9856261834;
    const i = 0.29914943;
    const a_ = 39.543;

    const v = M + (2*e-1/4*e*e*e)*Math.sin(M) + 5/4*e*e*Math.sin(2*M) + 13/12*e*e*e*Math.sin(3*M);
    const r = (a_*(1-e*e)) / (1+e*Math.cos(v));

    const HEC = {
        x: r * (Math.cos(Omega)*Math.cos(omega+v) - Math.sin(Omega)*Math.cos(i)*Math.sin(omega+v)),
        y: r * (Math.sin(Omega)*Math.cos(omega+v) + Math.cos(Omega)*Math.cos(i)*Math.sin(omega+v)),
        z: r * Math.sin(i)*Math.sin(omega+v),
    };
    const GEC = {
        x: HEC.x - earth.x,
        y: HEC.y - earth.y,
        z: HEC.z - earth.z,
    };

    const Delta = Math.sqrt(GEC.x*GEC.x + GEC.y*GEC.y + GEC.z*GEC.z);
    const gamma = Math.atan2(GEC.y, GEC.x);
    const beta = Math.asin(GEC.z / Delta);
    const epsilon = 0.4090999407;

    const RA = Math.atan2(Math.sin(gamma)*Math.cos(epsilon) - Math.tan(beta)*Math.sin(epsilon), Math.cos(gamma));
    const delta = Math.asin(Math.sin(beta)*Math.cos(epsilon) + Math.cos(beta)*Math.sin(epsilon)*Math.sin(gamma));

    // converting equatorial coordinates to horizontal coordinates
    // from http://www.stargazing.net/kepler/altaz.html
    const H = RA - LST;

    const a = Math.asin(Math.sin(delta) * Math.sin(lat) + Math.cos(delta) * Math.cos(lat) * Math.cos(H));
    const A0 = Math.acos((Math.sin(delta) - Math.sin(a) * Math.sin(lat)) / (Math.cos(a) * Math.cos(lat)));
    const A = Math.sin(H) > 0 ? A0 : Math.PI * 2 - A0;

    return {
        altitude: a,
        azimuth: A,
    };
}

export function getPlanetsPos(date, lat, lon) {
    lat = lat / 180 * Math.PI;
    const n = (date.getTime() - 946728000000) / 86400000;

    const UTC_hours = date.getUTCHours() + date.getUTCMinutes()/60 + date.getUTCSeconds()/3600;
    const LST = (100.46 + 0.985647332 * n + lon + 15 * UTC_hours) % 360 / 180 * Math.PI;
    
    const earthHEC = getEarthHEC(n);
    
    const mercury = getMercuryPos(n, earthHEC, lat, LST); 
    const venus = getVenusPos(n, earthHEC, lat, LST); 
    const mars = getMarsPos(n, earthHEC, lat, LST); 
    const jupiter = getJupiterPos(n, earthHEC, lat, LST); 
    const saturn = getSaturnPos(n, earthHEC, lat, LST); 
    const uranus = getUranusPos(n, earthHEC, lat, LST); 
    const neptune = getNeptunePos(n, earthHEC, lat, LST); 
    const pluto = getPlutoPos(n, earthHEC, lat, LST); 

    return {
        mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto
    };
}

export async function getISSPos(lat, lon) {
    lat = lat / 180 * Math.PI;
    lon = lon / 180 * Math.PI;
    const r = 6371;

    // Getting ISS position data and calculating altitude and azimuth
    // from https://ieiuniumlux.github.io/ISSOT/
    const url = 'https://api.wheretheiss.at/v1/satellites/25544';
    const res = await fetch(url);
    const data = await res.json();

    const iLat = data.latitude / 180 * Math.PI;
    const iLon = data.longitude / 180 * Math.PI;
    const iR = r + data.altitude;

    const gamma = Math.acos(Math.sin(lat) * Math.sin(iLat) + Math.cos(lat) * Math.cos(iLat) * Math.cos(lon - iLon));
    const d = Math.sqrt((1 + Math.pow((r / iR), 2)) - (2 * (r / iR) * Math.cos(gamma)));

    return {
        altitude: Math.acos(Math.sin(gamma) / d) * ((d > 0.34) ? -1 : 1),
        azimuth: Math.atan2(
            Math.sin(iLon - lon) * Math.cos(iLat), 
            Math.cos(lat) * Math.sin(iLat) - Math.sin(lat) * Math.cos(iLat) * Math.cos(iLon - lon)),
    };
}

export async function getHSTPos(lat, lon) {
    // Getting Hubble position data
    // from https://www.n2yo.com/api/
    const url = 'https://api.n2yo.com/rest/v1/satellite/positions/20580/'+lat+'/'+lon+'/0/1&apiKey=BKLA8X-79NYZ6-RKRUYT-4VR8';
    const res = await fetch(url);
    const data = await res.json();

    return {
        altitude: data.positions.elevation / 180 * Math.PI,
        azimuth: data.positions.azimuth / 180 * Math.PI,
    };
}

export async function getCXOPos(lat, lon) {
    // Getting Chandra position data
    // from https://www.n2yo.com/api/
    const url = 'https://api.n2yo.com/rest/v1/satellite/positions/25867/'+lat+'/'+lon+'/0/1&apiKey=BKLA8X-79NYZ6-RKRUYT-4VR8';
    const res = await fetch(url);
    const data = await res.json();

    return {
        altitude: data.positions.elevation / 180 * Math.PI,
        azimuth: data.positions.azimuth / 180 * Math.PI,
    };
}

export async function getVanguard1Pos(lat, lon) {
    // Getting Vanguard 1 position data
    // from https://www.n2yo.com/api/
    const url = 'https://api.n2yo.com/rest/v1/satellite/positions/5/'+lat+'/'+lon+'/0/1&apiKey=BKLA8X-79NYZ6-RKRUYT-4VR8';
    const res = await fetch(url);
    const data = await res.json();

    return {
        altitude: data.positions.elevation / 180 * Math.PI,
        azimuth: data.positions.azimuth / 180 * Math.PI,
    };
}