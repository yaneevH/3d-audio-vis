import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import audioHandler from '../../utils/AudioHandler';

const ThreeJSScene = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const initializedRef = useRef(false);

    const cube1Ref = useRef(null);
    const cube2Ref = useRef(null);
    const cube3Ref = useRef(null);

    const [audioData, setAudioData] = useState({
        lowPower: 0,
        midPower: 0,
        highPower: 0,
        averageVolume: 0,
    });

    const audioDataRef = useRef(audioData);

    useEffect(() => {
        const handleAudioData = (data) => {
            setAudioData(data);
            audioDataRef.current = data;
        };

        audioHandler.addListener(handleAudioData);
        return () => audioHandler.removeListener(handleAudioData);
    }, []);

    useEffect(() => {
        // Check if already initialized
        if (initializedRef.current) {
            console.log("Three.js scene already initialized. Skipping redundant initialization.");
            return;
        }

        console.log("Initializing Three.js scene...");
        initializedRef.current = true; // Mark as initialized

        // Create scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create camera
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 10;
        cameraRef.current = camera;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Add resize listener
        const handleResize = () => {
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        // Add cubes with dynamic updates
        const cube1Geometry = new THREE.BoxGeometry(1, 1, 1);
        const cube1Material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const cube1 = new THREE.Mesh(cube1Geometry, cube1Material);
        cube1.position.x = -4;
        scene.add(cube1);
        cube1Ref.current = cube1;

        const cube2Geometry = new THREE.BoxGeometry(1, 1, 1);
        const cube2Material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube2 = new THREE.Mesh(cube2Geometry, cube2Material);
        cube2.position.x = 0;
        scene.add(cube2);
        cube2Ref.current = cube2;

        const cube3Geometry = new THREE.BoxGeometry(1, 1, 1);
        const cube3Material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const cube3 = new THREE.Mesh(cube3Geometry, cube3Material);
        cube3.position.x = 4;
        scene.add(cube3);
        cube3Ref.current = cube3;

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            const { lowPower, midPower, highPower } = audioDataRef.current;

            if (cube1Ref.current) {
                const rotationZ = THREE.MathUtils.mapLinear(lowPower, 0, 100, 0, Math.PI * 2);
                cube1Ref.current.rotation.z = rotationZ;
            }

            if (cube2Ref.current) {
                const positionY = THREE.MathUtils.mapLinear(midPower, 0, 100, -3, 3);
                cube2Ref.current.position.y = positionY;
            }

            if (cube3Ref.current) {
                const scale = THREE.MathUtils.mapLinear(highPower, 0, 100, 0.5, 8);
                cube3Ref.current.scale.set(scale, scale, scale);
            }

            renderer.render(scene, camera);
        };
        animate();

        console.log("Three.js scene initialized with three cubes.");

        return () => {
            console.log("Cleaning up Three.js scene.");
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            rendererRef.current = null;
            sceneRef.current = null;
            initializedRef.current = false;
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100%', height: '500px', backgroundColor: 'black' }} />;
};

export default ThreeJSScene;
