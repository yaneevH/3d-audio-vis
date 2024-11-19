import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import audioHandler from '../../utils/AudioHandler';

// Tell CameraControls to use Three.js's renderer
CameraControls.install({ THREE });

const ThreeJSScene = ({ isAudioActive, parsedObjects, sceneWindow }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null); // Reference for CameraControls
    const animationFrameIdRef = useRef(null);
    const [audioData, setAudioData] = useState({
        lowPower: 0,
        midPower: 0,
        highPower: 0,
        averageVolume: 0,
    });

    // Subscribe to audioHandler updates
    useEffect(() => {
        const handleAudioData = (data) => {
            setAudioData(data); // Update state with new audio data
        };

        audioHandler.addListener(handleAudioData);

        return () => {
            audioHandler.removeListener(handleAudioData);
        };
    }, []);

    // Initialize the Three.js scene and Camera Controls
    useEffect(() => {
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            75,
            sceneWindow.innerWidth / sceneWindow.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 5, 10); // Default camera position
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(sceneWindow.innerWidth, sceneWindow.innerHeight);
        renderer.setPixelRatio(sceneWindow.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Initialize Camera Controls
        const controls = new CameraControls(camera, renderer.domElement);
        controlsRef.current = controls;

        // Handle resizing of the `ThreeJSScene` window
        const handleResize = () => {
            renderer.setSize(sceneWindow.innerWidth, sceneWindow.innerHeight);
            camera.aspect = sceneWindow.innerWidth / sceneWindow.innerHeight;
            camera.updateProjectionMatrix();
        };
        sceneWindow.addEventListener('resize', handleResize);

        return () => {
            sceneWindow.removeEventListener('resize', handleResize);
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            renderer.dispose();
        };
    }, [sceneWindow]);

    // Clear existing objects and add parsed objects
    useEffect(() => {
        if (!sceneRef.current) return;

        const scene = sceneRef.current;

        // Clear all existing objects
        while (scene.children.length > 0) {
            const child = scene.children.pop();
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }

        // Add new objects based on parsedObjects
        parsedObjects.forEach((obj) => {
            const mesh = new THREE.Mesh(obj.geometry, obj.material);
            mesh.position.set(...obj.position);
            mesh.rotation.set(...obj.rotation);
            mesh.scale.set(...obj.scale);
            mesh.name = obj.name;

            // Attach mappings for animation updates
            mesh.userData.mappings = obj.mappings;
            scene.add(mesh);
        });
    }, [parsedObjects]);

    // Animate the scene with Camera Controls
    useEffect(() => {
        const animate = () => {
            const scene = sceneRef.current;
            const camera = cameraRef.current;
            const renderer = rendererRef.current;
            const controls = controlsRef.current;

            if (!scene || !camera || !renderer || !controls) return;

            // Update Camera Controls
            controls.update(0.016); // ~60 FPS update

            // Update objects based on mappings and current audio data
            scene.children.forEach((object) => {
                const mappings = object.userData.mappings || [];
                mappings.forEach(({ target, range, audioProperty, audioRange }) => {
                    const audioValue = audioData[audioProperty]; // Use current audio data
                    if (audioValue !== undefined) {
                        const mappedValue = THREE.MathUtils.mapLinear(
                            audioValue,
                            audioRange[0],
                            audioRange[1],
                            range[0],
                            range[1]
                        );

                        const [property, axis] = target.split('.');
                        if (property && axis) {
                            object[property][axis] = mappedValue;
                        }
                    }
                });
            });

            renderer.render(scene, camera);

            animationFrameIdRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [audioData]);

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default ThreeJSScene;
