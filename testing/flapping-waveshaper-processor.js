
class FlappingWaveshaperNode extends AudioWorkletNode {
    constructor(context, options) {
      super(context, 'flapping-waveshaper-processor', options);
    }
  }
  
  class FlappingWaveshaperProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
      return [
        { name: 'width', defaultValue: 0.5 },
        { name: 'ripple', defaultValue: 0.5 },
        { name: 'noiseMix', defaultValue: 0.5 }
      ];
    }
  
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];
      const width = parameters.width[0];
      const ripple = parameters.ripple[0];
      const noiseMix = parameters.noiseMix[0];
  
      for (let channel = 0; channel < output.length; ++channel) {
        const inputChannel = input[channel];
        const outputChannel = output[channel];
  
        for (let i = 0; i < inputChannel.length; ++i) {
          // Apply waveshaping function
          const x = inputChannel[i];
          let y = Math.cos(Math.PI * width * x) / (1 + ripple * x);
          y *= Math.cos(Math.PI * ripple * x + Math.PI / 2); // Additional cosine function
  
          // Apply noise modulation
          const noise = Math.random() * 2 - 1;
          y = (1 - noiseMix) * y + noiseMix * (y + noise);
  
          outputChannel[i] = y;
        }
      }
  
      return true; // Keep the processor alive
    }
  }
  registerProcessor('flapping-waveshaper-processor', FlappingWaveshaperProcessor);