let audioCtx1 = null;
let isPlaying = false;
var brownNoise = null;
var globalGain1 = null;

document.addEventListener("DOMContentLoaded", function (event) {
    audioCtx1 = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx2 = new (window.AudioContext || window.webkitAudioContext)();

    globalGain1 = audioCtx1.createGain(); //this will control the volume of all notes
    globalGain1.gain.setValueAtTime(0.7, audioCtx1.currentTime);
    globalGain1.connect(audioCtx1.destination);

    // audio context 2
    const globalGain2 = audioCtx2.createGain(); //this will control the volume of all notes
    globalGain2.gain.setValueAtTime(0.7, audioCtx2.currentTime);
    globalGain2.connect(audioCtx2.destination);

    globalAnalyser = audioCtx2.createAnalyser();
    globalGain2.connect(globalAnalyser);
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

