import React, { useState } from 'react';
import audioHandler from '../../utils/AudioHandler';

const LoadAudioDevices = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const loadDevices = async () => {
    try {
      // Request access to the microphone
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Enumerate the devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audioinput');

      setDevices(audioDevices);
      if (audioDevices.length > 0) {
        setSelectedDeviceId(audioDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  };

  const handleDeviceSelection = (e) => {
    setSelectedDeviceId(e.target.value);
  };

  const handleStartAudio = () => {
    if (selectedDeviceId) {
      audioHandler.startProcessing(selectedDeviceId);
    } else {
      console.error('No audio device selected');
    }
  };

  return (
    <div>
      <h2>Load Audio Devices</h2>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={loadDevices}>Load Devices</button>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <select onChange={handleDeviceSelection} value={selectedDeviceId || ''}>
          <option value="">Select an audio input device</option>
          {devices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Device ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleStartAudio} disabled={!selectedDeviceId}>
        Start Audio Capture
      </button>
    </div>
  );
};

export default LoadAudioDevices;
