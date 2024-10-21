import React from 'react';
import './App.css';
import LoadAudioDevices from './components/AudioControl/LoadAudioDevices';
import LiveCodeEditor from './components/Editor/LiveCodeEditor';
import AudioVisualization from './components/AudioVisualization';
import ThreeJSScene from './components/ThreeJS/ThreeJSScene';

function App() {
    const [isAudioActive, setIsAudioActive] = React.useState(false);  // Audio capture status
    const [objects, setObjects] = React.useState([]);  // Parsed objects for Three.js

    const handleAudioStart = () => {
        setIsAudioActive(true);  // Trigger audio start
    };

    const handleParse = (parsedObjects) => {
        setObjects(parsedObjects);  // Update objects for ThreeJSScene
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>3D DJ Audio Visualizer</h1>

                {/* Load audio devices */}
                <LoadAudioDevices onAudioStart={handleAudioStart} />

                {/* Audio Visualization */}
                <AudioVisualization />

                {/* Live code editor */}
                <LiveCodeEditor onParse={handleParse} />

                {/* Three.js scene */}
                <ThreeJSScene isAudioActive={isAudioActive} objects={objects} />
            </header>
        </div>
    );
}

export default App;
