import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import parseScriptAndUpdateObjects from '../../utils/ParseScript';

const LiveCodeEditor = ({ onParse }) => {
    const [script, setScript] = useState(`Object1:cube{\n  rotation.z(0,90)<>lowPower(10,100)\n}`);
    const [error, setError] = useState(null);

    // AudioHandler properties (for dropdown)
    const audioProperties = ['averageVolume', 'lowPower', 'midPower', 'highPower'];

    // Three.js object properties (for dropdown)
    const objectProperties = [
        'position.x', 'position.y', 'position.z',
        'rotation.x', 'rotation.y', 'rotation.z',
        'scale.x', 'scale.y', 'scale.z'
    ];

    const handleParseScript = () => {
        try {
            const updatedObjects = parseScriptAndUpdateObjects(script);
            onParse(updatedObjects);  // Pass the parsed objects back
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ width: '80%', margin: '20px auto' }}>
            <h3>Live Code Editor</h3>

            {/* Dropdowns for Audio and Three.js object properties */}
            <div style={{ marginBottom: '10px' }}>
                <label>Audio Properties:</label>
                <select>
                    {audioProperties.map((prop, index) => (
                        <option key={index} value={prop}>
                            {prop}
                        </option>
                    ))}
                </select>

                <label style={{ marginLeft: '20px' }}>Object Properties:</label>
                <select>
                    {objectProperties.map((prop, index) => (
                        <option key={index} value={prop}>
                            {prop}
                        </option>
                    ))}
                </select>
            </div>

            {/* Monaco editor for script */}
            <MonacoEditor
                height="300px"
                language="javascript"
                theme="vs-dark"
                value={script}
                onChange={(value) => setScript(value)}
                options={{ automaticLayout: true }}
            />

            {/* Button to parse the script */}
            <button onClick={handleParseScript} style={{ marginTop: '10px' }}>
                Parse Script
            </button>

            {/* Display error message if parsing fails */}
            {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        </div>
    );
};

export default LiveCodeEditor;
