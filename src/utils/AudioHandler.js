import * as Tone from 'tone';

class AudioHandler {
  constructor() {
    this.analyser = null;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.stream = null;
    this.scriptProcessor = null;
    this.dataArray = null;
    this.isProcessing = false;
    this.listeners = [];
  }

  async startProcessing(deviceId) {
    try {
      console.log(`Starting audio processing for device: ${deviceId}`);

      // Check if AudioContext is in suspended state (not started)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();  // Resume AudioContext after user gesture
        console.log('AudioContext resumed');
      }

      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        console.log('Stopped existing audio stream');
      }

      // Define constraints with echo cancellation, noise suppression, and sample rate
      const constraints = {
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      };

      // Get access to the selected audio input
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Microphone or audio stream access granted:', this.stream);

      // Log stream information for debugging
      console.log('Stream tracks:', this.stream.getTracks());

      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024; // Smaller fftSize for better temporal resolution
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      console.log('Audio source created, connecting to analyser and script processor');

      // Create a ScriptProcessorNode to handle real-time audio processing
      this.scriptProcessor = this.audioContext.createScriptProcessor(512, 1, 1);
      this.scriptProcessor.connect(this.audioContext.destination);
      source.connect(this.analyser);
      source.connect(this.scriptProcessor);

      console.log('Audio source and analyser nodes connected successfully');

      this.scriptProcessor.onaudioprocess = this.processAudio.bind(this);
      this.isProcessing = true;

      // Log when audio is actively processing
      console.log('Audio processing has started...');
      
    } catch (err) {
      console.error('Error accessing or playing audio stream:', err);
    }
  }

  processAudio(event) {
    if (!this.analyser || !this.isProcessing) return;

    // Log that audio is being processed in real time
    //console.log('Processing audio in real-time...');

    // Get frequency data from analyser
    this.analyser.getByteFrequencyData(this.dataArray);
    //console.log('Captured frequency data:', this.dataArray);  // Log frequency data for debugging

    // Capture the actual raw audio data from the audio buffer
    const inputBuffer = event.inputBuffer;
    const rawAudioData = inputBuffer.getChannelData(0);  // Get audio data from the first channel
    //console.log('Raw audio data (first 10 samples):', rawAudioData.slice(0, 10));  // Log only the first 10 samples

    // Calculate average volume
    const sum = this.dataArray.reduce((a, b) => a + b, 0);
    const averageVolume = sum / this.dataArray.length;
    //console.log('Average volume:', averageVolume);

    // Calculate power of low, mid, and high frequencies
    const lowEnd = this.dataArray.slice(0, this.dataArray.length / 3);
    const midEnd = this.dataArray.slice(this.dataArray.length / 3, 2 * this.dataArray.length / 3);
    const highEnd = this.dataArray.slice(2 * this.dataArray.length / 3);

    const lowPower = lowEnd.reduce((a, b) => a + b, 0) / lowEnd.length;
    const midPower = midEnd.reduce((a, b) => a + b, 0) / midEnd.length;
    const highPower = highEnd.reduce((a, b) => a + b, 0) / highEnd.length;

    // Log the frequency band power levels for debugging
    //console.log(`Low Power: ${lowPower}, Mid Power: ${midPower}, High Power: ${highPower}`);

    // Notify listeners with the new data
    this.notifyListeners({
      averageVolume,
      lowPower,
      midPower,
      highPower,
    });
  }

  stopProcessing() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      console.log('Audio processing stopped and stream tracks ended');
    }
    this.isProcessing = false;
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  notifyListeners(data) {
    this.listeners.forEach(listener => listener(data));
  }
}

const audioHandler = new AudioHandler();
export default audioHandler;
    