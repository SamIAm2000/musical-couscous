document.addEventListener("DOMContentLoaded", function(event) {

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    activeOscillators = {};
    activeGains = {};
    activeAdditiveOscillators = {};
    activeAMOscillators = {};
    activeFMOscillators = {};
    activeLFOs = {};

    active = 0;
    sustainGain = 0.4;
    sustainGainAdditive = 0.1;

    AMcarrierFrequency = 100;
    FMmodulationIndex = 100;
    FMmodulatorFreq = 100;
    lfoFrequency = 15;
    lfoAmplitude = 10;

    attack = 0.4;
    attackAmount = 0.3
    decay = 0.4;
    sustain = 0.4;
    release = 0.4;

    const globalGain = audioCtx.createGain(); //this will control the volume of all notes
    globalGain.gain.setValueAtTime(0.7, audioCtx.currentTime);
    globalGain.connect(audioCtx.destination);

    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        attack = Number(document.getElementById('attack-slider').value)
        decay = Number(document.getElementById('decay-slider').value);
        sustain = Number(document.getElementById('sustain-slider').value);
        release = Number(document.getElementById('release-slider').value);

        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            attack = 0.5; // Modify the value of the global variable 'attack' here
            playNote(key);
        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        console.log(key);
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
            active -= 1;
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

        //set Attack, decay, sustain
        t_pressed = audioCtx.currentTime;
        gainNode.gain.linearRampToValueAtTime(sustainGain + attackAmount, t_pressed + attack);
        gainNode.gain.linearRampToValueAtTime(sustainGain, t_pressed + attack + decay);
        

        if (lfoOn == 'yes') {
            addLFO(key, osc)
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
            curOsc.frequency.setValueAtTime(keyboardFrequencyMap[key] * i + Math.random() * 15, audioCtx.currentTime);
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

        //set Attack, decay, sustain
        t_pressed = audioCtx.currentTime;
        gainNode.gain.linearRampToValueAtTime(sustainGain + attackAmount, t_pressed + attack);
        gainNode.gain.linearRampToValueAtTime(sustainGain, t_pressed + attack + decay);
        
    }

    function playNoteAM(key, waveformType) {
        var carrier = audioCtx.createOscillator();
        var modulatorFreq = audioCtx.createOscillator();
        modulatorFreq.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)
        carrier.frequency.value = AMcarrierFrequency;

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

        // //set Attack
        // gainNode.gain.setTargetAtTime(sustainGain, audioCtx.currentTime, 0.01); //attack time
        
        //set Attack, decay, sustain
        t_pressed = audioCtx.currentTime;
        gainNode.gain.linearRampToValueAtTime(sustainGain + attackAmount, t_pressed + attack);
        gainNode.gain.linearRampToValueAtTime(sustainGain, t_pressed + attack + decay);
        

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

        activeOscillators[key] = carrier;
        activeAMOscillators[key] = modulatorFreq;
    
        modulatorFreq.connect(modulationIndex);
        modulationIndex.connect(carrier.frequency)
        
        // carrier.connect(audioCtx.destination);
        // create gain node
        var gainNode = audioCtx.createGain();
        gainNode.gain.value = 0;
        carrier.connect(gainNode).connect(globalGain);
        activeGains[key] = gainNode;
    
        carrier.start();
        modulatorFreq.start();

        //set Attack, decay, sustain
        t_pressed = audioCtx.currentTime;
        gainNode.gain.linearRampToValueAtTime(sustainGain + attackAmount, t_pressed + attack);
        gainNode.gain.linearRampToValueAtTime(sustainGain, t_pressed + attack + decay);
        
        if (lfoOn == 'yes') {
            addLFO(key, carrier);
            addLFO(key, modulatorFreq);
        }

    }
    function addLFO(key, osc) {
        console.log("lfo added");
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

})