import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

const LiveCodeEditor = ({ onParse }) => {
    const [script, setScript] = useState(`Object1:cube{\n  rotation.z(0,90)<>lowPower(10,100)\n}`);

    const handleParseScript = () => {
        onParse(script);  // Pass the script text to ParseScriptComponent
    };

    return (
        <div style={{ width: '80%', margin: '20px auto' }}>
            <h3>Live Code Editor</h3>

            <MonacoEditor
                height="300px"
                language="javascript"
                theme="vs-dark"
                value={script}
                onChange={(value) => setScript(value)}
                options={{ automaticLayout: true }}
            />

            {/* Parse Script Button */}
            <button onClick={handleParseScript} style={{ marginTop: '10px' }}>
                Parse Script
            </button>
        </div>
    );
};

export default LiveCodeEditor;
