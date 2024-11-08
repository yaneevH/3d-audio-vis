import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

function parseScript(script) {
    const objects = [];
    try {
        const lines = script.trim().split('\n');
        let currentObject = null;

        lines.forEach(line => {
            line = line.trim();
            if (line === '') return;

            if (line.includes(':') && line.includes('{')) {
                const [objectName, objectType] = line.split(':').map(part => part.trim());
                if (!objectType.startsWith('cube')) {
                    throw new Error(`Unsupported object type: ${objectType}`);
                }

                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                currentObject = {
                    name: objectName,
                    geometry,
                    material,
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1],
                    mappings: []
                };
                return;
            }

            if (line === '}') {
                if (currentObject) {
                    objects.push(currentObject);
                    currentObject = null;
                }
                return;
            }

            if (currentObject) {
                const [propName, audioMapping] = line.split('<>');
                if (!propName || !audioMapping) {
                    throw new Error(`Invalid property mapping in line: ${line}`);
                }

                const [property, range] = propName.split('(');
                const [minRange, maxRange] = range.replace(')', '').split(',').map(Number);
                const [audioProperty, audioRange] = audioMapping.split('(');
                const [audioMin, audioMax] = audioRange.replace(')', '').split(',').map(Number);

                currentObject.mappings.push({
                    property: property.trim(),
                    minRange,
                    maxRange,
                    audioProperty: audioProperty.trim(),
                    audioMin,
                    audioMax
                });
            }
        });
    } catch (err) {
        throw new Error(`Error parsing script: ${err.message}`);
    }

    return objects;
}

const ParseScriptComponent = ({ script, onPushToScene }) => {
    const [log, setLog] = useState('');
    const [objects, setObjects] = useState([]);
    const [isPushEnabled, setIsPushEnabled] = useState(false);

    useEffect(() => {
        if (script) {
            try {
                const parsedObjects = parseScript(script);
                setObjects(parsedObjects);
                setLog(JSON.stringify(parsedObjects, null, 2));  // Show parsed objects as JSON
                setIsPushEnabled(true);

                console.dir(parsedObjects);  // Log for interactive inspection
            } catch (error) {
                setLog(`Error: ${error.message}`);
                setIsPushEnabled(false);
            }
        }
    }, [script]);

    const handlePushObjects = () => {
        console.log('Pushing objects to scene:', objects);
        onPushToScene(objects); // Pass parsed objects to parent for scene update
    };

    return (
        <div style={{ width: '80%', margin: '20px auto', textAlign: 'left' }}>
            <h3 style={{ textAlign: 'center' }}>Parse Script Component</h3>

            <div
                style={{
                    backgroundColor: '#000',
                    color: '#fff',
                    padding: '10px',
                    fontSize: '10px',
                    maxHeight: '150px',  // Approx. 10 lines
                    overflowY: 'scroll',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.2em',
                }}
            >
                {log}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <button onClick={handlePushObjects} disabled={!isPushEnabled}>
                    Push Objects to Scene
                </button>
            </div>
        </div>
    );
};

export default ParseScriptComponent;
