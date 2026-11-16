import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  Clock,
  DirectionalLight,
  Euler,
  Fog,
  Group,
  InstancedMesh,
  MathUtils,
  Matrix4,
  Mesh,
  type MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Sphere,
  SRGBColorSpace,
  type Texture,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

type Layout = "side" | "center";

type BeanFieldOptions = {
  count: number;
  layout: Layout;
  fogColor: string;
};

type Drifter = {
  position: Vector3;
  rotation: Euler;
  spin: Vector3;
  scale: number;
  speed: number;
};

// Где стоит главное зерно: справа от текста на широком экране, ниже — на телефоне.
const HERO_PLACEMENT: Record<Layout, { position: Vector3; scale: number }> = {
  side: { position: new Vector3(2.3, -0.1, 0), scale: 2 },
  center: { position: new Vector3(0.9, -1.9, -0.5), scale: 1.5 },
};

const FIELD = { width: 16, height: 12, depthNear: 2.5, depthFar: -9 };

// Экспоненциальное сглаживание, не зависящее от частоты кадров.
const damp = (from: number, to: number, lambda: number, dt: number) =>
  MathUtils.damp(from, to, lambda, dt);

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * 3D-сцена hero без React: главное зерно и поле зёрен, падающих в тумане.
 * Весь фон рисуется одним InstancedMesh — один draw call на десятки зёрен.
 */
export class BeanField {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(35, 1, 0.1, 40);
  private readonly clock = new Clock(false);
  private readonly dummy = new Object3D();
  private readonly tmp = new Matrix4();
  private readonly heroPivot = new Group();
  private readonly drifters: Drifter[] = [];
  private readonly placement: { position: Vector3; scale: number };

  // Матрица, приводящая модель к единичной сфере в начале координат.
  private base = new Matrix4();
  private field?: InstancedMesh;
  private disposables: { dispose(): void }[] = [];

  private frame = 0;
  private running = false;
  private animated = true;
  private disposed = false;

  private appear = 0;
  private scroll = 0;
  private scrollSmooth = 0;
  private pointer = { x: 0, y: 0, sx: 0, sy: 0 };

  constructor(
    canvas: HTMLCanvasElement,
    private readonly options: BeanFieldOptions,
  ) {
    const dpr = window.devicePixelRatio || 1;
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      // На ретине сглаживание почти не видно, а стоит дорого.
      antialias: dpr < 2,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(dpr, 1.75));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.placement = HERO_PLACEMENT[options.layout];
    this.scene.fog = new Fog(options.fogColor, 7, 17);

    // Окружение для бликов на глянцевом зерне — считается один раз.
    const pmrem = new PMREMGenerator(this.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = env;
    this.scene.environmentIntensity = 0.4;
    this.disposables.push(env);

    const key = new DirectionalLight(0xffd9b0, 2.4);
    key.position.set(4, 5, 6);
    const rim = new DirectionalLight(0xb87333, 5);
    rim.position.set(-6, 2, -4);
    this.scene.add(key, rim, new AmbientLight(0xede6da, 0.12));

    this.camera.position.set(0, 0, 9);
    this.scene.add(this.heroPivot);
  }

  async load(url: string): Promise<void> {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(url);
    if (this.disposed) return;

    let source: Mesh | undefined;
    gltf.scene.traverse((node) => {
      if (!source && node instanceof Mesh) source = node;
    });
    if (!source) throw new Error("В модели зерна нет меша");

    // Геометрия квантована (KHR_mesh_quantization) — её не трогаем,
    // а нормализуем размер и центр через матрицу.
    gltf.scene.updateMatrixWorld(true);
    const sphere = new Box3()
      .setFromObject(source)
      .getBoundingSphere(new Sphere());
    this.base = new Matrix4()
      .makeScale(1 / sphere.radius, 1 / sphere.radius, 1 / sphere.radius)
      .multiply(new Matrix4().makeTranslation(sphere.center.clone().negate()))
      .multiply(source.matrixWorld);

    const geometry = source.geometry;
    const material = source.material as MeshStandardMaterial;
    material.envMapIntensity = 1.2;
    this.disposables.push(geometry, material, ...collectTextures(material));

    const hero = new Mesh(geometry, material);
    hero.matrixAutoUpdate = false;
    hero.matrix.copy(this.base);
    this.heroPivot.add(hero);
    this.heroPivot.position.copy(this.placement.position);
    this.heroPivot.scale.setScalar(0.001);

    this.field = new InstancedMesh(geometry, material, this.options.count);
    // Зёрна двигаются каждый кадр — общий bounding sphere всё равно устареет.
    this.field.frustumCulled = false;
    this.scene.add(this.field);
    this.seedDrifters();
  }

  setAnimated(animated: boolean) {
    this.animated = animated;
    if (!animated) this.appear = 1;
  }

