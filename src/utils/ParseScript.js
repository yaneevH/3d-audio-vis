import * as THREE from 'three';
import audioHandler from './AudioHandler';

function parseScriptAndUpdateObjects(script) {
    const objects = [];

    // Ensure the script exists and is a valid string
    if (!script || typeof script !== 'string') {
        throw new Error("Invalid script provided");
    }

    try {
        const lines = script.trim().split('\n');
        let currentObject = null;

        lines.forEach(line => {
            line = line.trim();

            // Ignore empty lines
            if (line === '') return;

            // Detect the start of a new object, e.g., "Object1:cube {"
            if (line.includes(':') && line.includes('{')) {
                const [objectName, objectType] = line.split(':').map(part => part.trim());
                if (!objectType.startsWith('cube')) {
                    throw new Error(`Unsupported object type: ${objectType}`);
                }

                // Initialize a new object with default cube properties
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

            // End of object block, add it to objects array
            if (line === '}') {
                if (currentObject) {
                    objects.push(currentObject);
                    currentObject = null;
                }
                return;
            }

            // Process property mappings if inside an object block
            if (currentObject) {
                const [propName, audioMapping] = line.split('<>');
                if (!propName || !audioMapping) {
                    throw new Error(`Invalid property mapping in line: ${line}`);
                }

                // Extract the property details and range mappings
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
        console.error(`Error parsing script: ${err.message}`);
        throw new Error(`Error parsing script: ${err.message}`);
    }

    return objects; // Return parsed objects with mappings
}

export default parseScriptAndUpdateObjects;
