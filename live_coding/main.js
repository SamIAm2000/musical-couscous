
var audioCtx;
var osc;
var timings;
var liveCodeState = [];
const playButton = document.querySelector('button');

const wavemap = {
    "1": "sine",
    "2": "square",
    "3": "sawtooth",
    "4": "triangle"
};

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)
    osc = audioCtx.createOscillator();
    timings = audioCtx.createGain();
    timings.gain.value = 0;
    osc.connect(timings).connect(audioCtx.destination);
    osc.start();
    scheduleAudio()
}

function scheduleAudio() {
    let timeElapsedSecs = 0;
    
    liveCodeState.forEach(noteData => {
        //osc.type.setTargetAtTime(1, audioCtx.currentTime + timeElapsedSecs, wavemap[noteData["wavetype"]])
        setTimeout(() => {osc.type = wavemap[noteData["wavetype"]];} , timeElapsedSecs*1000);
        //osc.type.setTargetAtTime(wavemap[noteData["wavetype"]], audioCtx.currentTime + timeElapsedSecs, 0.01);
        //osc.type = wavemap[noteData["wavetype"]];
        console.log(noteData["wavetype"]);
        console.log(audioCtx.currentTime +timeElapsedSecs);
        timings.gain.setTargetAtTime(1, audioCtx.currentTime + timeElapsedSecs, 0.01)
        osc.frequency.setTargetAtTime(noteData["pitch"], audioCtx.currentTime + timeElapsedSecs, 0.01)
        timeElapsedSecs += noteData["length"]/10.0;
        timings.gain.setTargetAtTime(0, audioCtx.currentTime + timeElapsedSecs, 0.01)
        timeElapsedSecs += 0.2; //rest between notes
    });
    setTimeout(scheduleAudio, timeElapsedSecs * 1000);
}

function parseCode(code) {
    //how could we allow for a repeat operation 
    //(e.g. "3@340 2[1@220 2@330]"" plays as "3@340 1@220 2@330 1@220 2@330")
    //how could we allow for two lines that play at the same time?
    //what if we want variables?
    //how does this parsing technique limit us?
    let notes = code.split(" ");

    //notice this will fail if the input is not correct
    //how could you handle this? allow some flexibility in the grammar? fail gracefully?
    //ideally (probably), the music does not stop
    notes = notes.map(note => {
        noteData = note.split("@");
        return   {"length" : eval(noteData[0]), //the 'eval' function allows us to write js code in our live coding language
                "pitch" : eval(noteData[1]),
                "wavetype" : eval(noteData[2])};
                //what other things should be controlled? osc type? synthesis technique?
    });
    return notes;
}

function genAudio(data) {
    liveCodeState = data;
}

function reevaluate() {
    var code = document.getElementById('code').value;
    var data = parseCode(code);
    genAudio(data);
}

playButton.addEventListener('click', function () {

    if (!audioCtx) {
        initAudio();
    }

    reevaluate();


});
