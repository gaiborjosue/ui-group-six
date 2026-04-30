"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js"

import { visualParts, type PartKey } from "@/lib/carmate-data"
import { cn } from "@/lib/utils"

type CarSceneProps = {
  selectedPart: PartKey
  onSelectPart?: (part: PartKey) => void
}

const partColors: Record<PartKey, number> = {
  engine: 0xef4444,
  battery: 0x06b6d4,
  brakes: 0xf59e0b,
  tires: 0x22c55e,
  fluids: 0x0ea5e9,
  lights: 0xfacc15,
  body: 0xdc2626,
  wipers: 0x71717a,
}

const labelOffsets: Partial<Record<PartKey, { x: number; y: number }>> = {
  brakes: { x: -142, y: 36 },
  tires: { x: 32, y: 36 },
  lights: { x: 38, y: -8 },
  body: { x: -132, y: -48 },
  wipers: { x: 36, y: -58 },
}

export function CarScene({ selectedPart, onSelectPart }: CarSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const labelLayerRef = useRef<HTMLDivElement | null>(null)
  const onSelectPartRef = useRef(onSelectPart)
  const labelRefs = useRef(new Map<PartKey, HTMLButtonElement>())
  const pinRefs = useRef(new Map<PartKey, HTMLSpanElement>())
  const lineRefs = useRef(new Map<PartKey, SVGLineElement>())
  const anchorRefs = useRef(new Map<PartKey, THREE.Object3D>())
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const selectedPartRef = useRef(selectedPart)
  const focusAnimationRef = useRef<FocusAnimation | null>(null)
  const bodyMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null)
  const detailsMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const glassMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    onSelectPartRef.current = onSelectPart
  }, [onSelectPart])

  useEffect(() => {
    selectedPartRef.current = selectedPart
    focusSelectedPart()
  }, [selectedPart])

  useEffect(() => {
    const mount = mountRef.current

    if (!mount) {
      return
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setAnimationLoop(animate)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.85
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)

    const camera = new THREE.PerspectiveCamera(
      38,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    )
    camera.position.set(4.25, 1.55, -4.8)
    cameraRef.current = camera

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.maxDistance = 7.5
    controls.minDistance = 3.2
    controls.maxPolarAngle = THREE.MathUtils.degToRad(82)
    controls.target.set(0, 0.42, 0)
    controls.update()
    controlsRef.current = controls

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf4f4f5)
    scene.fog = new THREE.Fog(0xf4f4f5, 10, 18)

    const ambient = new THREE.HemisphereLight(0xffffff, 0x18202a, 1.25)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
    keyLight.position.set(3, 6, -5)
    scene.add(keyLight)

    const grid = new THREE.GridHelper(18, 36, 0xd4d4d8, 0xe4e4e7)
    grid.material.opacity = 0.42
    grid.material.depthWrite = false
    grid.material.transparent = true
    scene.add(grid)

    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdc2626,
      metalness: 1,
      roughness: 0.44,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
    })

    const detailsMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 1,
      roughness: 0.45,
    })

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      metalness: 0.2,
      roughness: 0,
      transmission: 0.9,
      transparent: true,
    })

    bodyMaterialRef.current = bodyMaterial
    detailsMaterialRef.current = detailsMaterial
    glassMaterialRef.current = glassMaterial

    new RGBELoader().load("/venice_sunset_1k.hdr", (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping
      scene.environment = texture
    })

    const wheels: THREE.Object3D[] = []
    const pickTargets: THREE.Object3D[] = []
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const shadow = new THREE.TextureLoader().load("/ferrari_ao.png")
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/")

    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)
    loader.load("/ferrari.glb", (gltf) => {
      const carModel = gltf.scene.children[0] ?? gltf.scene

      carModel.getObjectByName("body")?.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.material = bodyMaterial
        }
      })

      for (const objectName of ["rim_fl", "rim_fr", "rim_rr", "rim_rl", "trim"]) {
        const object = carModel.getObjectByName(objectName)

        if (object instanceof THREE.Mesh) {
          object.material = detailsMaterial
        }
      }

      const glass = carModel.getObjectByName("glass")

      if (glass instanceof THREE.Mesh) {
        glass.material = glassMaterial
      }

      for (const objectName of ["wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr"]) {
        const wheel = carModel.getObjectByName(objectName)

        if (wheel) {
          wheels.push(wheel)
        }
      }

      const shadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
        new THREE.MeshBasicMaterial({
          map: shadow,
          blending: THREE.MultiplyBlending,
          toneMapped: false,
          transparent: true,
          premultipliedAlpha: true,
        })
      )
      shadowMesh.rotation.x = -Math.PI / 2
      shadowMesh.renderOrder = 2
      carModel.add(shadowMesh)

      scene.add(carModel)
      anchorRefs.current = createPartAnchors(carModel, pickTargets)
      focusSelectedPart(true)
      setLoaded(true)
    })

    function updateConnectedLabels(camera: THREE.Camera) {
      const layer = labelLayerRef.current

      if (!layer || anchorRefs.current.size === 0) {
        return
      }

      const width = layer.clientWidth
      const height = layer.clientHeight
      const worldPosition = new THREE.Vector3()
      const projectedPosition = new THREE.Vector3()

      for (const part of visualParts) {
        const anchor = anchorRefs.current.get(part.key)
        const label = labelRefs.current.get(part.key)
        const pin = pinRefs.current.get(part.key)
        const line = lineRefs.current.get(part.key)

        if (!anchor || !label || !pin || !line) {
          continue
        }

        anchor.getWorldPosition(worldPosition)
        projectedPosition.copy(worldPosition).project(camera)

        const visible = projectedPosition.z >= -1 && projectedPosition.z <= 1
        const anchorX = (projectedPosition.x * 0.5 + 0.5) * width
        const anchorY = (-projectedPosition.y * 0.5 + 0.5) * height
        const offset = labelOffsets[part.key] ?? { x: 36, y: -42 }
        const labelX = clamp(anchorX + offset.x, 12, width - label.offsetWidth - 12)
        const labelY = clamp(anchorY + offset.y, 12, height - label.offsetHeight - 12)
        const lineEndX = labelX + (offset.x < 0 ? label.offsetWidth : 0)
        const lineEndY = labelY + label.offsetHeight / 2
        const display = visible ? "" : "none"

        pin.style.display = display
        label.style.display = display
        line.style.display = display
        pin.style.transform = `translate3d(${anchorX - 6}px, ${anchorY - 6}px, 0)`
        label.style.transform = `translate3d(${labelX}px, ${labelY}px, 0)`
        line.setAttribute("x1", String(anchorX))
        line.setAttribute("y1", String(anchorY))
        line.setAttribute("x2", String(lineEndX))
        line.setAttribute("y2", String(lineEndY))
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      updateConnectedLabels(camera)
    })

    resizeObserver.observe(mount)
    renderer.domElement.addEventListener("pointerdown", onPointerDown)

    function animate() {
      applyFocusAnimation()
      controls.update()

      const time = -performance.now() / 1000

      for (const wheel of wheels) {
        wheel.rotation.x = time * Math.PI * 2
      }

      grid.position.z = -time % 1
      renderer.render(scene, camera)
      updateConnectedLabels(camera)
    }

    function onPointerDown(event: PointerEvent) {
      const handleSelect = onSelectPartRef.current

      if (!handleSelect || pickTargets.length === 0) {
        return
      }

      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)

      const [hit] = raycaster.intersectObjects(pickTargets, false)
      const partKey = hit?.object.userData.partKey

      if (isPartKey(partKey)) {
        handleSelect(partKey)
      }
    }

    return () => {
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener("pointerdown", onPointerDown)
      renderer.setAnimationLoop(null)
      controls.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      dracoLoader.dispose()
      cameraRef.current = null
      controlsRef.current = null
    }
  }, [])

  useEffect(() => {
    const highlight = partColors[selectedPart] ?? 0xdc2626

    bodyMaterialRef.current?.color.set(selectedPart === "body" ? highlight : 0xdc2626)
    detailsMaterialRef.current?.color.set(
      selectedPart === "tires" || selectedPart === "brakes" || selectedPart === "wipers"
        ? highlight
        : 0xf8fafc
    )
    glassMaterialRef.current?.color.set(selectedPart === "lights" ? highlight : 0xf8fafc)
  }, [selectedPart])

  return (
    <div
      ref={labelLayerRef}
      className="relative min-h-[460px] overflow-hidden rounded-lg border bg-zinc-100 md:min-h-[620px]"
    >
      <div ref={mountRef} className="absolute inset-0" data-testid="car-canvas-host" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-zinc-100/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-100/80 to-transparent" />
      <svg className="pointer-events-none absolute inset-0 hidden size-full md:block">
        {visualParts.map((part) => (
          <line
            key={part.key}
            ref={(node) => setMapRef(lineRefs.current, part.key, node)}
            className={cn(
              "stroke-background/70 transition",
              selectedPart === part.key && "stroke-primary"
            )}
            strokeWidth={selectedPart === part.key ? 2 : 1.25}
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {visualParts.map((part) => (
          <span
            key={`${part.key}-pin`}
            ref={(node) => setMapRef(pinRefs.current, part.key, node)}
            className={cn(
              "absolute size-3 rounded-full border border-background bg-background shadow-sm transition",
              selectedPart === part.key && "bg-primary"
            )}
          />
        ))}
        {visualParts.map((part) => (
          <button
            key={part.key}
            type="button"
            ref={(node) => setMapRef(labelRefs.current, part.key, node)}
            className={cn(
              "pointer-events-auto absolute min-h-8 rounded-lg border border-background/70 bg-background/90 px-3 text-sm font-medium shadow-sm backdrop-blur transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selectedPart === part.key && "border-primary text-primary"
            )}
            onClick={() => onSelectPart?.(part.key)}
          >
            {part.name}
          </button>
        ))}
      </div>
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center bg-zinc-100 text-foreground">
          <div className="rounded-lg border bg-background px-4 py-3 text-sm shadow-sm">
            Loading interactive vehicle
          </div>
        </div>
      )}
    </div>
  )

  function focusSelectedPart(instant = false) {
    const camera = cameraRef.current
    const controls = controlsRef.current
    const anchor = anchorRefs.current.get(selectedPartRef.current)

    if (!camera || !controls || !anchor) {
      return
    }

    const target = new THREE.Vector3()
    anchor.getWorldPosition(target)

    const direction = new THREE.Vector3()
      .subVectors(camera.position, controls.target)
      .normalize()

    if (direction.lengthSq() === 0) {
      direction.set(0.65, 0.26, -0.72).normalize()
    }

    const distance = focusDistance(selectedPartRef.current)
    const position = target.clone().add(direction.multiplyScalar(distance))
    position.y = Math.max(position.y, target.y + 0.55)

    if (instant) {
      camera.position.copy(position)
      controls.target.copy(target)
      controls.update()
      return
    }

    focusAnimationRef.current = {
      startedAt: performance.now(),
      duration: 650,
      fromPosition: camera.position.clone(),
      toPosition: position,
      fromTarget: controls.target.clone(),
      toTarget: target,
    }
  }

  function applyFocusAnimation() {
    const animation = focusAnimationRef.current
    const camera = cameraRef.current
    const controls = controlsRef.current

    if (!animation || !camera || !controls) {
      return
    }

    const progress = Math.min(
      (performance.now() - animation.startedAt) / animation.duration,
      1
    )
    const eased = 1 - Math.pow(1 - progress, 3)

    camera.position.lerpVectors(animation.fromPosition, animation.toPosition, eased)
    controls.target.lerpVectors(animation.fromTarget, animation.toTarget, eased)

    if (progress >= 1) {
      focusAnimationRef.current = null
    }
  }
}

