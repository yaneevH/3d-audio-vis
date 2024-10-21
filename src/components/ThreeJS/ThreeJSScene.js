import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import audioHandler from '../../utils/AudioHandler'; // Assuming audioHandler provides live audio data

const ThreeJSScene = ({ objects, isAudioActive }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);

    // Listen to audioHandler updates and update the scene accordingly
    useEffect(() => {
        const handleAudioData = (data) => {
            // You could set audioData in state if needed, or directly modify objects in the scene
        };

        if (isAudioActive) {
            console.log("Starting audio capture...");
            audioHandler.addListener(handleAudioData);
        }

        return () => {
            if (isAudioActive) {
                audioHandler.removeListener(handleAudioData);
                console.log("Stopped audio capture.");
            }
        };
    }, [isAudioActive]);

    // Initialize the scene, camera, and renderer after audio capture starts
    useEffect(() => {
        if (isAudioActive && !sceneRef.current) {
            console.log("Initializing Three.js scene...");

            // Create scene
            const scene = new THREE.Scene();
            sceneRef.current = scene;

            // Create camera
            const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
            camera.position.z = 5;
            cameraRef.current = camera;

            // Create renderer
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            mountRef.current.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            // Handle window resizing
            const handleResize = () => {
                renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
                camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
                camera.updateProjectionMatrix();
                console.log("Resizing Three.js scene...");
            };
            window.addEventListener('resize', handleResize);

            // Animation loop
            const animate = () => {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
            };
            animate();

            console.log("Three.js scene initialized.");

            return () => {
                console.log("Three.js scene cleaned up.");
                window.removeEventListener('resize', handleResize);
                renderer.dispose();
            };
        }
    }, [isAudioActive]);

    // Update scene objects dynamically based on the parsed script
    useEffect(() => {
        if (isAudioActive && sceneRef.current) {
            const scene = sceneRef.current;

            console.log("Updating objects in the scene...");

            // Clear existing objects (besides lights or camera)
            while (scene.children.length > 1) {
                scene.remove(scene.children[1]);
            }

            // Add objects from the parsed script
            objects.forEach(({ geometry, material, position, rotation, scale, name }) => {
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(...position);
                mesh.rotation.set(...rotation);
                mesh.scale.set(...scale);
                mesh.name = name; // Assign a name to the object to reference it in the animation loop
                scene.add(mesh);
            });

            console.log(`Added ${objects.length} objects to the scene.`);
        }
    }, [objects, isAudioActive]);

    return (
        <div ref={mountRef} style={{ width: '100%', height: '500px', backgroundColor: 'black' }}>
            {!isAudioActive && <div style={{ color: 'white', padding: '20px' }}>Audio Capture Not Started</div>}
        </div>
    );
};

export default ThreeJSScene;
