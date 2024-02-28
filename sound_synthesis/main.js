var brownNoise = null;
var globalGain1 = null;
var globalGain2 = null;

document.addEventListener("DOMContentLoaded", function (event) {
    audioCtx1 = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx2 = new (window.AudioContext || window.webkitAudioContext)();

    globalGain1 = audioCtx1.createGain(); //this will control the volume of all notes
    globalGain1.gain.setValueAtTime(0.7, audioCtx1.currentTime);
    globalGain1.connect(audioCtx1.destination);

    // audio context 2
    globalGain2 = audioCtx2.createGain(); //this will control the volume of all notes
    globalGain2.gain.setValueAtTime(0.4, audioCtx2.currentTime);
    globalGain2.connect(audioCtx2.destination);

    globalAnalyser = audioCtx2.createAnalyser();
    globalGain2.connect(globalAnalyser);
    console.log("globalAnalyser", globalAnalyser);
    draw();
});

function initWaterSound() {
  // Create brown noise
  const bufferSize = 10 * audioCtx1.sampleRate;
  const noiseBuffer = audioCtx1.createBuffer(
    1,
    bufferSize,
    audioCtx1.sampleRate
  );
  const output = noiseBuffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const brown = Math.random() * 2 - 1;
    output[i] = (lastOut + 0.02 * brown) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5;
  }

  brownNoise = audioCtx1.createBufferSource();
  brownNoise.buffer = noiseBuffer;
  brownNoise.loop = true;

  // Create Low Pass Filters
  const lpFilter1 = audioCtx1.createBiquadFilter();
  lpFilter1.type = "lowpass";
  lpFilter1.frequency.value = 400;

  const lpFilter2 = audioCtx1.createBiquadFilter();
  lpFilter2.type = "lowpass";
  lpFilter2.frequency.value = 14;

  // Create ConstantSourceNode for adding offset
  const offsetNode = audioCtx1.createConstantSource();
  offsetNode.offset.value = 100;
  offsetNode.start();

  // Create GainNode for scaling the second filter output
  const gainNodeLPF2 = audioCtx1.createGain();
  gainNodeLPF2.gain.value = 900;

  // Connect Nodes
  brownNoise.connect(lpFilter1);
  brownNoise.connect(lpFilter2);
  lpFilter2.connect(gainNodeLPF2);
  gainNodeLPF2.connect(offsetNode.offset);

  // Create High Pass Filter
  const RHPFilter = audioCtx1.createBiquadFilter();
  RHPFilter.type = "highpass";
  lpFilter1.connect(RHPFilter);
  offsetNode.connect(RHPFilter.frequency);
  RHPFilter.Q.value = 40;

  // create gain node
  const gainNodeRHPF = audioCtx1.createGain();
  gainNodeRHPF.gain.value = 0.1;
  RHPFilter.connect(gainNodeRHPF);

  // Connect Filters to destination
  //gainNodeRHPF.connect(globalGain1);
  gainNodeRHPF.connect(audioCtx1.destination);

  // Start playing
  brownNoise.start();
  isPlaying = true;
}

const playButton = document.getElementById("waterSoundButton");
playButton.addEventListener(
  "click",
  function () {
    if (!brownNoise) {
      initWaterSound();
      playButton.textContent = "Pause";
      return;
    }
    if (audioCtx1.state === "suspended") {
      audioCtx1.resume();
      playButton.textContent = "Pause";
    }

    if (audioCtx1.state === "running") {
      audioCtx1.suspend();
      playButton.textContent = "Play";
    }
  },
  false
);

const pewButton = document.getElementById("pew");
pewButton.addEventListener(
  "click",
  function () {
    playSound();
    //pewButton.textContent = "Pause";
  },
  false
);


