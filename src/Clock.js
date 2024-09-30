import { Component, createRef } from 'react';
import * as THREE from 'three';
import * as POSTPROCESSING from 'postprocessing';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
    getWidth, getHeight, isLandscape, getSunPos, getMoonPos, 
    getDateStr, getTimeStr, getTimezoneStr, getPlanetsPos,
    getISSPos/*, getHSTPos, getCXOPos, getVanguard1Pos*/
} from './Util.js';

import landModel from './land.glb';
import cloudsModel from './clouds.glb';

class Clock extends Component {
    constructor(props) {
        super(props);

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
        this.myRef = createRef();

        this.posFixed = props.lat && props.lon;
        this.lat = 33.7695; // Atlanta position as default
        this.lon = -84.3857;
        if (this.posFixed) {
            this.lat = Math.max(-89.999999, Math.min(89.999999, 1 * props.lat));
            this.lon = 1 * props.lon;
        } else {
            navigator.geolocation.getCurrentPosition((pos) => {
                this.lat = Math.max(-89.999999, Math.min(89.999999, pos.coords.latitude));
                this.lon = pos.coords.longitude;
            });
        }

        if (props.tz) this.tz = props.tz === 0 ? 0 : -1 * props.tz;

        this.initPosX = props.x ? parseFloat(props.x) : -9;
        this.initPosY = props.y ? parseFloat(props.y) : 4;
        this.initPosZ = props.z ? parseFloat(props.z) : -4;
        this.pov = props.pov ? parseInt(props.pov) : 3;
        this.details = props.det ? props.det === "true" : false;
        this.delay = props.del ? parseInt(props.del) : 25;
        this.rotate = props.rot ? props.rot === "true" : false;
        this.timeOffset = props.tOff ? parseInt(props.tOff) : 0;
        this.speed = props.spd ? parseFloat(props.spd) : 1;

        this.nextFrame = 0;

        window.addEventListener('resize', () => {this.resize()});

        let date = new Date();
        this.refreshDate = date.getTime() + 86400000;
    }

