import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

// ============================================
// ENERGY SPHERE CORE - The main glowing center
// ============================================

function EnergySphere({ focusScore = 75, hovered }) {
    const innerRef = useRef()
    const outerRef = useRef()
    const glowRef = useRef()

    // Color based on focus score
    const coreColor = useMemo(() => {
        if (focusScore >= 85) return '#a78bfa' // Purple - thriving
        if (focusScore >= 70) return '#8b5cf6' // Indigo - focused
        if (focusScore >= 50) return '#818cf8' // Blue-ish - steady
        return '#6366f1' // Indigo - starting
    }, [focusScore])

    useFrame((state) => {
        const time = state.clock.elapsedTime

        // Breathing scale based on focus score
        const breatheSpeed = 0.8 + (focusScore / 100) * 0.4
        const breatheAmount = 0.02 + (focusScore / 100) * 0.02
        const breathe = Math.sin(time * breatheSpeed) * breatheAmount

        if (innerRef.current) {
            innerRef.current.scale.setScalar(0.98 + breathe + (hovered ? 0.05 : 0))
            innerRef.current.rotation.y = time * 0.3
            innerRef.current.material.opacity = 0.85 + Math.sin(time * 2) * 0.1
        }

        if (outerRef.current) {
            outerRef.current.scale.setScalar(1 + breathe * 0.5)
            outerRef.current.rotation.y = -time * 0.2
            outerRef.current.material.opacity = 0.4 + Math.sin(time * 1.5) * 0.1 + (hovered ? 0.15 : 0)
        }

        if (glowRef.current) {
            glowRef.current.scale.setScalar(1.2 + breathe + Math.sin(time * 0.5) * 0.05)
            glowRef.current.material.opacity = 0.15 + Math.sin(time) * 0.05 + (hovered ? 0.1 : 0)
        }
    })

    return (
        <group>
            {/* Core light */}
            <pointLight color={coreColor} intensity={8 + (hovered ? 3 : 0)} distance={12} />

            {/* Inner bright core */}
            <mesh ref={innerRef}>
                <icosahedronGeometry args={[0.5, 2]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={1}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Middle energy layer */}
            <mesh ref={outerRef}>
                <icosahedronGeometry args={[0.65, 1]} />
                <meshBasicMaterial
                    color={coreColor}
                    transparent
                    opacity={0.8}
                    wireframe
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Outer glow sphere */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial
                    color={coreColor}
                    transparent
                    opacity={0.45}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    )
}

// ============================================
// SWIRLING INNER PARTICLES
// ============================================

function SwirlingParticles({ count = 80, focusScore = 75, hovered }) {
    const pointsRef = useRef()

    const { positions, speeds, radii, phases } = useMemo(() => {
        const pos = new Float32Array(count * 3)
        const spd = []
        const rad = []
        const phs = []

        for (let i = 0; i < count; i++) {
            const radius = 0.3 + Math.random() * 0.4
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI

            pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
            pos[i * 3 + 1] = radius * Math.cos(phi)
            pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

            spd.push(0.5 + Math.random() * 1.5)
            rad.push(radius)
            phs.push(Math.random() * Math.PI * 2)
        }

        return { positions: pos, speeds: spd, radii: rad, phases: phs }
    }, [count])

    useFrame((state) => {
        const time = state.clock.elapsedTime
        const geometry = pointsRef.current?.geometry
        if (!geometry) return

        const pos = geometry.attributes.position.array
        const speedMult = hovered ? 1.5 : 1

        for (let i = 0; i < count; i++) {
            const theta = time * speeds[i] * speedMult + phases[i]
            const phi = time * speeds[i] * 0.5 * speedMult + phases[i]

            pos[i * 3] = radii[i] * Math.sin(phi) * Math.cos(theta)
            pos[i * 3 + 1] = radii[i] * Math.cos(phi)
            pos[i * 3 + 2] = radii[i] * Math.sin(phi) * Math.sin(theta)
        }

        geometry.attributes.position.needsUpdate = true
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                color="#e0d4ff"
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    )
}

// ============================================
// ROTATING ENERGY RINGS
// ============================================

function EnergyRing({ radius, thickness, color, rotationSpeed, axis = [0, 1, 0], hovered }) {
    const ringRef = useRef()
    const glowRef = useRef()

    useFrame((state) => {
        const time = state.clock.elapsedTime
        const speed = hovered ? rotationSpeed * 1.5 : rotationSpeed

        if (ringRef.current) {
            if (axis[0]) ringRef.current.rotation.x = time * speed
            if (axis[1]) ringRef.current.rotation.y = time * speed
            if (axis[2]) ringRef.current.rotation.z = time * speed

            ringRef.current.material.opacity = 0.6 + Math.sin(time * 2 + radius) * 0.2
        }

        if (glowRef.current) {
            if (axis[0]) glowRef.current.rotation.x = time * speed
            if (axis[1]) glowRef.current.rotation.y = time * speed
            if (axis[2]) glowRef.current.rotation.z = time * speed
        }
    })

    return (
        <group>
            {/* Main ring */}
            <mesh ref={ringRef}>
                <torusGeometry args={[radius, thickness, 16, 64]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.7}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Ring glow */}
            <mesh ref={glowRef}>
                <torusGeometry args={[radius, thickness * 2.5, 8, 32]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.15}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    )
}

