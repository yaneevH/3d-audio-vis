import React, { useState } from 'react';
import './App.css';
import LoadAudioDevices from './components/AudioControl/LoadAudioDevices';
import LiveCodeEditor from './components/Editor/LiveCodeEditor';
import AudioVisualization from './components/AudioVisualization';
import ThreeJSScene from './components/ThreeJS/ThreeJSScene';
import ParseScriptComponent from './components/Editor/ParseScriptComponent';

function App() {
    const [isAudioActive, setIsAudioActive] = useState(false);  // Audio capture status
    const [parsedScript, setParsedScript] = useState('');       // Script text from LiveCodeEditor
    const [parsedObjects, setParsedObjects] = useState([]);     // Parsed objects for Three.js

    const handleAudioStart = () => setIsAudioActive(true);

    const handleParseScript = (script) => setParsedScript(script);

    const handlePushToScene = (objects) => setParsedObjects(objects);

    return (
        <div className="App">
            <header className="App-header">
                <h1>3D DJ Audio Visualizer</h1>

                <LoadAudioDevices onAudioStart={handleAudioStart} />
                <AudioVisualization />

                <LiveCodeEditor onParse={handleParseScript} />

                <ParseScriptComponent
                    script={parsedScript}
                    onPushToScene={handlePushToScene}
                />

                <h3 style={{ textAlign: 'center', margin: '20px 0' }}>Three.js Scene</h3>
                <ThreeJSScene
                    isAudioActive={isAudioActive}
                    parsedObjects={parsedObjects}
                />
            </header>
        </div>
    );
}

export default App;