    componentDidMount() {

        this.canvas = document.createElement('canvas');
        this.mount.appendChild(this.canvas);

        const width = getWidth();
        const height = getHeight();

        this.camera = new THREE.PerspectiveCamera( 60, width / height, 0.01, 100 );
        this.camera.position.set(this.initPosX, this.initPosY, this.initPosZ);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#000000');
        this.scene.add(this.camera);
        
        this.ctx = this.canvas.getContext('webgl');

        this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			context: this.ctx,
			antialias: true,
            alpha: true
		})
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.listenToKeyEvents(this.canvas);
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;
        this.controls.autoRotate = this.rotate;

        this.initAmbientLight();
        this.initSun();
        this.initMoon();
        this.initPlanets();
        this.initSatellites();
        this.initLand();
        this.initClouds();
        this.initLampLight();
        this.initGodRays();

        this.start();
    }

    initAmbientLight() {
		const light = new THREE.AmbientLight( '#222222' );
		this.scene.add( light );

        const ambientLight = new THREE.DirectionalLight('#335599', 0.3);
        ambientLight.castShadow = false;
        ambientLight.position.set(0, 100, 0);
        this.scene.add(ambientLight);
        this.ambientLight = ambientLight;
    }

    initSun() {
        const group = new THREE.Group();
        const sun_geo = new THREE.SphereGeometry(0.15, 10, 10);
        const sun_mat = new THREE.MeshBasicMaterial({ color: '#ffbb77' });
        const sun = new THREE.Mesh(sun_geo, sun_mat);

        const sun_light = new THREE.DirectionalLight('#775533', 5);
        sun_light.castShadow = true;
        sun_light.shadow.bias = -0.0002;
        sun_light.shadow.mapSize.width = 1400;
        sun_light.shadow.mapSize.height = 1400;
        sun.add(sun_light);

        group.add(sun);
        this.scene.add(group);
        this.sun = group;
    }

    initMoon() {
        const group = new THREE.Group();
        const moon_geo = new THREE.SphereGeometry(0.16, 40, 40);
        const moon_mat = new THREE.MeshBasicMaterial({ color: '#aaaacc' });
        const moon = new THREE.Mesh(moon_geo, moon_mat);

        const moon_light = new THREE.DirectionalLight( '#444499', 0 );
        moon_light.castShadow = true;
        moon_light.shadow.bias = -0.0002;
        moon_light.shadow.mapSize.width = 1400;
        moon_light.shadow.mapSize.height = 1400;
        moon.add(moon_light);

        const moon_cover_geo = new THREE.SphereGeometry(0.165, 40, 20, Math.PI, Math.PI);
        const moon_cover_mat = new THREE.MeshBasicMaterial({ color: '#000000' });
        const moon_cover = new THREE.Mesh(moon_cover_geo, moon_cover_mat);
        moon.add(moon_cover);

        group.add(moon);
        this.scene.add(group);
        this.moon = group;
    }

    initPlanets() {
        const group = new THREE.Group();

        const mercury_geo = new THREE.SphereGeometry(0.008, 10, 10);
        const mercury_mat = new THREE.MeshBasicMaterial({ color: '#f8ffa8' });
        const mercury = new THREE.Mesh(mercury_geo, mercury_mat);
        group.add(mercury);
        this.mercury = mercury;

        const venus_geo = new THREE.SphereGeometry(0.024, 10, 10);
        const venus_mat = new THREE.MeshBasicMaterial({ color: '#f5f781' });
        const venus = new THREE.Mesh(venus_geo, venus_mat);
        group.add(venus);
        this.venus = venus;

        const mars_geo = new THREE.SphereGeometry(0.016, 10, 10);
        const mars_mat = new THREE.MeshBasicMaterial({ color: '#e36124' });
        const mars = new THREE.Mesh(mars_geo, mars_mat);
        group.add(mars);
        this.mars = mars;

        const jupiter_geo = new THREE.SphereGeometry(0.020, 10, 10);
        const jupiter_mat = new THREE.MeshBasicMaterial({ color: '#b0aa8f' });
        const jupiter = new THREE.Mesh(jupiter_geo, jupiter_mat);
        group.add(jupiter);
        this.jupiter = jupiter;

        const saturn_geo = new THREE.SphereGeometry(0.014, 10, 10);
        const saturn_mat = new THREE.MeshBasicMaterial({ color: '#c7a477' });
        const saturn = new THREE.Mesh(saturn_geo, saturn_mat);
        group.add(saturn);
        this.saturn = saturn;

        const uranus_geo = new THREE.SphereGeometry(0.01, 10, 10);
        const uranus_mat = new THREE.MeshBasicMaterial({ color: '#72e8f7' });
        const uranus = new THREE.Mesh(uranus_geo, uranus_mat);
        group.add(uranus);
        this.uranus = uranus;

        const neptune_geo = new THREE.SphereGeometry(0.007, 10, 10);
        const neptune_mat = new THREE.MeshBasicMaterial({ color: '#5e78f7' });
        const neptune = new THREE.Mesh(neptune_geo, neptune_mat);
        group.add(neptune);
        this.neptune = neptune;

        const pluto_geo = new THREE.SphereGeometry(0.005, 10, 10);
        const pluto_mat = new THREE.MeshBasicMaterial({ color: '#696361' });
        const pluto = new THREE.Mesh(pluto_geo, pluto_mat);
        group.add(pluto);
        this.pluto = pluto;

        group.castShadow = false;
        group.receiveShadow = false;
        this.scene.add(group);
    }

    initSatellites() {
        const date = new Date();
        this.nextISSTrack = date.getTime() + 100 + this.timeOffset;
        //this.nextHSTTrack = date.getTime() + 100 + this.timeOffset;
        //this.nextCXOTrack = date.getTime() + 100 + this.timeOffset;
        //this.nextVanguard1Track = date.getTime() + 100 + this.timeOffset;
        this.issPos = {altitude: 0, azimuth: 0};
        //this.hstPos = {altitude: 0, azimuth: 0};
        //this.cxoPos = {altitude: 0, azimuth: 0};
        //this.vanguard1Pos = {altitude: 0, azimuth: 0};

        const group = new THREE.Group();

        const iss_geo = new THREE.SphereGeometry(0.018, 10, 10);
        const iss_mat = new THREE.MeshBasicMaterial({ color: '#ff0000' });
        const iss = new THREE.Mesh(iss_geo, iss_mat);
        group.add(iss);
        this.iss = iss;
        const iss_cover_geo = new THREE.SphereGeometry(0.02, 10, 5, Math.PI, Math.PI);
        const iss_cover_mat = new THREE.MeshBasicMaterial({ color: '#000000' });
        const iss_cover = new THREE.Mesh(iss_cover_geo, iss_cover_mat);
        iss.add(iss_cover);

        /*
        const hst_geo = new THREE.SphereGeometry(0.012, 10, 10);
        const hst_mat = new THREE.MeshLambertMaterial({ color: '#212636', emhstive: '#ff0000' });
        const hst = new THREE.Mesh(hst_geo, hst_mat);
        group.add(hst);
        this.hst = hst;
        const hst_cover_geo = new THREE.SphereGeometry(0.014, 10, 5, Math.PI, Math.PI);
        const hst_cover_mat = new THREE.MeshBasicMaterial({ color: '#000000' });
        const hst_cover = new THREE.Mesh(hst_cover_geo, hst_cover_mat);
        hst.add(hst_cover);

        const cxo_geo = new THREE.SphereGeometry(0.01, 10, 10);
        const cxo_mat = new THREE.MeshLambertMaterial({ color: '#212636', emcxoive: '#ff0000' });
        const cxo = new THREE.Mesh(cxo_geo, cxo_mat);
        group.add(cxo);
        this.cxo = cxo;
        const cxo_cover_geo = new THREE.SphereGeometry(0.012, 10, 5, Math.PI, Math.PI);
        const cxo_cover_mat = new THREE.MeshBasicMaterial({ color: '#000000' });
        const cxo_cover = new THREE.Mesh(cxo_cover_geo, cxo_cover_mat);
        cxo.add(cxo_cover);

        const vanguard1_geo = new THREE.SphereGeometry(0.008, 10, 10);
        const vanguard1_mat = new THREE.MeshLambertMaterial({ color: '#212636', emvanguard1ive: '#ff0000' });
        const vanguard1 = new THREE.Mesh(vanguard1_geo, vanguard1_mat);
        group.add(vanguard1);
        this.vanguard1 = vanguard1;
        const vanguard1_cover_geo = new THREE.SphereGeometry(0.01, 10, 5, Math.PI, Math.PI);
        const vanguard1_cover_mat = new THREE.MeshBasicMaterial({ color: '#000000' });
        const vanguard1_cover = new THREE.Mesh(vanguard1_cover_geo, vanguard1_cover_mat);
        vanguard1.add(vanguard1_cover);
        */

        group.castShadow = false;
        group.receiveShadow = false;
        this.scene.add(group);
    }

    initLand() {
        const group = new THREE.Group();
        const loader = new GLTFLoader();

        loader.load(landModel, (gltf) => {
            gltf.scene.traverse(function(node) { 
                if (node instanceof THREE.Mesh) { 
                    node.position.set(0, -1, 0);
                    node.castShadow = true;
                    node.receiveShadow = true;
                } 
            });
            group.add( gltf.scene );
            this.scene.add(group);
        }, undefined, function (error) {
            console.error(error);
        });
    }

    initClouds() {
        const group = new THREE.Group();
        const loader = new GLTFLoader();

        loader.load(cloudsModel, (gltf) => {
            gltf.scene.traverse(function(node) { 
                if (node instanceof THREE.Mesh) { 
                    node.position.set(-3.5, 8, -2.5);
                    node.castShadow = true;
                    node.receiveShadow = true;
                } 
            });
            group.scale.set(0.3, 0.3, 0.3);
            group.add( gltf.scene );
            this.scene.add(group);
            this.clouds = group;
        }, undefined, function (error) {
            console.error(error);
        });
    }

    initLampLight() {
        const date = new Date();
        this.nextLampFlicker = date.getTime() + 100;

        const group = new THREE.Group();
        const lamp_geo = new THREE.SphereGeometry(0.02, 1, 1);
        const lamp_mat = new THREE.MeshLambertMaterial({ color: '#000000' });
        const lamp = new THREE.Mesh(lamp_geo, lamp_mat);

        const lamp_light = new THREE.PointLight('#ff5500', 5, 0.8, 1);
        lamp.add(lamp_light);

        lamp.position.set(-0.63, 0.15, 0.35);
        group.add(lamp);
        this.scene.add(group);
        this.lampLight = lamp_light;
    }

    initGodRays() {
        let godraysEffect_sun = new POSTPROCESSING.GodRaysEffect(this.camera, this.sun.children[0], {
            resolutionScale: 0.7,
            density: 0.5,
            decay: 0.9,
            weight: 0.9,
            samples: 10
        });
        let godraysEffect_mercury = new POSTPROCESSING.GodRaysEffect(this.camera, this.mercury, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_venus = new POSTPROCESSING.GodRaysEffect(this.camera, this.venus, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_mars = new POSTPROCESSING.GodRaysEffect(this.camera, this.mars, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_jupiter = new POSTPROCESSING.GodRaysEffect(this.camera, this.jupiter, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_saturn = new POSTPROCESSING.GodRaysEffect(this.camera, this.saturn, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_uranus = new POSTPROCESSING.GodRaysEffect(this.camera, this.uranus, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_neptune = new POSTPROCESSING.GodRaysEffect(this.camera, this.neptune, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_pluto = new POSTPROCESSING.GodRaysEffect(this.camera, this.pluto, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_iss = new POSTPROCESSING.GodRaysEffect(this.camera, this.iss, {
            resolutionScale: 0.5, density: 0.5, decay: 0.7, weight: 0.9, samples: 10 });
        let smaaEffect = new POSTPROCESSING.SMAAEffect({});
        let renderPass = new POSTPROCESSING.RenderPass(this.scene, this.camera);
        let effectPass = new POSTPROCESSING.EffectPass(this.camera, 
            godraysEffect_sun, godraysEffect_mercury, godraysEffect_venus, godraysEffect_mars, 
            godraysEffect_jupiter, godraysEffect_saturn, godraysEffect_uranus, godraysEffect_neptune, 
            godraysEffect_pluto, godraysEffect_iss);
        let smaaPass = new POSTPROCESSING.EffectPass(this.camera, smaaEffect);
        this.composer = new POSTPROCESSING.EffectComposer(this.renderer);
        this.composer.addPass(renderPass);
        this.composer.addPass(effectPass);
        this.composer.addPass(smaaPass);
    }

    componentWillUnmount() {
        this.stop();
        window.removeEventListener('resize', () => {this.resize()});
        this.mount.removeChild(this.renderer.domElement);
    }

    start() {
        this.updatePerspective(false);
        
        if (!this.frameId)
            this.frameId = requestAnimationFrame(this.animate);
    }

    stop() {
        window.cancelAnimationFrame(this.frameId);
    }

    animate() {
        let date = new Date();

        if (date.getTime() >= this.refreshDate) {
            let link = '/digital-clock?';

            link += "x=" + this.camera.position.x;
            link += "&y=" + this.camera.position.y;
            link += "&z=" + this.camera.position.z;
            
            link += "&del=" + this.delay;
            link += "&rot=" + this.controls.autoRotate;
            link += "&det=" + this.details;
            link += "&pov=" + this.pov;

            link += "&tOff=" + this.timeOffset;
            link += "&spd=" + this.speed;

            if (this.posFixed) link += "&lat=" + this.lat + "&lon=" + this.lon;
            if (this.tz) link += "&tz=" + this.tz;

            this.refreshDate = date.getTime() + 99999999;
            window.location.href = link;
        }

        if (date.getTime() < this.nextFrame) {
            requestAnimationFrame(this.animate);
            return;
        } else this.nextFrame = date.getTime() + this.delay;

        this.controls.update();

        // Get date
        this.timeOffset += (this.speed-1) * this.delay
        if (this.tz || this.tz === 0) {
            var tOff = this.tz - date.getTimezoneOffset();
            date.setTime(date.getTime() - tOff * 60000 + this.timeOffset);
        } else {
            date.setTime(date.getTime() + this.timeOffset);
        }

        //if (!this.offset) this.offset = 0;
        //date.setTime(date.getTime() + this.offset);
        //this.offset += 1000000;

        // Get screen dimensions
        const width = getWidth();
        const height = getHeight();

        // Clouds movement
        if (this.clouds)
            this.clouds.rotation.set(0, date.getTime() % 900000 / 450000 * Math.PI, 0);

        // Sun position calculation
        const sunDist = 6;
        const sunPos = getSunPos(date, this.lat, this.lon);
        const sx = Math.sin(sunPos.azimuth) * Math.cos(sunPos.altitude) * sunDist;
        const sy = Math.sin(sunPos.altitude) * sunDist;
        const sz = -Math.cos(sunPos.azimuth) * Math.cos(sunPos.altitude) * sunDist;
        this.sun.position.set(sx, sy, sz);

        // Sun light color & intensity calculation
        const sunRedness = Math.pow(Math.abs(Math.cos(sunPos.altitude)), 30) * 0.2 + 0.4;
        const sunMesh = this.sun.children[0];
        const sunMat = sunMesh.material;
        sunMat.color.setRGB(sunRedness + 0.3, 0.7 - sunRedness/2, 0.5 - sunRedness/2);

        const sunLight = sunMesh.children[0];
        const sunMaxInt = 5;
        sunLight.color.setRGB(sunRedness, 0.5 - sunRedness/2, 0.33 - sunRedness/2);
        sunLight.intensity = Math.max(Math.min(Math.sin(sunPos.altitude + 0.08)*20, sunMaxInt), 0);

        // Moon position calculation
        const moonDist = 5.6;
        const moonPos = getMoonPos(date, this.lat, this.lon);
        const mx = Math.sin(moonPos.azimuth) * Math.cos(moonPos.altitude) * moonDist;
        const my = Math.sin(moonPos.altitude) * moonDist;
        const mz = -Math.cos(moonPos.azimuth) * Math.cos(moonPos.altitude) * moonDist;
        this.moon.position.set(mx, my, mz);

        // Moon light intensity calculation (based on phase)
        const msV = new THREE.Vector3((sx*1000)-mx, (sy*1000)-my, (sz*1000)-mz);
        const mlV = new THREE.Vector3(mx, my, mz);
        const moonIllum = Math.max(-msV.normalize().dot(mlV.normalize()) + 1, 0) + 0.2;

        const moonMesh = this.moon.children[0];
        const moonLight = moonMesh.children[0];
        moonLight.intensity = Math.max(Math.sin(-sunPos.altitude), 0) * (Math.max(Math.sin(moonPos.altitude), 0) + 0.8) * moonIllum;

        // Moon light color calculation (based on sun altitude)
        const moonMat = moonMesh.material;
        const adjustedSunInt = sunLight.intensity / sunMaxInt;
        moonMat.color.setRGB(0.4 + adjustedSunInt * 0.5, 0.5 + adjustedSunInt * 0.4, 0.8 + adjustedSunInt * 0.1);

        // Moon phase orientation
        const moonCover = moonMesh.children[1];
        moonCover.lookAt((sx*1000), (sy*1000), (sz*1000));

        // Planets position calculation
        const planetsDist = 6;
        const planetsPos = getPlanetsPos(date, this.lat, this.lon);
        this.mercury.position.set(
            Math.sin(planetsPos.mercury.azimuth) * Math.cos(planetsPos.mercury.altitude) * planetsDist,
            Math.sin(planetsPos.mercury.altitude) * planetsDist,
            -Math.cos(planetsPos.mercury.azimuth) * Math.cos(planetsPos.mercury.altitude) * planetsDist);
        this.venus.position.set(
            Math.sin(planetsPos.venus.azimuth) * Math.cos(planetsPos.venus.altitude) * planetsDist,
            Math.sin(planetsPos.venus.altitude) * planetsDist,
            -Math.cos(planetsPos.venus.azimuth) * Math.cos(planetsPos.venus.altitude) * planetsDist);
        this.mars.position.set(
            Math.sin(planetsPos.mars.azimuth) * Math.cos(planetsPos.mars.altitude) * planetsDist,
            Math.sin(planetsPos.mars.altitude) * planetsDist,
            -Math.cos(planetsPos.mars.azimuth) * Math.cos(planetsPos.mars.altitude) * planetsDist);
        this.jupiter.position.set(
            Math.sin(planetsPos.jupiter.azimuth) * Math.cos(planetsPos.jupiter.altitude) * planetsDist,
            Math.sin(planetsPos.jupiter.altitude) * planetsDist,
            -Math.cos(planetsPos.jupiter.azimuth) * Math.cos(planetsPos.jupiter.altitude) * planetsDist);
        this.saturn.position.set(
            Math.sin(planetsPos.saturn.azimuth) * Math.cos(planetsPos.saturn.altitude) * planetsDist,
            Math.sin(planetsPos.saturn.altitude) * planetsDist,
            -Math.cos(planetsPos.saturn.azimuth) * Math.cos(planetsPos.saturn.altitude) * planetsDist);
        this.uranus.position.set(
            Math.sin(planetsPos.uranus.azimuth) * Math.cos(planetsPos.uranus.altitude) * planetsDist,
            Math.sin(planetsPos.uranus.altitude) * planetsDist,
            -Math.cos(planetsPos.uranus.azimuth) * Math.cos(planetsPos.uranus.altitude) * planetsDist);
        this.neptune.position.set(
            Math.sin(planetsPos.neptune.azimuth) * Math.cos(planetsPos.neptune.altitude) * planetsDist,
            Math.sin(planetsPos.neptune.altitude) * planetsDist,
            -Math.cos(planetsPos.neptune.azimuth) * Math.cos(planetsPos.neptune.altitude) * planetsDist);
        this.pluto.position.set(
            Math.sin(planetsPos.pluto.azimuth) * Math.cos(planetsPos.pluto.altitude) * planetsDist,
            Math.sin(planetsPos.pluto.altitude) * planetsDist,
            -Math.cos(planetsPos.pluto.azimuth) * Math.cos(planetsPos.pluto.altitude) * planetsDist);

        // ISS position calculation
        const satellitesDist = 5.4
        const issUpdateFreq = 2000;
        if (this.nextISSTrack <= date.getTime()) {
            this.nextISSTrack = date.getTime() + issUpdateFreq;
            getISSPos(this.lat, this.lon).then((pos) => {
                this.issPos = pos;
                this.iss.material.color.set('#ff0000');
                this.iss.position.set(
                    Math.sin(pos.azimuth) * Math.cos(pos.altitude) * satellitesDist,
                    Math.sin(pos.altitude) * satellitesDist,
                    -Math.cos(pos.azimuth) * Math.cos(pos.altitude) * satellitesDist);
                this.iss.children[0].lookAt((sx*1000), (sy*1000), (sz*1000));
            });
        } else if(this.nextISSTrack - issUpdateFreq/2 <= date.getTime()) {
            this.iss.material.color.set('#ffffff');
        }

        /*
        // HST position calculation
        const hstUpdateFreq = 10000;
        if (this.nextHSTTrack <= date.getTime()) {
            this.nextHSTTrack = date.getTime() + hstUpdateFreq;
            getHSTPos(this.lat, this.lon).then((pos) => {
                this.hstPos = pos;
                this.hst.material.color.set('#ffff00');
                this.hst.position.set(
                    Math.sin(pos.azimuth) * Math.cos(pos.altitude) * satellitesDist,
                    Math.sin(pos.altitude) * satellitesDist,
                    -Math.cos(pos.azimuth) * Math.cos(pos.altitude) * satellitesDist);
                this.hst.children[0].lookAt((sx*1000), (sy*1000), (sz*1000));
            });
        } else if(this.nextHSTTrack - hstUpdateFreq/2 <= date.getTime()) {
            this.hst.material.color.set('#ffffff');
        }

        // CXO position calculation
        const cxoUpdateFreq = 12000;
        if (this.nextCXOTrack <= date.getTime()) {
            this.nextCXOTrack = date.getTime() + cxoUpdateFreq;
            getCXOPos(this.lat, this.lon).then((pos) => {
                this.cxoPos = pos;
                this.cxo.material.color.set('#ffff00');
                this.cxo.position.set(
                    Math.sin(pos.azimuth) * Math.cos(pos.altitude) * satellitesDist,
                    Math.sin(pos.altitude) * satellitesDist,
                    -Math.cos(pos.azimuth) * Math.cos(pos.altitude) * satellitesDist);
                this.cxo.children[0].lookAt((sx*1000), (sy*1000), (sz*1000));
            });
        } else if(this.nextCXOTrack - cxoUpdateFreq/2 <= date.getTime()) {
            this.vanguard1.material.color.set('#ffffff');
        }

        // Vanguard 1 position calculation
        const vanguard1UpdateFreq = 14000;
        if (this.nextVanguard1Track <= date.getTime()) {
            this.nextVanguard1Track = date.getTime() + vanguard1UpdateFreq;
            getVanguard1Pos(this.lat, this.lon).then((pos) => {
                this.vanguard1Pos = pos;
                this.vanguard1.material.color.set('#00ff00');
                this.vanguard1.position.set(
                    Math.sin(pos.azimuth) * Math.cos(pos.altitude) * satellitesDist,
                    Math.sin(pos.altitude) * satellitesDist,
                    -Math.cos(pos.azimuth) * Math.cos(pos.altitude) * satellitesDist);
                this.vanguard1.children[0].lookAt((sx*1000), (sy*1000), (sz*1000));
            });
        } else if(this.nextVanguard1Track - vanguard1UpdateFreq/2 <= date.getTime()) {
            this.vanguard1.material.color.set('#ffffff');
        }
        */

        // Lamp light calculation (based on civil twilight)
        const lampFlickerFreq = 100;
        if (sunPos.altitude > -0.10472) this.lampLight.color.setRGB(0, 0, 0);
        else if (date.getTime() >= this.nextLampFlicker) {
            this.nextLampFlicker = date.getTime() + lampFlickerFreq;
            this.lampLight.color.setRGB(Math.random()*0.2 + 0.8, 0.4, 0);
        }

        // Ambient light calculation
        const ambientIllum = Math.max(Math.sin(sunPos.altitude), 0) * 0.4 - 0.2;
        this.ambientLight.intensity = ambientIllum + 0.5;
        this.ambientLight.color.setRGB(0.5 + ambientIllum, 0.5, 0.5 - ambientIllum);

        // Time text update
        const landscape = isLandscape();
        const textColor = sunPos.altitude < -0.314159 ? 'cornflowerblue' 
            : sunPos.altitude > 0.314159 ? '#5de356' : 'coral'; // based on astronomical twilight

        const timeText = this.mount.parentElement.children[1];
        timeText.style.left = width/2 - timeText.clientWidth/2 + 'px';
        timeText.style.top = height * 0.08 + 'px';
        timeText.style.color = textColor;
        timeText.style.fontSize = landscape ? '70px' : '35px';
        timeText.replaceChildren(getTimeStr(date));

        // Date text update
        const dateText = this.mount.parentElement.children[2];
        dateText.style.left = width/2 - dateText.clientWidth/2 + 'px';
        dateText.style.top = height * 0.2 + 'px';
        dateText.style.color = textColor;
        dateText.style.fontSize = landscape ? '40px' : '20px';
        dateText.replaceChildren(getDateStr(date));

        // Timezone text update
        const timezoneText = this.mount.parentElement.children[3];
        timezoneText.style.left = width/2 - timezoneText.clientWidth/2 + 'px';
        timezoneText.style.top = height * 0.78 + 'px';
        timezoneText.style.color = textColor;
        timezoneText.style.fontSize = landscape ? '40px' : '20px';
        timezoneText.replaceChildren(getTimezoneStr(this.tz ? this.tz : date.getTimezoneOffset()));

        // Coordinate text update
        const coordText = this.mount.parentElement.children[4];
        coordText.style.left = width/2 - coordText.clientWidth/2 + 'px';
        coordText.style.top = height * 0.85 + 'px';
        coordText.style.color = textColor;
        coordText.style.fontSize = landscape ? '15px' : '8px';
        coordText.replaceChildren("GCS [" + this.lat + ", " + this.lon + "]");

        // Sun position text update
        const sunPosText = this.mount.parentElement.children[5];
        sunPosText.style.left = width/2 - sunPosText.clientWidth/2 + 'px';
        sunPosText.style.top = height * 0.88 + 'px';
        sunPosText.style.color = textColor;
        sunPosText.style.fontSize = landscape ? '15px' : '8px';
        sunPosText.replaceChildren("☉ Alt/Az [" 
            + Math.round(sunPos.altitude / Math.PI * 18000) / 100 + ", " 
            + Math.round(sunPos.azimuth / Math.PI * 18000) / 100 + "]");

        // Moon position text update
        const moonPosText = this.mount.parentElement.children[6];
        moonPosText.style.left = width/2 - moonPosText.clientWidth/2 + 'px';
        moonPosText.style.top = height * 0.905 + 'px';
        moonPosText.style.color = textColor;
        moonPosText.style.fontSize = landscape ? '15px' : '8px';
        moonPosText.replaceChildren("☾ Alt/Az [" 
            + Math.round(moonPos.altitude / Math.PI * 18000) / 100 + ", " 
            + Math.round(moonPos.azimuth / Math.PI * 18000) / 100 + "]");

        // Minor objects position text update
        if (this.details) {
            const mercuryPosText = this.mount.parentElement.children[7];
            mercuryPosText.style.left = (landscape ? 30 : width/2 - mercuryPosText.clientWidth/2) + 'px';
            mercuryPosText.style.top = height * (0.34 - (landscape ? 0.3 : 0)) + 'px';
            mercuryPosText.style.textAlign = landscape ? 'left' : 'center';
            mercuryPosText.style.color = textColor;
            mercuryPosText.style.fontSize = landscape ? '12px' : '6px';
            mercuryPosText.replaceChildren("☿ Alt/Az [" 
                + Math.round(planetsPos.mercury.altitude / Math.PI * 18000) / 100 + ", " 
                + Math.round(planetsPos.mercury.azimuth / Math.PI * 18000) / 100 + "]");

            const venusPosText = this.mount.parentElement.children[8];
            venusPosText.style.left = (landscape ? 30 : width/2 - venusPosText.clientWidth/2) + 'px';
            venusPosText.style.top = height * (0.36 - (landscape ? 0.3 : 0)) + 'px';
            venusPosText.style.textAlign = landscape ? 'left' : 'center';
            venusPosText.style.color = textColor;
            venusPosText.style.fontSize = landscape ? '12px' : '6px';
            venusPosText.replaceChildren("♀ Alt/Az [" 
                + Math.round(planetsPos.venus.altitude / Math.PI * 18000) / 100 + ", " 
                + Math.round(planetsPos.venus.azimuth / Math.PI * 18000) / 100 + "]");

            const marsPosText = this.mount.parentElement.children[9];
            marsPosText.style.left = (landscape ? 30 : width/2 - marsPosText.clientWidth/2) + 'px';
            marsPosText.style.top = height * (0.38 - (landscape ? 0.3 : 0)) + 'px';
            marsPosText.style.textAlign = landscape ? 'left' : 'center';
            marsPosText.style.color = textColor;
            marsPosText.style.fontSize = landscape ? '12px' : '6px';
            marsPosText.replaceChildren("♂ Alt/Az [" 
                + Math.round(planetsPos.mars.altitude / Math.PI * 18000) / 100 + ", " 
                + Math.round(planetsPos.mars.azimuth / Math.PI * 18000) / 100 + "]");

            const jupiterPosText = this.mount.parentElement.children[10];
            jupiterPosText.style.left = (landscape ? 30 : width/2 - jupiterPosText.clientWidth/2) + 'px';
            jupiterPosText.style.top = height * (0.4 - (landscape ? 0.3 : 0)) + 'px';
            jupiterPosText.style.textAlign = landscape ? 'left' : 'center';
            jupiterPosText.style.color = textColor;
            jupiterPosText.style.fontSize = landscape ? '12px' : '6px';
            jupiterPosText.replaceChildren("♃ Alt/Az [" 
                + Math.round(planetsPos.jupiter.altitude / Math.PI * 18000) / 100 + ", " 
                + Math.round(planetsPos.jupiter.azimuth / Math.PI * 18000) / 100 + "]");

            const saturnPosText = this.mount.parentElement.children[11];
            saturnPosText.style.left = (landscape ? 30 : width/2 - saturnPosText.clientWidth/2) + 'px';
            saturnPosText.style.top = height * (0.42 - (landscape ? 0.3 : 0)) + 'px';
            saturnPosText.style.textAlign = landscape ? 'left' : 'center';
            saturnPosText.style.color = textColor;
            saturnPosText.style.fontSize = landscape ? '12px' : '6px';
            saturnPosText.replaceChildren("♄ Alt/Az [" 
                + Math.round(planetsPos.saturn.altitude / Math.PI * 18000) / 100 + ", " 
                + Math.round(planetsPos.saturn.azimuth / Math.PI * 18000) / 100 + "]");

            const uranusPosText = this.mount.parentElement.children[12];
            uranusPosText.style.left = (landscape ? 30 : width/2 - uranusPosText.clientWidth/2) + 'px';
            uranusPosText.style.top = height * (0.44 - (landscape ? 0.3 : 0)) + 'px';
            uranusPosText.style.textAlign = landscape ? 'left' : 'center';
            uranusPosText.style.color = textColor;
            uranusPosText.style.fontSize = landscape ? '12px' : '6px';
            uranusPosText.replaceChildren("⛢ Alt/Az [" 
                + Math.round(planetsPos.uranus.altitude / Math.PI * 18000) / 100 + ", " 
                + Math.round(planetsPos.uranus.azimuth / Math.PI * 18000) / 100 + "]");

            const neptunePosText = this.mount.parentElement.children[13];
            neptunePosText.style.left = (landscape ? 30 : width/2 - neptunePosText.clientWidth/2) + 'px';
            neptunePosText.style.top = height * (0.46 - (landscape ? 0.3 : 0)) + 'px';
            neptunePosText.style.textAlign = landscape ? 'left' : 'center';
            neptunePosText.style.color = textColor;
            neptunePosText.style.fontSize = landscape ? '12px' : '6px';
            neptunePosText.replaceChildren("♆ Alt/Az [" 
                + Math.round(planetsPos.neptune.altitude / Math.PI * 18000) / 100 + ", " 
                + Math.round(planetsPos.neptune.azimuth / Math.PI * 18000) / 100 + "]");

            const plutoPosText = this.mount.parentElement.children[14];
            plutoPosText.style.left = (landscape ? 30 : width/2 - plutoPosText.clientWidth/2) + 'px';
            plutoPosText.style.top = height * (0.48 - (landscape ? 0.3 : 0)) + 'px';
            plutoPosText.style.textAlign = landscape ? 'left' : 'center';
            plutoPosText.style.color = textColor;
            plutoPosText.style.fontSize = landscape ? '12px' : '6px';
            plutoPosText.replaceChildren("♇ Alt/Az [" 
                + Math.round(planetsPos.pluto.altitude / Math.PI * 18000) / 100 + ", " 
                + Math.round(planetsPos.pluto.azimuth / Math.PI * 18000) / 100 + "]");

            const issPosText = this.mount.parentElement.children[15];
            issPosText.style.right = (landscape ? 30 : width/2 - issPosText.clientWidth/2) + 'px';
            issPosText.style.top = height * (0.34 - (landscape ? 0.3 : -0.17)) + 'px';
            issPosText.style.textAlign = landscape ? 'right' : 'center';
            issPosText.style.color = textColor;
            issPosText.style.fontSize = landscape ? '12px' : '6px';
            issPosText.replaceChildren("ISS Alt/Az [" 
                + Math.round(this.issPos.altitude / Math.PI * 18000) / 100 + ", " 
                + Math.round(this.issPos.azimuth / Math.PI * 18000) / 100 + "]");

            /*
            const hstPosText = this.mount.parentElement.children[16];
            hstPosText.style.right = (landscape ? 30 : width/2 - hstPosText.clientWidth/2) + 'px';
            hstPosText.style.top = height * (0.36 - (landscape ? 0.3 : -0.17)) + 'px';
            hstPosText.style.textAlign = landscape ? 'right' : 'center';
            hstPosText.style.color = textColor;
            hstPosText.style.fontSize = landscape ? '12px' : '6px';
            hstPosText.replaceChildren("HST Alt/Az [" 
                + Math.round(this.hstPos.altitude / Math.PI * 18000) / 100 + ", " 
                + Math.round(this.hstPos.azimuth / Math.PI * 18000) / 100 + "]");

            const cxoPosText = this.mount.parentElement.children[17];
            cxoPosText.style.right = (landscape ? 30 : width/2 - cxoPosText.clientWidth/2) + 'px';
            cxoPosText.style.top = height * (0.38 - (landscape ? 0.3 : -0.17)) + 'px';
            cxoPosText.style.textAlign = landscape ? 'right' : 'center';
            cxoPosText.style.color = textColor;
            cxoPosText.style.fontSize = landscape ? '12px' : '6px';
            cxoPosText.replaceChildren("CXO Alt/Az [" 
                + Math.round(this.cxoPos.altitude / Math.PI * 18000) / 100 + ", " 
                + Math.round(this.cxoPos.azimuth / Math.PI * 18000) / 100 + "]");

            const vanguard1PosText = this.mount.parentElement.children[18];
            vanguard1PosText.style.right = (landscape ? 30 : width/2 - vanguard1PosText.clientWidth/2) + 'px';
            vanguard1PosText.style.top = height * (0.4 - (landscape ? 0.3 : 0)) + 'px';
            vanguard1PosText.style.textAlign = landscape ? 'right' : 'center';
            vanguard1PosText.style.color = textColor;
            vanguard1PosText.style.fontSize = landscape ? '12px' : '6px';
            vanguard1PosText.replaceChildren("Vanguard 1 Alt/Az [" 
                + Math.round(this.vanguard1Pos.altitude / Math.PI * 18000) / 100 + ", " 
                + Math.round(this.vanguard1Pos.azimuth / Math.PI * 18000) / 100 + "]");
            */
        } else {
            const mercuryPosText = this.mount.parentElement.children[7];
            mercuryPosText.replaceChildren("");
            const venusPosText = this.mount.parentElement.children[8];
            venusPosText.replaceChildren("");
            const marsPosText = this.mount.parentElement.children[9];
            marsPosText.replaceChildren("");
            const jupiterPosText = this.mount.parentElement.children[10];
            jupiterPosText.replaceChildren("");
            const saturnPosText = this.mount.parentElement.children[11];
            saturnPosText.replaceChildren("");
            const uranusPosText = this.mount.parentElement.children[12];
            uranusPosText.replaceChildren("");
            const neptunePosText = this.mount.parentElement.children[13];
            neptunePosText.replaceChildren("");
            const plutoPosText = this.mount.parentElement.children[14];
            plutoPosText.replaceChildren("");
            const issPosText = this.mount.parentElement.children[15];
            issPosText.replaceChildren("");
            /*
            const hstPosText = this.mount.parentElement.children[16];
            hstPosText.replaceChildren("");
            const cxoPosText = this.mount.parentElement.children[17];
            cxoPosText.replaceChildren("");
            const vanguard1PosText = this.mount.parentElement.children[18];
            vanguard1PosText.replaceChildren("");
            */
        }

        // Speed down button update
        const spdDownBtn = this.mount.parentElement.children[19];
        spdDownBtn.style.left = width/2 - spdDownBtn.clientWidth/2 - timezoneText.clientWidth*0.8 + 'px';
        spdDownBtn.style.top = height * 0.78 - spdDownBtn.clientHeight/2 + timezoneText.clientHeight/2 + 'px';
        spdDownBtn.style.color = textColor;
        spdDownBtn.style.border = '2px solid ' + textColor;
        spdDownBtn.style.fontSize = landscape ? '15px' : '10px';
        spdDownBtn.replaceChildren('<<');
        spdDownBtn.disabled = this.speed < -10000000

        // Speed up button update
        const spdUpBtn = this.mount.parentElement.children[20];
        spdUpBtn.style.left = width/2 - spdUpBtn.clientWidth/2 + timezoneText.clientWidth*0.8 + 'px';
        spdUpBtn.style.top = height * 0.78 - spdUpBtn.clientHeight/2 + timezoneText.clientHeight/2 + 'px';
        spdUpBtn.style.color = textColor;
        spdUpBtn.style.border = '2px solid ' + textColor;
        spdUpBtn.style.fontSize = landscape ? '15px' : '10px';
        spdUpBtn.replaceChildren('>>');
        spdUpBtn.disabled = this.speed > 10000000

        // FPS button update
        const fpsBtn = this.mount.parentElement.children[21];
        fpsBtn.style.left = width/2 - fpsBtn.clientWidth/2 - timezoneText.clientWidth*0.8 + 'px';
        fpsBtn.style.top = height * 0.83 - fpsBtn.clientHeight/2 + timezoneText.clientHeight/2 + 'px';
        fpsBtn.style.color = textColor;
        fpsBtn.style.border = '2px solid ' + textColor;
        fpsBtn.style.fontSize = landscape ? '15px' : '10px';
        fpsBtn.replaceChildren(this.delay === 100 ? '10 FPS' : '40 FPS');

        // POV button update
        const povBtn = this.mount.parentElement.children[22];
        povBtn.style.left = width/2 - povBtn.clientWidth/2 + timezoneText.clientWidth*0.8 + 'px';
        povBtn.style.top = height * 0.83 - povBtn.clientHeight/2 + timezoneText.clientHeight/2 + 'px';
        povBtn.style.color = textColor;
        povBtn.style.border = '2px solid ' + textColor;
        povBtn.style.fontSize = landscape ? '15px' : '10px';
        povBtn.replaceChildren(this.pov === 1 ? '1st POV' : '3rd POV');

        // Rotate button update
        const rotBtn = this.mount.parentElement.children[23];
        rotBtn.style.left = width/2 - rotBtn.clientWidth/2 - timezoneText.clientWidth*0.8 + 'px';
        rotBtn.style.top = height * 0.88 - rotBtn.clientHeight/2 + timezoneText.clientHeight/2 + 'px';
        rotBtn.style.color = textColor;
        rotBtn.style.border = '2px solid ' + textColor;
        rotBtn.style.fontSize = landscape ? '15px' : '10px';
        rotBtn.replaceChildren(this.controls.autoRotate ? 'Rotating' : 'Fixed');

        // Details button update
        const detBtn = this.mount.parentElement.children[24];
        detBtn.style.left = width/2 - detBtn.clientWidth/2 + timezoneText.clientWidth*0.8 + 'px';
        detBtn.style.top = height * 0.88 - detBtn.clientHeight/2 + timezoneText.clientHeight/2 + 'px';
        detBtn.style.color = textColor;
        detBtn.style.border = '2px solid ' + textColor;
        detBtn.style.fontSize = landscape ? '15px' : '10px';
        detBtn.replaceChildren(this.details ? 'Detailed' : 'Simple');

        // Coordinate update
        if (!this.posFixed) {
            navigator.geolocation.getCurrentPosition((pos) => {
                this.lat = pos.coords.latitude;
                this.lon = pos.coords.longitude;
            });
        }

        this.composer.render();
        this.frameId = window.requestAnimationFrame(this.animate);
    }

    updatePerspective(resetPos=true) {
        if (this.pov === 3) {
            this.controls.minDistance = 5;
            this.controls.maxDistance = 50;
            this.controls.reset();
            this.controls.target.set(0, 0, 0);

            if (resetPos) this.camera.position.set(-9, 4, -4);
            
        } else {
            this.controls.minDistance = 0.01;
            this.controls.maxDistance = 0.1;
            this.controls.reset();
            this.controls.target.set(-0.9972, 0.1017, 0.395);

            if (resetPos) {
                this.camera.position.set(-1, 0.1, 0.4);
                this.camera.lookAt(2, 2, -5);
            }
        }

        this.camera.updateProjectionMatrix();
    }

    resize() {
        if (!this.composer || !this.camera) return;
            const width = getWidth();
            const height = getHeight();
            this.composer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.initGodRays();
    }

    render() {

        return (
            <div ref={this.myRef}>
                <div style={{position: 'relative'}}
                    ref={(mount) => { this.mount = mount }}/>

                <div/>
                <div/>
                <div/>
                <div/>
                <div/>
                <div/>

                <div/>
                <div/>
                <div/>
                <div/>
                <div/>
                <div/>
                <div/>
                <div/>

                <div/>
                <div/>
                <div/>
                <div/>

                <button onClick={() => {
                    if (this.speed === 1) {
                        this.speed = -10
                    } else {
                        this.speed *= (this.speed > 0) ? 0.1 : 10
                    }
                }}/>

                <button onClick={() => {
                    if (this.speed === -1) {
                        this.speed = 10
                    } else {
                        this.speed *= (this.speed < 0) ? 0.1 : 10
                    }
                }}/>

                <button onClick={() => {
                    this.delay = this.delay === 100 ? 25 : 100;
                }}/>

                <button onClick={() => {
                    this.pov = this.pov === 1 ? 3 : 1;
                    this.updatePerspective();
                }}/>

                <button onClick={() => {
                    this.controls.autoRotate = !this.controls.autoRotate;
                }}/>

                <button onClick={() => {
                    this.details = !this.details;
                }}/>
            </div>
        )
    }
}

export default Clock;