// ============================================
// ELECTRIC ARCS
// ============================================

function ElectricArcs({ focusScore = 75, hovered }) {
    const arcsRef = useRef([])
    const [arcs, setArcs] = useState([])

    // Generate random arcs periodically
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() < (hovered ? 0.4 : 0.2)) {
                const newArc = {
                    id: Date.now(),
                    start: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.8,
                        (Math.random() - 0.5) * 0.8,
                        (Math.random() - 0.5) * 0.8
                    ),
                    end: new THREE.Vector3(
                        (Math.random() - 0.5) * 1.5,
                        (Math.random() - 0.5) * 1.5,
                        (Math.random() - 0.5) * 1.5
                    ),
                    life: 0,
                    maxLife: 0.3 + Math.random() * 0.3
                }
                setArcs(prev => [...prev.slice(-4), newArc])
            }
        }, 200)
        return () => clearInterval(interval)
    }, [hovered])

    useFrame((state, delta) => {
        setArcs(prev => prev.map(arc => ({
            ...arc,
            life: arc.life + delta
        })).filter(arc => arc.life < arc.maxLife))
    })

    return (
        <group>
            {arcs.map((arc) => {
                const opacity = 1 - (arc.life / arc.maxLife)
                const mid = arc.start.clone().lerp(arc.end, 0.5)
                mid.x += (Math.random() - 0.5) * 0.3
                mid.y += (Math.random() - 0.5) * 0.3
                mid.z += (Math.random() - 0.5) * 0.3

                return (
                    <line key={arc.id}>
                        <bufferGeometry>
                            <bufferAttribute
                                attach="attributes-position"
                                count={3}
                                array={new Float32Array([
                                    arc.start.x, arc.start.y, arc.start.z,
                                    mid.x, mid.y, mid.z,
                                    arc.end.x, arc.end.y, arc.end.z
                                ])}
                                itemSize={3}
                            />
                        </bufferGeometry>
                        <lineBasicMaterial
                            color="#c4b5fd"
                            transparent
                            opacity={opacity * 0.8}
                            blending={THREE.AdditiveBlending}
                        />
                    </line>
                )
            })}
        </group>
    )
}

// ============================================
// ENERGY PULSE WAVE
// ============================================

function PulseWave({ hovered }) {
    const waveRef = useRef()
    const scaleRef = useRef(0)
    const opacityRef = useRef(0)

    useFrame((state, delta) => {
        // Expand and fade
        scaleRef.current += delta * (hovered ? 1.5 : 1)

        if (scaleRef.current > 2.5) {
            scaleRef.current = 0
            opacityRef.current = 0.6
        }

        opacityRef.current = Math.max(0, opacityRef.current - delta * 0.4)

        if (waveRef.current) {
            waveRef.current.scale.setScalar(scaleRef.current)
            waveRef.current.material.opacity = opacityRef.current
        }
    })

    return (
        <mesh ref={waveRef}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshBasicMaterial
                color="#a78bfa"
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                side={THREE.BackSide}
            />
        </mesh>
    )
}

// ============================================
// FLOATING TEXT INSIDE CORE
// ============================================

function FloatingText({ focusScore }) {
    const textRef = useRef()

    useFrame((state) => {
        const time = state.clock.elapsedTime
        if (textRef.current) {
            textRef.current.position.y = Math.sin(time * 0.5) * 0.05
        }
    })

    return (
        <group ref={textRef}>
            <Text
                position={[0, 0.05, 0]}
                fontSize={0.45}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0}
            >
                {Math.round(focusScore)}%
            </Text>
            <Text
                position={[0, -0.25, 0]}
                fontSize={0.08}
                color="rgba(255,255,255,0.8)"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.1}
            >
                FOCUS
            </Text>
        </group>
    )
}