function createBlasterSound(audioCtx, duration) {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    const attackDuration = 0.05; // Duration of attack in seconds
    const decayDuration = duration - attackDuration; // Duration of decay in seconds

    for (let i = 0; i < bufferSize; i++) {
        if (i < attackDuration * audioCtx.sampleRate) {
            // Generate attack phase (ramp-up)
            data[i] = (i / (attackDuration * audioCtx.sampleRate)) * Math.random();
        } else {
            // Generate decay phase (exponential decay)
            const t = (i - attackDuration * audioCtx.sampleRate) / (decayDuration * audioCtx.sampleRate);
            data[i] = Math.exp(-5 * t) * Math.random();
        }
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();

    return source;
}

function createBlasterSoundWithEcho(audioCtx, duration) {
    // Create oscillator
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(9000, audioCtx.currentTime); // Initial frequency
    osc.frequency.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration); // Ramp down to 0 Hz

    //create second oscillator
    const osc2 = audioCtx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(9000, audioCtx.currentTime); // Initial frequency
    osc2.frequency.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration -2); // Ramp down to 0 Hz

    //create third oscillator
    const osc3 = audioCtx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(9000, audioCtx.currentTime); // Initial frequency
    osc3.frequency.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration -3); // Ramp down to 0 Hz

    //create fourth oscillator
    const osc4 = audioCtx.createOscillator();
    osc4.type = "sine";
    osc4.frequency.setValueAtTime(9000, audioCtx.currentTime); // Initial frequency
    osc4.frequency.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration -3.5); // Ramp down to 0 Hz


    // Create convolver node for echo effect
    const convolver = audioCtx.createConvolver();
    const impulseResponse = createEchoImpulseResponse(audioCtx); // Create echo impulse response
    convolver.buffer = impulseResponse;

    // Connect nodes
    osc.connect(convolver);
    osc2.connect(convolver);
    osc3.connect(convolver);
    osc4.connect(convolver);
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    convolver.connect(gainNode); 
    
    gainNode.connect(globalGain2);
    //osc.connect(globalGain2);

    // Start oscillator
    osc.start();
    osc2.start();
    osc3.start();
    osc4.start();

    // Stop oscillator after duration
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration+2);
    osc.stop(audioCtx.currentTime + duration + 2);

    return osc;
}

// Function to create an impulse response for echo effect
function createEchoImpulseResponse(audioCtx) {
    const length = audioCtx.sampleRate * 2; // Length of impulse response (2 seconds)
    const impulse = audioCtx.createBuffer(2, length, audioCtx.sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    const decay = 20.0; // Decay factor for echo (adjust as needed)

    // Fill impulse response buffers
    for (let i = 0; i < length; i++) {
        const val = Math.pow(1 - i / length, decay);
        impulseL[i] = impulseR[i] = val * (Math.random() * 2 - 1);
    }

    return impulse;
}

function createCreak(audioCtx, frequency, duration) {

}


function playSound(){    
    const frequency = 400; // Frequency of the waveform
    const duration = 4; // Duration of the waveform in seconds

    // const farnellSource = createFarnellSynthesis(audioCtx2, frequency, duration);
    // farnellSource.connect(audioCtx2.destination);
    source = createBlasterSoundWithEcho(audioCtx2, duration);
    //source.connect(audioCtx2.destination);

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


function playBark() {
  // Create audio context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// Create nodes
const noiseNode = audioContext.createScriptProcessor(4096, 1, 1);
const gainNode = audioContext.createGain();
const filterNode = audioContext.createBiquadFilter();
const hipassNode = audioContext.createBiquadFilter();
const lowpassNode = audioContext.createBiquadFilter();
const tanhNode = audioContext.createWaveShaper();
const outputNode = audioContext.destination;

// Configure nodes
noiseNode.onaudioprocess = function(e) {
  const output = e.outputBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i++) {
    output[i] = Math.random() * 2 - 1; // White noise
  }
};

gainNode.gain.value = 0.7;

filterNode.type = 'bandpass';
filterNode.frequency.value = 470;
filterNode.Q.value = 1.414;

hipassNode.type = 'highpass';
hipassNode.frequency.value = 900;
hipassNode.Q.value = 0.667;

lowpassNode.type = 'lowpass';
lowpassNode.frequency.value = 900;
lowpassNode.Q.value = 0.667;

// Tanh function approximation
function tanh(x) {
  return Math.tanh(x);
}

const curve = new Float32Array(4096);
for (let i = 0; i < 4096; i++) {
  const x = (i - 2048) / 2048;
  curve[i] = tanh(x);
}
tanhNode.curve = curve;

// Connect nodes
noiseNode.connect(filterNode);
filterNode.connect(hipassNode);
hipassNode.connect(lowpassNode);
lowpassNode.connect(gainNode);
gainNode.connect(tanhNode);
tanhNode.connect(outputNode);
}