  setScroll(progress: number) {
    this.scroll = progress;
  }

  setPointer(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;
  }

  resize(width: number, height: number) {
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    // На узком экране отодвигаем камеру, чтобы зерно не обрезалось.
    this.camera.position.z = this.camera.aspect < 0.8 ? 11 : 9;
    this.camera.updateProjectionMatrix();
    if (!this.running) this.renderOnce();
  }

  renderOnce() {
    this.update(0, this.clock.elapsedTime);
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    if (this.running || !this.animated || this.disposed) return;
    this.running = true;
    this.clock.start();
    this.frame = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    this.clock.stop();
    cancelAnimationFrame(this.frame);
  }

  dispose() {
    this.stop();
    this.disposed = true;
    this.field?.dispose();
    for (const item of this.disposables) item.dispose();
    this.renderer.dispose();
    // В dev React монтирует компонент дважды — освобождаем контекст сразу.
    this.renderer.forceContextLoss();
  }

  private tick = () => {
    if (!this.running) return;
    this.frame = requestAnimationFrame(this.tick);
    // Ограничение шага: после возврата на вкладку зёрна не «телепортируются».
    const dt = Math.min(this.clock.getDelta(), 1 / 20);
    this.update(dt, this.clock.elapsedTime);
    this.renderer.render(this.scene, this.camera);
  };

  private seedDrifters() {
    for (let i = 0; i < this.options.count; i += 1) {
      this.drifters.push({
        position: new Vector3(
          MathUtils.randFloatSpread(FIELD.width),
          MathUtils.randFloatSpread(FIELD.height),
          MathUtils.randFloat(FIELD.depthFar, FIELD.depthNear),
        ),
        rotation: new Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ),
        spin: new Vector3(
          MathUtils.randFloatSpread(1.2),
          MathUtils.randFloatSpread(1.2),
          MathUtils.randFloatSpread(0.6),
        ),
        scale: MathUtils.randFloat(0.16, 0.4),
        speed: MathUtils.randFloat(0.18, 0.45),
      });
    }
  }

  private update(dt: number, time: number) {
    const field = this.field;
    if (!field) return;

    this.appear = Math.min(1, this.appear + dt / 1.8);
    const shown = easeOutCubic(this.appear);

    const p = this.pointer;
    p.sx = damp(p.sx, p.x, 2.5, dt);
    p.sy = damp(p.sy, p.y, 2.5, dt);
    this.scrollSmooth = damp(this.scrollSmooth, this.scroll, 6, dt);
    const s = this.scrollSmooth;

    // Главное зерно: медленно вращается, тянется за курсором,
    // а при прокрутке закручивается и улетает на камеру.
    const { position, scale } = this.placement;
    this.heroPivot.rotation.set(
      0.35 + Math.sin(time * 0.5) * 0.12 + p.sy * 0.35 + s * 1.4,
      time * 0.22 + p.sx * 0.6 + s * Math.PI * 1.5,
      -0.35 + Math.sin(time * 0.35) * 0.08,
    );
    this.heroPivot.position.set(
      position.x - s * 1.2,
      position.y + Math.sin(time * 0.8) * 0.12 + s * 1.6,
      position.z + s * 4.5,
    );
    this.heroPivot.scale.setScalar(Math.max(0.001, scale * shown));

    // Фоновые зёрна: падают, вращаются и при прокрутке разлетаются к зрителю.
    const fall = 1 + s * 5;
    const halfHeight = FIELD.height / 2;
    this.drifters.forEach((bean, index) => {
      bean.position.y -= bean.speed * fall * dt;
      if (bean.position.y < -halfHeight) bean.position.y += FIELD.height;
      bean.rotation.x += bean.spin.x * dt;
      bean.rotation.y += bean.spin.y * dt;
      bean.rotation.z += bean.spin.z * dt;

      this.dummy.position.set(
        bean.position.x * (1 + s * 0.5),
        bean.position.y,
        bean.position.z + s * 6,
      );
      this.dummy.rotation.copy(bean.rotation);
      this.dummy.scale.setScalar(bean.scale * shown);
      this.dummy.updateMatrix();
      field.setMatrixAt(
        index,
        this.tmp.multiplyMatrices(this.dummy.matrix, this.base),
      );
    });
    field.instanceMatrix.needsUpdate = true;

    this.camera.position.x = p.sx * 0.45;
    this.camera.position.y = -p.sy * 0.3;
    this.camera.lookAt(0, 0, 0);
  }
}

function collectTextures(material: MeshStandardMaterial): Texture[] {
  return [
    material.map,
    material.normalMap,
    material.roughnessMap,
    material.metalnessMap,
    material.aoMap,
    material.emissiveMap,
  ].filter((texture): texture is Texture => Boolean(texture));
}