// ============================================
// AMBIENT PARTICLES
// ============================================

function AmbientParticles({ count = 100 }) {
    const pointsRef = useRef()

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 6
            pos[i * 3 + 1] = (Math.random() - 0.5) * 6
            pos[i * 3 + 2] = (Math.random() - 0.5) * 6
        }
        return pos
    }, [count])

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                color="#818cf8"
                transparent
                opacity={0.4}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    )
}

// ============================================
// MOUSE PARALLAX EFFECT
// ============================================

function ParallaxController({ children }) {
    const groupRef = useRef()
    const { size, viewport } = useThree()
    const mouseRef = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseRef.current.x = (e.clientX / size.width - 0.5) * 2
            mouseRef.current.y = -(e.clientY / size.height - 0.5) * 2
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [size])

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += (mouseRef.current.x * 0.1 - groupRef.current.rotation.y) * 0.02
            groupRef.current.rotation.x += (mouseRef.current.y * 0.05 - groupRef.current.rotation.x) * 0.02
        }
    })

    return <group ref={groupRef}>{children}</group>
}

// ============================================
// MAIN REACTOR SCENE
// ============================================

function ReactorScene({ focusScore }) {
    const [hovered, setHovered] = useState(false)

    return (
        <>
            <ambientLight intensity={0.4} color="#6366f1" />
            <pointLight position={[3, 3, 3]} intensity={2} color="#a78bfa" />
            <pointLight position={[-3, -3, -3]} intensity={1.5} color="#818cf8" />
            <pointLight position={[0, 0, 2]} intensity={3} color="#c4b5fd" />

            <fog attach="fog" args={['#050510', 3, 10]} />

            <ParallaxController>
                <Float
                    speed={1.5}
                    rotationIntensity={0.2}
                    floatIntensity={0.3}
                >
                    <group
                        onPointerEnter={() => setHovered(true)}
                        onPointerLeave={() => setHovered(false)}
                    >
                        {/* Core sphere */}
                        <EnergySphere focusScore={focusScore} hovered={hovered} />

                        {/* Inner swirling particles */}
                        <SwirlingParticles focusScore={focusScore} hovered={hovered} />

                        {/* Rotating rings */}
                        <EnergyRing radius={1.1} thickness={0.02} color="#a78bfa" rotationSpeed={0.5} axis={[0, 1, 0]} hovered={hovered} />
                        <EnergyRing radius={1.25} thickness={0.015} color="#818cf8" rotationSpeed={-0.3} axis={[1, 0.3, 0]} hovered={hovered} />
                        <EnergyRing radius={1.4} thickness={0.01} color="#6366f1" rotationSpeed={0.4} axis={[0.5, 0.5, 1]} hovered={hovered} />

                        {/* Electric arcs */}
                        <ElectricArcs focusScore={focusScore} hovered={hovered} />

                        {/* Pulse wave */}
                        <PulseWave hovered={hovered} />

                        {/* Floating percentage */}
                        <FloatingText focusScore={focusScore} />
                    </group>
                </Float>
            </ParallaxController>

            {/* Ambient particles */}
            <AmbientParticles count={100} />

            {/* Post-processing */}
            <EffectComposer>
                <Bloom
                    intensity={4}
                    luminanceThreshold={0.01}
                    luminanceSmoothing={0.9}
                    radius={0.9}
                    mipmapBlur
                />
                <Vignette
                    offset={0.3}
                    darkness={0.5}
                    blendFunction={BlendFunction.NORMAL}
                />
            </EffectComposer>
        </>
    )
}

// ============================================
// MAIN EXPORT COMPONENT
// ============================================

export default function FocusCore({ focusScore = 75 }) {
    return (
        <div style={{
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'radial-gradient(ellipse at center, #0a0a1f 0%, #000000 100%)',
            position: 'relative',
            boxShadow: `
                0 0 60px rgba(139, 92, 246, 0.15),
                inset 0 0 60px rgba(139, 92, 246, 0.05)
            `
        }}>
            <Canvas
                camera={{
                    position: [0, 0, 3.5],
                    fov: 50
                }}
                style={{ background: 'transparent' }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance'
                }}
                dpr={[1, 2]}
            >
                <ReactorScene focusScore={focusScore} />
            </Canvas>
        </div>
    )
}
