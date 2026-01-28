import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

// ============================================
// ENERGY CORE SPINE - Bright glowing center
// ============================================

function EnergyCore({ height = 20 }) {
    const innerRef = useRef()
    const outerRef = useRef()
    const wireRef = useRef()
    const lightRef = useRef()
    const surgeRef = useRef(0)

    useEffect(() => {
        const interval = setInterval(() => {
            surgeRef.current = 1.0
            setTimeout(() => { surgeRef.current = 0 }, 300)
        }, 2000 + Math.random() * 2000)
        return () => clearInterval(interval)
    }, [])

    useFrame((state) => {
        const time = state.clock.elapsedTime

        if (innerRef.current) {
            // Pulsing inner core
            const pulse = 0.85 + Math.sin(time * 3) * 0.15
            innerRef.current.material.opacity = pulse
        }

        if (outerRef.current) {
            // Flowing energy effect on outer layer
            outerRef.current.rotation.y = time * 0.5
            const flowPulse = 0.5 + Math.sin(time * 2) * 0.2 + surgeRef.current * 0.3
            outerRef.current.material.opacity = flowPulse
        }

        if (wireRef.current) {
            wireRef.current.rotation.y = -time * 0.3
        }

        if (lightRef.current) {
            lightRef.current.intensity = 3 + Math.sin(time * 2.5) * 1 + surgeRef.current * 5
        }
    })

    return (
        <group>
            {/* Core light emission */}
            <pointLight
                ref={lightRef}
                position={[0, 0, 0]}
                color="#a78bfa"
                intensity={4}
                distance={30}
            />

            {/* Brightest inner core */}
            <mesh ref={innerRef}>
                <cylinderGeometry args={[0.15, 0.15, height, 16]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.95}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Middle glowing layer */}
            <mesh ref={outerRef}>
                <cylinderGeometry args={[0.4, 0.4, height, 32, 1, true]} />
                <meshBasicMaterial
                    color="#8b5cf6"
                    transparent
                    opacity={0.5}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Outer soft glow */}
            <mesh>
                <cylinderGeometry args={[0.7, 0.7, height, 32, 1, true]} />
                <meshBasicMaterial
                    color="#c4b5fd"
                    transparent
                    opacity={0.2}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Wireframe energy */}
            <mesh ref={wireRef}>
                <cylinderGeometry args={[0.55, 0.55, height, 8, 30, true]} />
                <meshBasicMaterial
                    color="#a78bfa"
                    transparent
                    opacity={0.25}
                    wireframe
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    )
}

// ============================================
// GLOWING ORB NODE - Bright emissive spheres
// ============================================

function GlowingOrb({ position, color, index }) {
    const meshRef = useRef()
    const glowRef = useRef()
    const outerGlowRef = useRef()

    // Depth-based intensity
    const depthFactor = Math.max(0.5, 1 - Math.abs(position[2]) / 5)

    useFrame((state) => {
        const time = state.clock.elapsedTime

        // Gentle bobbing
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(time * 2 + index * 0.3) * 0.06
        }

        // Shimmer effect
        if (glowRef.current) {
            const shimmer = Math.sin(time * 4 + index * 0.5) * 0.15 + 0.85
            glowRef.current.material.opacity = shimmer * 0.6 * depthFactor
        }
    })

    return (
        <group position={[position[0], position[1], position[2]]}>
            {/* Bright core orb */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.95}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Inner glow */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[0.2, 12, 12]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.5 * depthFactor}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Outer glow */}
            <mesh ref={outerGlowRef}>
                <sphereGeometry args={[0.35, 8, 8]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.15 * depthFactor}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Local light emission */}
            <pointLight
                color={color}
                intensity={0.5 * depthFactor}
                distance={2}
            />
        </group>
    )
}

// ============================================
// GLOWING BEAM CONNECTOR
// ============================================

