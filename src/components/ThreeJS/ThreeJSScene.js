import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import audioHandler from '../../utils/AudioHandler';

const ThreeJSScene = ({ parsedObjects }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);

    const [audioData, setAudioData] = useState({
        lowPower: 0,
        midPower: 0,
        highPower: 0,
        averageVolume: 0,
    });

    const audioDataRef = useRef(audioData);
    audioDataRef.current = audioData;

    // Listen to audio data updates
    useEffect(() => {
        const handleAudioData = (data) => setAudioData(data);

        audioHandler.addListener(handleAudioData);
        return () => audioHandler.removeListener(handleAudioData);
    }, []);

    // Initialize and re-create scene based on parsedObjects
    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.dispose();
            sceneRef.current = null;
            rendererRef.current = null;
        }

        // Create a new scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create and set up the camera
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 10;
        cameraRef.current = camera;

        // Create and set up the renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Handle resizing
        const handleResize = () => {
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        // Create objects based on parsedObjects array
        if (Array.isArray(parsedObjects) && parsedObjects.length > 0) {
            parsedObjects.forEach((obj) => {
                const mesh = new THREE.Mesh(obj.geometry, obj.material);
                mesh.position.set(...obj.position);
                mesh.rotation.set(...obj.rotation);
                mesh.scale.set(...obj.scale);
                mesh.name = obj.name;

                // Store mappings for dynamic updates
                mesh.userData.mappings = obj.mappings;

                scene.add(mesh);
            });
        }

        // Animation loop with dynamic audio-based updates
        const animate = () => {
            requestAnimationFrame(animate);

            scene.children.forEach((child) => {
                const mappings = child.userData.mappings || [];
                mappings.forEach(({ property, minRange, maxRange, audioProperty, audioMin, audioMax }) => {
                    const audioValue = audioDataRef.current[audioProperty];
                    if (audioValue !== undefined) {
                        const mappedValue = THREE.MathUtils.mapLinear(audioValue, audioMin, audioMax, minRange, maxRange);

                        // Apply mapped value to the object
                        if (property.includes('position')) {
                            const axis = property.split('.')[1];
                            child.position[axis] = mappedValue;
                        } else if (property.includes('rotation')) {
                            const axis = property.split('.')[1];
                            child.rotation[axis] = mappedValue;
                        } else if (property.includes('scale')) {
                            const axis = property.split('.')[1];
                            child.scale[axis] = mappedValue;
                        }
                    }
                });
            });

            renderer.render(scene, camera);
        };
        animate();

        // Cleanup when component unmounts or parsedObjects changes
        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            rendererRef.current = null;
            sceneRef.current = null;
        };
    }, [parsedObjects]);

    return (
        <div ref={mountRef} style={{ width: '100%', height: '500px', backgroundColor: 'black' }}>
            <h3 style={{ textAlign: 'center', color: 'white', marginBottom: '10px' }}>Three.js Scene</h3>
        </div>
    );
};

export default ThreeJSScene;