function createPartAnchors(
  carModel: THREE.Object3D,
  pickTargets: THREE.Object3D[]
): Map<PartKey, THREE.Object3D> {
  const anchors = new Map<PartKey, THREE.Object3D>()
  const bounds = new THREE.Box3().setFromObject(carModel)
  const size = new THREE.Vector3()
  bounds.getSize(size)

  const localAnchors: Partial<Record<PartKey, THREE.Vector3>> = {
    body: objectAnchor(carModel, "body", new THREE.Vector3(0, bounds.max.y * 0.72, bounds.min.z + size.z * 0.5)),
    wipers: objectAnchor(carModel, "wipers", new THREE.Vector3(0, bounds.max.y * 0.8, bounds.min.z + size.z * 0.45)),
    lights: objectAnchor(carModel, "lights", new THREE.Vector3(0, bounds.max.y * 0.48, bounds.min.z + size.z * 0.06)),
    brakes: childAnchor(carModel, "wheel_fl", "brake", new THREE.Vector3(0, 0.28, 0)),
    tires: childAnchor(carModel, "wheel_fr", "tire", new THREE.Vector3(0, 0.18, 0)),
  }

  for (const part of visualParts) {
    const position = localAnchors[part.key]

    if (!position) {
      continue
    }

    const anchor = new THREE.Object3D()
    anchor.name = `anchor_${part.key}`
    anchor.position.copy(position)
    carModel.add(anchor)
    anchors.set(part.key, anchor)

    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 16, 16),
      new THREE.MeshBasicMaterial({
        color: partColors[part.key],
        depthTest: false,
      })
    )
    marker.name = `pick_${part.key}`
    marker.userData.partKey = part.key
    marker.renderOrder = 4
    anchor.add(marker)
    pickTargets.push(marker)
  }

  return anchors
}