function GlowingBeam({ start, end, color, index }) {
    const meshRef = useRef()
    const outerRef = useRef()

    const direction = new THREE.Vector3(
        end[0] - start[0],
        end[1] - start[1],
        end[2] - start[2]
    )
    const distance = direction.length()
    const midpoint = [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        (start[2] + end[2]) / 2
    ]

    const quaternion = useMemo(() => {
        const q = new THREE.Quaternion()
        q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize())
        return q
    }, [start, end])

    const depthFactor = Math.max(0.4, 1 - Math.abs(midpoint[2]) / 5)

    useFrame((state) => {
        const time = state.clock.elapsedTime
        const pulse = Math.sin(time * 5 - index * 0.3) * 0.2 + 0.8

        if (meshRef.current) {
            meshRef.current.material.opacity = 0.7 * pulse * depthFactor
        }
        if (outerRef.current) {
            outerRef.current.material.opacity = 0.25 * pulse * depthFactor
        }
    })

    return (
        <group position={midpoint} quaternion={quaternion}>
            {/* Inner beam */}
            <mesh ref={meshRef}>
                <cylinderGeometry args={[0.03, 0.03, distance, 6]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.7}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Outer glow */}
            <mesh ref={outerRef}>
                <cylinderGeometry args={[0.08, 0.08, distance, 4]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.2}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
        </group>
    )
}

// ============================================
// DATA PULSE - Traveling energy along strands
// ============================================

function DataPulse({ helixData, direction = 1, color = '#ffffff' }) {
    const pulseRef = useRef()
    const progressRef = useRef(Math.random())

    useFrame((state, delta) => {
        progressRef.current += delta * 0.2 * direction
        if (progressRef.current > 1) progressRef.current = 0
        if (progressRef.current < 0) progressRef.current = 1

        const idx = Math.floor(progressRef.current * helixData.length)
        const segment = helixData[Math.min(idx, helixData.length - 1)]

        if (pulseRef.current && segment) {
            const pos = direction > 0 ? segment.strand1 : segment.strand2
            pulseRef.current.position.set(pos[0], pos[1], pos[2])

            const fade = Math.sin(progressRef.current * Math.PI)
            pulseRef.current.scale.setScalar(1 + fade * 0.5)
            pulseRef.current.material.opacity = fade * 0.95
        }
    })

    return (
        <mesh ref={pulseRef}>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    )
}

// ============================================
// PARTICLE FIELD
// ============================================

function ParticleField({ count = 500 }) {
    const meshRef = useRef()

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 30
            pos[i * 3 + 1] = (Math.random() - 0.5) * 30
            pos[i * 3 + 2] = (Math.random() - 0.5) * 30
        }
        return pos
    }, [count])

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.0002
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.3
        }
    })

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                color="#c4b5fd"
                transparent
                opacity={0.5}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    )
}

// ============================================
// HELIX STRAND CURVE - Smooth spline connection
// ============================================

function HelixStrandCurve({ points, color }) {
    const tubeRef = useRef()

    const curve = useMemo(() => {
        const vectors = points.map(p => new THREE.Vector3(p[0], p[1], p[2]))
        return new THREE.CatmullRomCurve3(vectors)
    }, [points])

    useFrame((state) => {
        const time = state.clock.elapsedTime
        if (tubeRef.current) {
            tubeRef.current.material.opacity = 0.3 + Math.sin(time * 1.5) * 0.1
        }
    })

    return (
        <mesh ref={tubeRef}>
            <tubeGeometry args={[curve, 64, 0.04, 8, false]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.35}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
    )
}

// ============================================
// MAIN DNA HELIX
// ============================================

