import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

const ParseScriptComponent = ({ script, onPushToScene }) => {
    const [log, setLog] = useState(''); // Log output for the component
    const [parsedObjects, setParsedObjects] = useState([]); // Parsed Three.js objects
    const [isPushEnabled, setIsPushEnabled] = useState(false); // Control the push button

    // Function to process and parse the script into objects
    const parseScript = (script) => {
        const objects = [];
        try {
            const jsonData = JSON.parse(script); // Assuming the input is JSON
            jsonData.forEach((objDef) => {
                const geometry = getGeometry(objDef.geometry || 'cube');
                const material = new THREE.MeshBasicMaterial({
                    color: typeof objDef.color === 'string' ? parseInt(objDef.color, 16) : objDef.color || 0x00ff00,
                });

                const object = {
                    name: objDef.name,
                    geometry,
                    material,
                    position: objDef.position || [0, 0, 0],
                    rotation: objDef.rotation || [0, 0, 0],
                    scale: objDef.scale || [1, 1, 1],
                    mappings: objDef.mappings || [],
                    layer: objDef.layer !== undefined ? objDef.layer : null, // Optional layer
                };

                objects.push(object);
            });
        } catch (err) {
            throw new Error(`Error parsing script: ${err.message}`);
        }
        return objects;
    };

    // Helper function to create geometry based on type
    const getGeometry = (type) => {
        switch (type) {
            case 'cube':
                return new THREE.BoxGeometry(1, 1, 1);
            case 'sphere':
                return new THREE.SphereGeometry(0.5, 32, 32);
            default:
                return new THREE.BoxGeometry(1, 1, 1); // Default to cube
        }
    };

    // When the script changes, parse and validate it
    useEffect(() => {
        if (script) {
            try {
                const parsedObjects = parseScript(script);
                setParsedObjects(parsedObjects);
                setLog(JSON.stringify(parsedObjects, null, 2)); // Display parsed objects as JSON
                setIsPushEnabled(true);

                console.log('Script successfully parsed:', parsedObjects); // Console log for debugging
            } catch (error) {
                setLog(`Error: ${error.message}`);
                setIsPushEnabled(false);
            }
        }
    }, [script]);

    // Push parsed objects to the scene
    const handlePushObjects = () => {
        console.log('Pushing objects to scene:', parsedObjects);
        onPushToScene(parsedObjects);
    };

    return (
        <div style={{ width: '80%', margin: '20px auto', textAlign: 'left' }}>
            <h3 style={{ textAlign: 'center' }}>Parse Script Component</h3>

            {/* Log box */}
            <div
                style={{
                    backgroundColor: '#000',
                    color: '#fff',
                    padding: '10px',
                    fontSize: '10px',
                    maxHeight: '150px', // Approx. 10 lines
                    overflowY: 'scroll',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.2em',
                }}
            >
                {log}
            </div>

            {/* Push button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <button onClick={handlePushObjects} disabled={!isPushEnabled}>
                    Push Objects to Scene
                </button>
            </div>
        </div>
    );
};

export default ParseScriptComponent;
