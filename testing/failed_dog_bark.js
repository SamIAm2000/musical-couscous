
document.addEventListener("DOMContentLoaded", function (event) {
    audioCtx2 = new (window.AudioContext || window.webkitAudioContext)();

    // audio context 2
    const globalGain2 = audioCtx2.createGain(); //this will control the volume of all notes
    globalGain2.gain.setValueAtTime(0.7, audioCtx2.currentTime);
    globalGain2.connect(audioCtx2.destination);

    // globalGain2.connect(globalAnalyser);

});

const dogBarkButton = document.getElementById("dogBarkButton");
dogBarkButton.addEventListener(
  "click",
  function () {
    initBark();
    dogBarkButton.textContent = "Pause";
  },
  false
);

function createFlappingWaveshaperNode(freq = 100, width, ripple, noiseAmount){
    console.log("Creating flapping waveshaper node");
    audioCtx2.audioWorklet.addModule('cosine-processor.js')
  .then(() => {

    // Audio worklet processor is registered, you can now use it
    const cosineNode = new AudioWorkletNode(audioCtx2, 'cosine-processor');

    osc = audioCtx2.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;

    const offsetNode = audioCtx2.createConstantSource();
    offsetNode.offset.value = -0.5;
    offsetNode.start();

    gainNode0 = audioCtx2.createGain();
    gainNode0.gain.value = 1;

    offsetNode.connect(gainNode0);

    gainNode0.connect(osc.gain);

    osc.connect(audioCtx2.destination)



    gainNode1 = audioCtx2.createGain();
    gainNode1.gain.value = ripple;

    osc.connect(gainNode1);
    gainNode1.connect(audioCtx2.destination);

    cosineNode1 = new AudioWorkletNode(audioCtx2, 'cosine-processor');
    cosineNode2 = new AudioWorkletNode(audioCtx2, 'cosine-processor');

    gainNode1.connect(cosineNode1);
    offsetNode.connect(cosineNode2);

    offsetNode2 = audioCtx2.createConstantSource();
    offsetNode2.offset.value = 1;
    offsetNode2.start();

    cosineNode2.connect(offsetNode2);

    gainNode2 = audioCtx2.createGain();
    gainNode2.gain.value = 0.5;

    offsetNode2.connect(gainNode2);

    gainNode3 = audioCtx2.createGain();
    cosineNode1.connect(gainNode3.gain);

    gainNode2.connect(gainNode3);

    //now we have just gainNode3
    //times width
    gainNode4 = audioCtx2.createGain();
    gainNode4.gain.value = width;
    gainNode3.connect(gainNode4);

    gainNode5 = audioCtx2.createGain();
    gainNode4.connect(gainNode5.gain);
    gainNode4.connect(gainNode5);
    gainNode5.connect(audioCtx2.destination);

    offsetNode3 = audioCtx2.createConstantSource();
    offsetNode3.offset.value = 1;

    gainNode5.connect(offsetNode3);

    offsetNode3.connect(audioCtx2.destination);

    console.log("Audio worklet processor registered");



    })
    .catch(console.error);
}