function HolographicDNA({ averageFocusScore = 75 }) {
    const helixRef = useRef()
    const [hovered, setHovered] = useState(false)

    // Generate DNA segments with focus data
    const helixData = useMemo(() => {
        const groups = []
        const numSegments = 80
        const helixHeight = 18
        const radius = 2.8
        const turns = 5

        for (let i = 0; i < numSegments; i++) {
            const t = i / numSegments
            const y = t * helixHeight - helixHeight / 2
            const angle = t * turns * Math.PI * 2

            // Two intertwined helices
            const x1 = Math.cos(angle) * radius
            const z1 = Math.sin(angle) * radius
            const x2 = Math.cos(angle + Math.PI) * radius
            const z2 = Math.sin(angle + Math.PI) * radius

            // Color based on simulated focus score
            const focusScore = 50 + Math.random() * 50
            let color
            if (focusScore >= 80) {
                color = '#a78bfa' // Purple - high
            } else if (focusScore >= 60) {
                color = '#fbbf24' // Yellow - medium
            } else {
                color = '#f87171' // Red - low
            }

            groups.push({
                strand1: [x1, y, z1],
                strand2: [x2, y, z2],
                color,
                focusScore,
                index: i
            })
        }
        return groups
    }, [])

    // Extract strand points for curves
    const strand1Points = useMemo(() => helixData.map(d => d.strand1), [helixData])
    const strand2Points = useMemo(() => helixData.map(d => d.strand2), [helixData])

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime

        if (helixRef.current) {
            // Auto-rotation (faster when hovered)
            const rotationSpeed = hovered ? 0.012 : 0.004
            helixRef.current.rotation.y += rotationSpeed

            // Breathing scale
            const breathe = Math.sin(time * 0.5) * 0.015
            helixRef.current.scale.setScalar(1 + breathe)
        }
    })

    return (
        <group
            ref={helixRef}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
        >
            {/* Energy Core Spine */}
            <EnergyCore height={18} />

            {/* Strand 1 Curve */}
            <HelixStrandCurve points={strand1Points} color="#a78bfa" />

            {/* Strand 2 Curve */}
            <HelixStrandCurve points={strand2Points} color="#818cf8" />

            {/* DNA Nodes and Connections */}
            {helixData.map((seg, i) => (
                <group key={i}>
                    {/* Strand 1 orb */}
                    <GlowingOrb
                        position={seg.strand1}
                        color={seg.color}
                        index={i}
                    />

                    {/* Strand 2 orb */}
                    <GlowingOrb
                        position={seg.strand2}
                        color={seg.color}
                        index={i + 100}
                    />

                    {/* Connection beam (every 4th segment for clarity) */}
                    {i % 4 === 0 && (
                        <GlowingBeam
                            start={seg.strand1}
                            end={seg.strand2}
                            color={seg.color}
                            index={i}
                        />
                    )}
                </group>
            ))}

            {/* Data pulses traveling along strands */}
            <DataPulse helixData={helixData} direction={1} color="#ffffff" />
            <DataPulse helixData={helixData} direction={-1} color="#c4b5fd" />
            <DataPulse helixData={helixData} direction={0.7} color="#fbbf24" />
        </group>
    )
}

// ============================================
// CAMERA SWAY - Subtle cinematic movement
// ============================================

function CameraSway() {
    const { camera } = useThree()
    const initialPos = useRef(null)

    useFrame((state) => {
        if (!initialPos.current) {
            initialPos.current = camera.position.clone()
        }

        const time = state.clock.elapsedTime

        // Very subtle sway
        const swayX = Math.sin(time * 0.12) * 0.3
        const swayY = Math.sin(time * 0.08) * 0.2
        const swayZ = Math.cos(time * 0.1) * 0.25

        camera.position.x = initialPos.current.x + swayX
        camera.position.y = initialPos.current.y + swayY
        camera.position.z = initialPos.current.z + swayZ
    })

    return null
}

// ============================================
// MAIN EXPORT COMPONENT
// ============================================

