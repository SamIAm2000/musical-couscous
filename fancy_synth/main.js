//global vars
sustainGain = 0.5;
attackAmount = 0.4;

AMcarrierFrequency = 100;
FMmodulationIndex = 100;
FMmodulatorFreq = 100;
lfoFrequency = 15;
lfoAmplitude = 10;

//attack, decay, release times
attack = 0.4;
decay = 0.4;
release = 0.4;

var globalAnalyser;

const keyboardFrequencyMap = {
    '90': 261.625565300598634,  //Z - C
    '83': 277.182630976872096, //S - C#
    '88': 293.664767917407560,  //X - D
    '68': 311.126983722080910, //D - D#
    '67': 329.627556912869929,  //C - E
    '86': 349.228231433003884,  //V - F
    '71': 369.994422711634398, //G - F#
    '66': 391.995435981749294,  //B - G
    '72': 415.304697579945138, //H - G#
    '78': 440.000000000000000,  //N - A
    '74': 466.163761518089916, //J - A#
    '77': 493.883301256124111,  //M - B
    '81': 523.251130601197269,  //Q - C
    '50': 554.365261953744192, //2 - C#
    '87': 587.329535834815120,  //W - D
    '51': 622.253967444161821, //3 - D#
    '69': 659.255113825739859,  //E - E
    '82': 698.456462866007768,  //R - F
    '53': 739.988845423268797, //5 - F#
    '84': 783.990871963498588,  //T - G
    '54': 830.609395159890277, //6 - G#
    '89': 880.000000000000000,  //Y - A
    '55': 932.327523036179832, //7 - A#
    '85': 987.766602512248223,  //U - B

}


