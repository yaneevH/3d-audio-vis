import React, { useEffect, useState } from 'react';
import audioHandler from '../utils/AudioHandler';

const AudioVisualization = () => {
  const [audioData, setAudioData] = useState({
    averageVolume: 0,
    lowPower: 0,
    midPower: 0,
    highPower: 0,
  });

  useEffect(() => {
    // Subscribe to audioHandler data updates
    const handleAudioData = (data) => {
      setAudioData(data);
    };

    audioHandler.addListener(handleAudioData);

    return () => {
      // Unsubscribe when component unmounts
      audioHandler.removeListener(handleAudioData);
    };
  }, []);

  // Round the values to the nearest integer
  const roundedAverage = Math.round(audioData.averageVolume);
  const roundedLow = Math.round(audioData.lowPower);
  const roundedMid = Math.round(audioData.midPower);
  const roundedHigh = Math.round(audioData.highPower);

  // Limit the height of the bars to 100px maximum
  const maxBarHeight = 100;

  return (
    <div>
      <h3>Audio Visualization</h3>

      {/* Bar graph with fixed height and scaling */}
      <div style={{ display: 'flex', alignItems: 'flex-end', height: `${maxBarHeight}px`, marginBottom: '20px' }}>
        <div
          style={{
            height: `${(roundedAverage / 100) * maxBarHeight}px`,
            background: 'purple',
            width: '100px',
            marginRight: '10px',
          }}
        />
        <div
          style={{
            height: `${(roundedLow / 100) * maxBarHeight}px`,
            background: 'blue',
            width: '100px',
            marginRight: '10px',
          }}
        />
        <div
          style={{
            height: `${(roundedMid / 100) * maxBarHeight}px`,
            background: 'green',
            width: '100px',
            marginRight: '10px',
          }}
        />
        <div
          style={{
            height: `${(roundedHigh / 100) * maxBarHeight}px`,
            background: 'red',
            width: '100px',
            marginRight: '10px',
          }}
        />
      </div>

      {/* Power values in confined boxes with smaller font and word wrap */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '100px', fontSize: '0.8rem', wordWrap: 'break-word', textAlign: 'center' }}>
          <span>Average Volume: {roundedAverage}</span>
        </div>
        <div style={{ width: '100px', fontSize: '0.8rem', wordWrap: 'break-word', textAlign: 'center' }}>
          <span>Low Power: {roundedLow}</span>
        </div>
        <div style={{ width: '100px', fontSize: '0.8rem', wordWrap: 'break-word', textAlign: 'center' }}>
          <span>Mid Power: {roundedMid}</span>
        </div>
        <div style={{ width: '100px', fontSize: '0.8rem', wordWrap: 'break-word', textAlign: 'center' }}>
          <span>High Power: {roundedHigh}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioVisualization;
