import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

const LiveCodeEditor = ({ onParse }) => {
    const [script, setScript] = useState(`[
    {
        "name": "Object1",
        "geometry": "cube",
        "position": [-4,0,0],
        "scale": [3,0.5,1],
        "mappings": [
            {
                "target": "rotation.z",
                "range": [0, 3.14],
                "audioProperty": "lowPower",
                "audioRange": [10, 150]
            }
        ]
    },
    {
        "name": "Object2",
        "geometry": "cube",
        "color": "0xff00ff",
        "position": [0, 0, 0],
        "mappings": [
            {
                "target": "position.y",
                "range": [0, 10],
                "audioProperty": "midPower",
                "audioRange": [0, 150]
            }
        ]
    },
    {
        "name": "Object3",
        "geometry": "cube",
        "position": [4, 0, 0],
        "color": "0x00ffff",
        "mappings": [
            {
                "target": "scale.y",
                "range": [0.5, 5],
                "audioProperty": "highPower",
                "audioRange": [0, 50]
            }
        ]
    }
]`);


    const handleParseScript = () => {
        onParse(script); // Pass the script text to ParseScriptComponent
    };

    return (
        <div style={{ width: '80%', margin: '20px auto' }}>
            <h3>Live Code Editor</h3>

            <MonacoEditor
                height="300px"
                language="json"
                theme="vs-dark"
                value={script}
                onChange={(value) => setScript(value)}
                options={{ automaticLayout: true }}
            />

            <button onClick={handleParseScript} style={{ marginTop: '10px' }}>
                Parse Script
            </button>
        </div>
    );
};

export default LiveCodeEditor;
