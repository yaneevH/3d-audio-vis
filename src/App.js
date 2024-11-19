import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import LoadAudioDevices from './components/AudioControl/LoadAudioDevices';
import LiveCodeEditor from './components/Editor/LiveCodeEditor';
import AudioVisualization from './components/AudioVisualization';
import ThreeJSScene from './components/ThreeJS/ThreeJSScene';
import ParseScriptComponent from './components/Editor/ParseScriptComponent';

function App() {
    const [isAudioActive, setIsAudioActive] = useState(false);    // Audio capture status
    const [parsedScript, setParsedScript] = useState('');         // Script text from LiveCodeEditor
    const [parsedObjects, setParsedObjects] = useState([]);       // Parsed objects for Three.js
    const sceneWindowRef = useRef(null);                          // Reference to the new window
    const sceneRootRef = useRef(null);                            // Reference to the root for rendering

    const handleAudioStart = () => setIsAudioActive(true);

    // Handle receiving the script from LiveCodeEditor
    const handleParseScript = (script) => {
        console.log('Script received from LiveCodeEditor:', script); // Debugging
        setParsedScript(script); // Pass the script to ParseScriptComponent
    };

    const handlePushToScene = (objects) => {
        console.log('Pushing objects to scene:', objects); // Debugging
        setParsedObjects(objects);

        // Open a new window for the ThreeJSScene if not already open
        if (!sceneWindowRef.current || sceneWindowRef.current.closed) {
            console.log("Creating new window for ThreeJSScene...");

            // Open a new window at half the screen dimensions
            sceneWindowRef.current = window.open(
                '',
                '_blank',
                `width=${window.screen.width / 2},height=${window.screen.height / 2},left=0,top=0`
            );

            // Create a container div for React rendering
            const container = sceneWindowRef.current.document.createElement('div');
            container.style.width = '100%';
            container.style.height = '100%';
            sceneWindowRef.current.document.body.style.margin = '0';
            sceneWindowRef.current.document.body.style.overflow = 'hidden';
            sceneWindowRef.current.document.body.appendChild(container);

            // Initialize a new root for the new window
            sceneRootRef.current = ReactDOM.createRoot(container);

            // Set the title of the new window
            sceneWindowRef.current.document.title = '3D Scene Preview';

            // Ensure the window reference is reset when the window is closed
            sceneWindowRef.current.onbeforeunload = () => {
                console.log("Window closed. Cleaning up...");
                sceneWindowRef.current = null;
                sceneRootRef.current = null;
            };
        }

        // Render the ThreeJSScene
        if (sceneRootRef.current) {
            console.log("Rendering ThreeJSScene...");
            sceneRootRef.current.render(
                <ThreeJSScene
                    isAudioActive={isAudioActive}
                    parsedObjects={objects}
                    sceneWindow={sceneWindowRef.current} // Pass the window reference
                />
            );
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>3D DJ Audio Visualizer</h1>

                {/* Audio Device Loader */}
                <LoadAudioDevices onAudioStart={handleAudioStart} />

                {/* Audio Visualization */}
                <AudioVisualization />

                {/* Live Code Editor */}
                <LiveCodeEditor onParse={handleParseScript} />

                {/* Parse Script Component */}
                <ParseScriptComponent
                    script={parsedScript} // Pass script from LiveCodeEditor
                    onPushToScene={handlePushToScene} // Push parsed objects to ThreeJSScene
                />
            </header>
        </div>
    );
}

export default App;