export default function FocusDNA3D({ sessions }) {
    const averageFocusScore = useMemo(() => {
        if (!sessions || sessions.length === 0) return 75
        const avg = sessions.reduce((sum, s) => sum + (s.focus_score || 0), 0) / sessions.length
        return Math.round(avg)
    }, [sessions])

    // Dynamic bloom based on focus score
    const bloomIntensity = 3 + (averageFocusScore / 100) * 2

    if (!sessions || sessions.length === 0) {
        return (
            <div style={{
                height: '700px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(ellipse at center, #080818 0%, #000000 100%)',
                borderRadius: '24px',
                color: 'rgba(255,255,255,0.5)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧬</div>
                    <div>No genome data to analyze</div>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            height: '750px',
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 90%)',
            position: 'relative'
        }}>
            <Canvas
                camera={{
                    position: [10, 2, 10],
                    fov: 45
                }}
                style={{ background: 'transparent' }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance'
                }}
                dpr={[1, 2]}
            >
                {/* LIGHTING - Bright and dramatic */}
                <ambientLight intensity={0.3} color="#6366f1" />
                <directionalLight position={[5, 15, 10]} intensity={1} color="#e0e7ff" />
                <pointLight position={[-10, 10, -10]} intensity={2} color="#a78bfa" distance={50} />
                <pointLight position={[10, -10, 10]} intensity={1.5} color="#818cf8" distance={40} />
                <pointLight position={[0, -18, 0]} intensity={0.5} color="#6366f1" />

                {/* VOLUMETRIC FOG */}
                <fog attach="fog" args={['#050510', 12, 40]} />

                {/* MAIN DNA HELIX */}
                <HolographicDNA averageFocusScore={averageFocusScore} />

                {/* PARTICLE FIELD */}
                <ParticleField count={500} />

                {/* CAMERA SWAY */}
                <CameraSway />

                {/* ORBIT CONTROLS */}
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    enableZoom
                    minDistance={5}
                    maxDistance={30}
                    enablePan
                    panSpeed={0.5}
                    enableRotate
                    rotateSpeed={0.7}
                    maxPolarAngle={Math.PI * 0.85}
                    minPolarAngle={Math.PI * 0.15}
                    autoRotate={false}
                />

                {/* POST-PROCESSING */}
                <EffectComposer>
                    <Bloom
                        intensity={bloomIntensity}
                        luminanceThreshold={0.01}
                        luminanceSmoothing={0.9}
                        radius={0.8}
                        mipmapBlur
                    />
                    <Vignette
                        offset={0.35}
                        darkness={0.6}
                        blendFunction={BlendFunction.NORMAL}
                    />
                    <ChromaticAberration
                        offset={[0.0008, 0.0008]}
                        blendFunction={BlendFunction.NORMAL}
                    />
                </EffectComposer>
            </Canvas>

            {/* HOLOGRAPHIC UI OVERLAY */}
            <div style={{
                position: 'absolute',
                top: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 10
            }}>
                <div style={{
                    fontSize: '0.55rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3em',
                    color: 'rgba(167, 139, 250, 0.7)',
                    marginBottom: '0.3rem'
                }}>
                    Genome Analysis • Active
                </div>
                <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 400,
                    color: '#ffffff',
                    margin: 0,
                    textShadow: '0 0 40px rgba(139, 92, 246, 0.9)',
                    letterSpacing: '0.12em'
                }}>
                    FOCUS DNA
                </h3>
            </div>

            {/* FOCUS SCORE */}
            <div style={{
                position: 'absolute',
                top: '50%',
                right: '2rem',
                transform: 'translateY(-50%)',
                textAlign: 'right',
                pointerEvents: 'none',
                zIndex: 10
            }}>
                <div style={{
                    fontSize: '3rem',
                    fontWeight: 200,
                    color: '#a78bfa',
                    textShadow: '0 0 50px rgba(167, 139, 250, 0.6)',
                    lineHeight: 1,
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    {averageFocusScore}%
                </div>
                <div style={{
                    fontSize: '0.55rem',
                    color: 'rgba(255,255,255,0.35)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    marginTop: '0.3rem'
                }}>
                    Focus Index
                </div>
            </div>

            {/* LEGEND */}
            <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '2rem',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(20px)',
                padding: '0.7rem 1.5rem',
                borderRadius: '100px',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                zIndex: 10
            }}>
                {[
                    { color: '#a78bfa', label: 'High Focus' },
                    { color: '#fbbf24', label: 'Medium' },
                    { color: '#f87171', label: 'Low' }
                ].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: color,
                            boxShadow: `0 0 15px ${color}`
                        }} />
                        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            {/* CONTROLS HINT */}
            <div style={{
                position: 'absolute',
                bottom: '4rem',
                right: '2rem',
                fontSize: '0.55rem',
                color: 'rgba(255,255,255,0.25)',
                textAlign: 'right',
                pointerEvents: 'none',
                zIndex: 10,
                lineHeight: 1.6
            }}>
                <div>Drag to rotate</div>
                <div>Scroll to zoom</div>
                <div>Right-click to pan</div>
            </div>
        </div>
    )
}