function childAnchor(
  carModel: THREE.Object3D,
  wheelName: string,
  childName: string | undefined,
  fallbackOffset: THREE.Vector3
) {
  const wheel = carModel.getObjectByName(wheelName)
  const target = childName ? wheel?.getObjectByName(childName) : wheel

  if (!target) {
    return fallbackOffset
  }

  const position = new THREE.Vector3()
  target.getWorldPosition(position)
  carModel.worldToLocal(position)
  position.add(fallbackOffset)

  return position
}

function objectAnchor(
  carModel: THREE.Object3D,
  objectName: string,
  fallback: THREE.Vector3
) {
  const object = carModel.getObjectByName(objectName)

  if (!object) {
    return fallback
  }

  const bounds = new THREE.Box3().setFromObject(object)
  const position = new THREE.Vector3()
  bounds.getCenter(position)
  carModel.worldToLocal(position)

  return position
}

function focusDistance(part: PartKey) {
  if (part === "tires" || part === "brakes") {
    return 2.7
  }

  if (part === "lights" || part === "wipers") {
    return 3.1
  }

  return 4.1
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function setMapRef<T extends Element>(
  map: Map<PartKey, T>,
  key: PartKey,
  node: T | null
) {
  if (node) {
    map.set(key, node)
  } else {
    map.delete(key)
  }
}

function isPartKey(value: unknown): value is PartKey {
  return (
    value === "engine" ||
    value === "battery" ||
    value === "brakes" ||
    value === "tires" ||
    value === "fluids" ||
    value === "lights" ||
    value === "body" ||
    value === "wipers"
  )
}

type FocusAnimation = {
  startedAt: number
  duration: number
  fromPosition: THREE.Vector3
  toPosition: THREE.Vector3
  fromTarget: THREE.Vector3
  toTarget: THREE.Vector3
}