document.addEventListener("DOMContentLoaded", function(event) {

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();


    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    activeOscillators = {};
    activeGains = {};
    activeAMOscillators = {};
    activeFMOscillators = {};
    activeAdditiveOscillators = {};
    activeLFOs = {};

    active = 0;


    const globalGain = audioCtx.createGain(); //this will control the volume of all notes
    globalGain.gain.setValueAtTime(0.7, audioCtx.currentTime);
    globalGain.connect(audioCtx.destination);

    globalAnalyser = audioCtx.createAnalyser();
    globalGain.connect(globalAnalyser);
    draw();

    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        attack = Number(document.getElementById('attack-slider').value)
        decay = Number(document.getElementById('decay-slider').value);
        release = Number(document.getElementById('release-slider').value);

        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            attack = 0.5; // Modify the value of the global variable 'attack' here
            playNote(key);
        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {

            // ADSR release
            t_released = audioCtx.currentTime;

            activeGains[key].gain.cancelScheduledValues(t_released);
            activeGains[key].gain.setValueAtTime(activeGains[key].gain.value, t_released);
            activeGains[key].gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + release);
            activeOscillators[key].stop(t_released + release + 0.1);

            if (key in activeAdditiveOscillators) {
                for (let i = 0; i < activeAdditiveOscillators[key].length; i++) {
                    activeAdditiveOscillators[key][i].stop(t_released + release + 0.1);
                }
            }
            
            delete activeGains[key];
            delete activeOscillators[key];
            delete activeAdditiveOscillators[key];
            delete activeAMOscillators[key];
            delete activeFMOscillators[key];
            delete activeLFOs[key];
        }
        
    }

    function playNote(key) {
        waveformType = document.querySelector('input[name="waveform"]:checked').value; //choose your favorite waveform
        synthType = document.querySelector('input[name="synthtype"]:checked').value; //choose your favorite synth type
        lfoOn = document.querySelector('input[name="lfo-toggle"]:checked').value; //choose LFO on or off

        if (synthType == "none") {
            playNoteNormal(key, waveformType, lfoOn);
        } else if (synthType == "additive") {
            playNoteAdditive(key, waveformType);
        } else if (synthType == "AM") {
            playNoteAM(key, waveformType, lfoOn);
        } else if (synthType == "FM") {
            playNoteFM(key, waveformType, lfoOn);
        }

    }

    function playNoteNormal(key,waveformType, lfoOn) {
        const osc = audioCtx.createOscillator();
        osc.type = waveformType;
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)

        //create and connect gain nodes
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0;
        osc.connect(gainNode).connect(globalGain);
        
        activeOscillators[key] = osc;
        activeGains[key] = gainNode;
        osc.start();

        // adjust gains
        numActive = Object.keys(activeOscillators).length + Object.keys(activeAdditiveOscillators).length;
        newGain = sustainGain/numActive;
        for (let key in activeOscillators) {
            activeGains[key].gain.value = newGain;
        }

        // set Attack, decay, sustain
        t_pressed = audioCtx.currentTime;
        gainNode.gain.linearRampToValueAtTime((sustainGain + attackAmount)/numActive, t_pressed + attack);
        gainNode.gain.linearRampToValueAtTime(newGain, t_pressed + attack + decay);
        
        if (lfoOn == 'yes') {
            addLFO(key, osc);
        }
    }

    function playNoteAdditive(key, waveformType) {
        const osc = audioCtx.createOscillator();
        osc.type = waveformType;
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime);

        // create gain node
        var gainNode = audioCtx.createGain();
        gainNode.gain.value = 0;
        osc.connect(gainNode)

        curoscs = []

        const numHarmonics = 4; // Number of harmonics to add
        for (let i = 2; i <= numHarmonics; i++) {
            const curOsc = audioCtx.createOscillator();
            curOsc.frequency.setValueAtTime(keyboardFrequencyMap[key] * i + Math.random() * 20, audioCtx.currentTime);
            curOsc.type = waveformType;
            curOsc.connect(gainNode);
            curOsc.start();
            curoscs.push(curOsc);
        }

        
        activeOscillators[key] = osc;
        activeGains[key] = gainNode;
        activeAdditiveOscillators[key] = curoscs;

        gainNode.connect(globalGain);

        osc.start();

        // adjust gains
        let numActive = Object.keys(activeOscillators).length;
        for (let key in activeAdditiveOscillators) {
            numActive += activeAdditiveOscillators[key].length;
        }

        newGain = sustainGain/numActive;
        for (let key in activeOscillators) {
            activeGains[key].gain.value = newGain;
        }

        console.log(numActive);

        //set Attack, decay, sustain
        t_pressed = audioCtx.currentTime;
        gainNode.gain.linearRampToValueAtTime((sustainGain + attackAmount)/numActive, t_pressed + attack);
        gainNode.gain.linearRampToValueAtTime(newGain, t_pressed + attack + decay);
        
    }

    function playNoteAM(key, waveformType) {
        var carrier = audioCtx.createOscillator();
        var modulatorFreq = audioCtx.createOscillator();
        modulatorFreq.frequency.setValueAtTime(AMcarrierFrequency, audioCtx.currentTime)
        carrier.frequency.value = keyboardFrequencyMap[key];

        carrier.type = waveformType;
        modulatorFreq.type = waveformType;

        const modulated = audioCtx.createGain();
        const depth = audioCtx.createGain();
        depth.gain.value = 0.5 //scale modulator output to [-0.5, 0.5]
        modulated.gain.value = 1.0 - depth.gain.value; //a fixed value of 0.5

        activeOscillators[key] = carrier;
        activeAMOscillators[key] = modulatorFreq;
    
        modulatorFreq.connect(depth).connect(modulated.gain); //.connect is additive, so with [-0.5,0.5] and 0.5, the modulated signal now has output gain at [0,1]
        carrier.connect(modulated)
        //modulated.connect(audioCtx.destination);

        // create gain node
        var gainNode = audioCtx.createGain();
        gainNode.gain.value = 0;
        modulated.connect(gainNode).connect(globalGain);
        activeGains[key] = gainNode;
        
        carrier.start();
        modulatorFreq.start();

        // adjust gains
        numActive = Object.keys(activeOscillators).length + Object.keys(activeAdditiveOscillators).length;
        newGain = sustainGain/numActive;
        for (let key in activeOscillators) {
            activeGains[key].gain.value = newGain;
        }
        
        //set Attack, decay, sustain
        t_pressed = audioCtx.currentTime;
        gainNode.gain.linearRampToValueAtTime((sustainGain + attackAmount)/numActive, t_pressed + attack);
        gainNode.gain.linearRampToValueAtTime(newGain, t_pressed + attack + decay);
        
        if (lfoOn == 'yes') {
            addLFO(key, carrier);
            addLFO(key, modulatorFreq);
        }
    }

    function playNoteFM(key, waveformType) {
        var carrier = audioCtx.createOscillator();
        var modulatorFreq = audioCtx.createOscillator();
    
        modulationIndex = audioCtx.createGain();
        modulationIndex.gain.value = FMmodulationIndex;
        modulatorFreq.frequency.value = FMmodulatorFreq;
        carrier.frequency.value = keyboardFrequencyMap[key];

        carrier.type = waveformType;
        modulatorFreq.type = waveformType;

        activeOscillators[key] = carrier;
        activeFMOscillators[key] = modulatorFreq;
    
        modulatorFreq.connect(modulationIndex);
        modulationIndex.connect(carrier.frequency)
        
        // create gain node
        var gainNode = audioCtx.createGain();
        gainNode.gain.value = 0;
        carrier.connect(gainNode).connect(globalGain);
        activeGains[key] = gainNode;
    
        carrier.start();
        modulatorFreq.start();

        // adjust gains
        numActive = Object.keys(activeOscillators).length + Object.keys(activeAdditiveOscillators).length;
        newGain = sustainGain/numActive;
        for (let key in activeOscillators) {
            activeGains[key].gain.value = newGain;
        }

        //set Attack, decay, sustain
        t_pressed = audioCtx.currentTime;
        gainNode.gain.linearRampToValueAtTime((sustainGain + attackAmount)/numActive, t_pressed + attack);
        gainNode.gain.linearRampToValueAtTime(newGain, t_pressed + attack + decay);
        
        if (lfoOn == 'yes') {
            addLFO(key, carrier);
            addLFO(key, modulatorFreq);
        }

    }
    function addLFO(key, osc) {
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = lfoFrequency;
        lfoGain.gain.value = lfoAmplitude;
        lfo.connect(lfoGain).connect(osc.frequency);
        lfo.start();
        if (key in activeLFOs){
            activeLFOs[key].push(lfo)
        }
        else {
            activeLFOs[key] = [lfo]
        }

    }

    function draw() {
        globalAnalyser.fftSize = 2048;
        var bufferLength = globalAnalyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        globalAnalyser.getByteTimeDomainData(dataArray);
    
        var canvas = document.querySelector("#globalVisualizer");
        var canvasCtx = canvas.getContext("2d");
    
        requestAnimationFrame(draw);
    
        globalAnalyser.getByteTimeDomainData(dataArray);
    
        canvasCtx.fillStyle = "white";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "rgb(0, 0, 0)";
    
        canvasCtx.beginPath();
    
        var sliceWidth = canvas.width * 1.0 / bufferLength;
        var x = 0;
    
        for (var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 128.0;
            var y = v * canvas.height / 2;
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }
    
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }

})