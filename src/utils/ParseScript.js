import * as THREE from 'three';
import audioHandler from './AudioHandler';  // To access live audio data

function parseScriptAndUpdateObjects(script) {
    const objects = [];

    // Ensure the script exists and is a valid string
    if (!script || typeof script !== 'string') {
        throw new Error("Invalid script provided");
    }

    try {
        const lines = script.trim().split('\n');

        lines.forEach(line => {
            // Check for object creation (e.g., Object1:cube)
            const [objectName, objectType] = line.split(':');
            if (objectType && objectType.startsWith('cube')) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);  // Default cube geometry
                const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const position = [0, 0, 0];  // Default position
                const rotation = [0, 0, 0];  // Default rotation
                const scale = [1, 1, 1];  // Default scale

                // Object that will store mappings for dynamic updates
                const objectData = {
                    name: objectName,
                    geometry,
                    material,
                    position,
                    rotation,
                    scale,
                    mappings: [],  // This will store mappings of properties like rotation.z<>lowPower
                };

                // Find the properties block between curly braces
                const propertiesBlock = line.split('{')[1]?.split('}')[0]?.trim();
                if (propertiesBlock) {
                    const properties = propertiesBlock.split('\n').map(prop => prop.trim());

                    properties.forEach(prop => {
                        const [propName, audioMapping] = prop.split('<>');
                        if (!propName || !audioMapping) {
                            throw new Error(`Invalid property mapping in line: ${prop}`);
                        }

                        // Extract the property details and range mappings
                        const [property, range] = propName.split('(');
                        const [minRange, maxRange] = range.replace(')', '').split(',').map(Number);
                        const [audioProperty, audioRange] = audioMapping.split('(');
                        const [audioMin, audioMax] = audioRange.replace(')', '').split(',').map(Number);

                        // Store the mapping to dynamically update in the animation loop
                        objectData.mappings.push({
                            property,
                            minRange,
                            maxRange,
                            audioProperty,
                            audioMin,
                            audioMax
                        });
                    });
                }

                // Push the object into the scene with default properties and mappings
                objects.push(objectData);
            }
        });
    } catch (err) {
        console.error(`Error parsing script: ${err.message}`);
        throw new Error(`Error parsing script: ${err.message}`);
    }

    return objects;  // Return parsed objects and their mappings for dynamic updates
}

export default parseScriptAndUpdateObjects;