function createFlappingWaveshaperNode(width, ripple, noiseAmount) {
    const waveshaperNode = audioCtx2.createWaveShaper();
    const sampleRate = audioCtx2.sampleRate;
    const bufferLength = 4096;
    const buffer = new Float32Array(bufferLength);

    for (let i = 0; i < bufferLength; i++) {
        const x = (i - bufferLength / 2) / bufferLength;
        
        // Simulate irregular, non-sinusoidal waveform resembling dog's bark
        let pulse = Math.sin(Math.PI * x * 10) + 0.5 * Math.sin(Math.PI * x * 20); // Adjust frequency and amplitude as needed
        
        // Apply modulation to shape the waveform
        const modulator = Math.cos(ripple * x) + 1; // Modulation function
        
        // Apply width to control pulse width
        pulse *= modulator * width;
        
        // Add noise modulation to introduce randomness
        let noise = 0;
        for (let j = 0; j < 10; j++) { // Increase the number of iterations for more noise
            noise += (Math.random() * 2 - 1);
        }
        noise *= noiseAmount;
        
        // Combine pulse and noise
        buffer[i] = pulse + noise;
    }

    // Apply the generated buffer as the waveshaper curve
    waveshaperNode.curve = buffer;

    return waveshaperNode;
    
    
}
function initBark() {
    // var resonance = 1.5;
    // var baseFrequency = 50;
    // var separation = 20;
    // var numbpFilters = 5;
    var resonance = 10;
    var baseFrequency = 500;
    var separation = 30;
    var numbpFilters = 14;

    // // Create brown noise as input
    // const bufferSize = 10 * audioCtx2.sampleRate;
    // const noiseBuffer = audioCtx2.createBuffer(
    // 1,
    // bufferSize,
    // audioCtx2.sampleRate
    // );
    // const output = noiseBuffer.getChannelData(0);
    // let lastOut = 0;
    // for (let i = 0; i < bufferSize; i++) {
    // const brown = Math.random() * 2 - 1;
    // output[i] = (lastOut + 0.02 * brown) / 1.02;
    // lastOut = output[i];
    // output[i] *= 3.5;
    // }

    // brownNoise = audioCtx2.createBufferSource();
    // brownNoise.buffer = noiseBuffer;
    // brownNoise.loop = true;

    // brownNoise.start();

    // Create white noise as input
const bufferSize = 10 * audioCtx2.sampleRate;
const noiseBuffer = audioCtx2.createBuffer(
  1,
  bufferSize,
  audioCtx2.sampleRate
);
const output = noiseBuffer.getChannelData(0);
for (let i = 0; i < bufferSize; i++) {
  output[i] = Math.random() * 2 - 1; // White noise
}

whiteNoise = audioCtx2.createBufferSource();
whiteNoise.buffer = noiseBuffer;
whiteNoise.loop = true;

whiteNoise.start();

    // bnFilter = audioCtx2.createBiquadFilter();
    // bnFilter.type = "lowpass";
    // bnFilter.frequency.value = 2000;
    // bnFilter.Q.value = 1;
    
    // whiteNoise.connect(bnFilter);

    // bnFilter2 = audioCtx2.createBiquadFilter();
    // bnFilter2.type = "lowpass";
    // bnFilter2.frequency.value = 500;
    // bnFilter2.Q.value = 3;

    //bnFilter.connect(bnFilter2);

    bnGain = audioCtx2.createGain(); //input to vocal tract
    bnGain.gain.value =  0.6;    
    whiteNoise.connect(bnGain);

    // added code: 

    // // Create flapping waveshaper node
    // const flappingWaveshaperNode = createFlappingWaveshaperNode(80, 80, 50);

    // const oscillator = audioCtx2.createOscillator();
    // oscillator.type = "sawtooth";
    // oscillator.frequency.value = 40;
    // oscillator.start();
    // oscillator.connect(flappingWaveshaperNode);
    

    // bnGain.gain.value = 0.5;
    // flappingWaveshaperNode.connect(bnGain);
    // flappingWaveshaperNode2.connect(bnGain);
    // flappingWaveshaperNode3.connect(bnGain);
    // flappingWaveshaperNode4.connect(bnGain);

    // Create bandpass filters as vocal tracts
    bpFilters = [];
    bpFilterGain = audioCtx2.createGain(); //output of vocal tract
    bpFilterGain.gain.value = 0.7;
    var prev = baseFrequency;
    for (let i = 0; i < numbpFilters; i++) {
        //create bp filter
        const bpFilter = audioCtx2.createBiquadFilter();
        bpFilter.type = "bandpass";
        bpFilter.frequency.value = prev + 1.414 ** i * separation;
        bpFilter.Q.value = resonance;
        bpFilters.push(bpFilter);

        prev = bpFilter.frequency.value;

        //connect bp filter
        bnGain.connect(bpFilter);
        bpFilter.connect(bpFilterGain);
    }

    //create envelope
    //create low pass filter
    const lpFilter = audioCtx2.createBiquadFilter();
    lpFilter.type = "highpass";
    lpFilter.frequency.value = 600;
    lpFilter.Q.value = 5;
    bpFilterGain.connect(lpFilter);

    const lpFilter2 = audioCtx2.createBiquadFilter();
    lpFilter2.type = "lowpass";
    lpFilter2.frequency.value = 600;
    lpFilter2.Q.value = 1;
    lpFilter.connect(lpFilter2);

    const lpFilter3 = audioCtx2.createBiquadFilter();
    lpFilter3.type = "lowpass";
    lpFilter3.frequency.value = 700;
    lpFilter3.Q.value = 1;
    lpFilter.connect(lpFilter3);

    const lpFilter4 = audioCtx2.createBiquadFilter();
    lpFilter4.type = "lowpass";
    lpFilter4.frequency.value = 1100;
    lpFilter4.Q.value = 1;
    lpFilter.connect(lpFilter4);

    gainNodeFinal = audioCtx2.createGain();
    gainNodeFinal.gain.value = 2;
    lpFilter2.connect(gainNodeFinal);
    lpFilter3.connect(gainNodeFinal);
    lpFilter4.connect(gainNodeFinal);

    const bandpassFilter = audioCtx2.createBiquadFilter();
    bandpassFilter.type = "peaking";
    bandpassFilter.frequency.value = 400;
    bandpassFilter.Q.value = 1;
    //gainNodeFinal.connect(bandpassFilter);
    lpFilter2.connect(bandpassFilter);
    lpFilter3.connect(bandpassFilter);
    lpFilter4.connect(bandpassFilter);

    beginTime = audioCtx2.currentTime;
    gainNodeFinal.gain.exponentialRampToValueAtTime(0.5, beginTime + 0.06);
    // gainNodeFinal.gain.exponentialRampToValueAtTime(2.5, beginTime + 0.4);

    // gainNodeFinal.gain.exponentialRampToValueAtTime(2, beginTime + 0.8);
    gainNodeFinal.gain.exponentialRampToValueAtTime(0.1, beginTime + 0.1001);
    
    gainNodeFinal.gain.linearRampToValueAtTime(0, beginTime + 0.11);
    gainNodeFinal.connect(audioCtx2.destination);

    //second envelope
    const bpFilterGain2 = audioCtx2.createGain();
    bpFilterGain2.gain.value = 0;
    bandpassFilter.connect(bpFilterGain2);
    bpFilterGain2.connect(audioCtx2.destination);
    bpFilterGain2.gain.exponentialRampToValueAtTime(1, beginTime + 0.06);
    bpFilterGain2.gain.exponentialRampToValueAtTime(0.8, beginTime + 0.1);
    bpFilterGain2.gain.setValueAtTime(0.1, beginTime + 0.1001);
    bpFilterGain2.gain.linearRampToValueAtTime(0, beginTime + 0.11);

}   