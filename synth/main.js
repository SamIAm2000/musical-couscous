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
    active = 0;
    targetGain = 0.7;

    const globalGain = audioCtx.createGain(); //this will control the volume of all notes
    globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    globalGain.connect(audioCtx.destination);

    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            //lower amplitude of all other notes
            active += 1;
            console.log("in" + targetGain/active);
            for (var curkey in activeGains){
                activeGains[curkey].gain.exponentialRampToValueAtTime(targetGain/active, audioCtx.currentTime+0.2);
            }
            playNote(key);
        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        console.log(key);
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
            // activeGains[key].gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime+1);
            activeGains[key].gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.8);
            // activeGains[key].gain.value = 0;
            activeOscillators[key].stop(audioCtx.currentTime +1);

            delete activeGains[key];
            delete activeOscillators[key];
            active -= 1;

            // //increase amplitude of remaining notes
            // console.log("out" + targetGain/active);
            // for (var curkey in activeGains){
            //     activeGains[curkey].gain.exponentialRampToValueAtTime(targetGain/active, audioCtx.currentTime+0.7) ;
            // }
        }
        
    }

    function playNote(key) {
        const osc = audioCtx.createOscillator();
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)
        osc.type = document.querySelector('input[name="waveform"]:checked').value;//choose your favorite waveform

        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0;
        osc.connect(gainNode).connect(globalGain);
        
        activeOscillators[key] = osc;
        activeGains[key] = gainNode;
        osc.start();

        // gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.setTargetAtTime(targetGain/active, audioCtx.currentTime, 0.1); //attack time 0.3

    }
})