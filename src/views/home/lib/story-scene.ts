import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
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

import { gsap, ScrollTrigger } from "@/shared/lib/gsap";

/**
 * turn — предмет «Пути зерна»: поворачивается, проезжая мимо зрителя;
 * arrive — заказ приезжает издалека, пока листаются шаги;
 * pour — стакан наполняется, в конце падает лёд.
 */
type Behavior = "turn" | "arrive" | "pour";

export type StoryModel = {
  url: string;
  behavior: Behavior;
  /** Поворот «лицом» к зрителю, радианы. */
  yaw?: number;
  /** Множитель размера относительно своего места в вёрстке. */
  scale?: number;
  /** Номер в пути зерна: между соседними номерами пересыпаются зёрна. */
  flow?: number;
};

// Часть модели, которую двигаем отдельно (напиток, лёд).
type Part = { node: Object3D; y: number; scaleY: number; floor: number };

type Item = {
  slot: HTMLElement;
  model: StoryModel;
  pivot: Group;
  center: Vector3;
  radius: number;
  /** Положение на экране вдоль ленты: −1 … 1, ноль — центр. */
  offset: number;
  /** Насколько место модели вошло в экран снизу: 0 … 1. */
  progress: number;
  /** progress со сглаживанием: колесо прокручивает рывками по ~100 px. */
  eased: number;
  visible: boolean;
  requested: boolean;
  loaded: boolean;
  appear: number;
  phase: number;
  liquid?: Part;
  ice?: Part;
};

type Bean = { phase: number; speed: number; jitter: Vector3; spin: Vector3 };

const FOV = 25;
const DISTANCE = 10;
const MAX_PIXEL_RATIO = 1.5;
// Запас холста сверху и снизу, доля экрана: браузер прокручивает страницу
// в своём потоке на кадр-два раньше перерисовки, и края не должны оголяться.
const OVERSCAN = 0.2;
const BEANS_PER_STREAM = 14;
// Сырое зерно светлее и зеленее обжаренного: множитель поверх текстуры.
const RAW_TINT = new Color(1.7, 1.95, 1.05);
const ROASTED_TINT = new Color(1, 1, 1);

const clamp01 = (value: number) => MathUtils.clamp(value, 0, 1);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * Одна 3D-сцена на всю главную. Холст прилипает к экрану, а предметы каждый
 * кадр встают на свои места в вёрстке (`data-model-slot`), поэтому едут
 * вместе со страницей. Движение завязано на прокрутку: зёрна пересыпаются
 * от шага к шагу, заказ приезжает, стакан наполняется.
 */
export class StoryScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FOV, 1, 0.1, 60);
  private readonly loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  private readonly items: Item[] = [];
  private readonly beans: Bean[] = [];
  private readonly pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  private readonly dummy = new Object3D();
  private readonly matrix = new Matrix4();
  private readonly from = new Vector3();
  private readonly to = new Vector3();
  private readonly control = new Vector3();
  private readonly disposables: { dispose(): void }[] = [];

  private beanBase = new Matrix4();
  private stream?: InstancedMesh;
  private streamCount = 0;

  private disposed = false;
  private drawn = false;
  private time = 0;
  private flowTime = 0;
  private scrollY = 0;
  private boost = 0;
  private width = 0;
  private height = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly animated: boolean,
  ) {
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO),
    );
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    const pmrem = new PMREMGenerator(this.renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = environment;
    this.scene.environmentIntensity = 1.1;
    this.disposables.push(environment);

    const key = new DirectionalLight(0xffe2c4, 3.2);
    key.position.set(3, 5, 6);
    const rim = new DirectionalLight(0xd9a066, 5);
    rim.position.set(-5, 3, -4);
    this.scene.add(key, rim, new AmbientLight(0xede6da, 0.45));

    this.camera.position.set(0, 0, DISTANCE);
    this.scrollY = window.scrollY;

    // Холст едет вместе со страницей, а не прилипает к экрану: прилипший
    // слой браузер сдвигает раньше, чем мы перерисуем модели, и они дёргаются.
    Object.assign(canvas.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "100%",
      height: `${100 * (1 + 2 * OVERSCAN)}lvh`,
      willChange: "transform",
    });

    // Рисуем из тикера GSAP, после его твинов: к этому моменту ScrollTrigger
    // уже сдвинул вёрстку в этом кадре, и модели не отстают от мест на кадр.
    if (animated) {
      window.addEventListener("pointermove", this.onPointer, { passive: true });
      gsap.ticker.add(this.tick);
    } else {
      // Без анимаций сцена статична: перерисовываем только при прокрутке.
      window.addEventListener("scroll", this.requestStill, { passive: true });
      window.addEventListener("resize", this.requestStill);
      this.requestStill();
    }
  }

  add(slot: HTMLElement, model: StoryModel) {
    const pivot = new Group();
    pivot.visible = false;
    this.scene.add(pivot);
    this.items.push({
      slot,
      model,
      pivot,
      center: new Vector3(),
      radius: 0,
      offset: 0,
      progress: 0,
      eased: 0,
      visible: false,
      requested: false,
      loaded: false,
      appear: this.animated ? 0 : 1,
      phase: this.items.length * 1.7,
    });
  }

  /** Зерно для потоков между шагами — та же модель, что в hero. */
  loadBeans(url: string) {
    if (!this.animated) return;
    this.loader
      .loadAsync(url)
      .then((gltf) => {
        if (this.disposed) return;
        let source: Mesh | undefined;
        gltf.scene.traverse((node) => {
          if (!source && node instanceof Mesh) source = node;
        });
        if (!source) return;

        gltf.scene.updateMatrixWorld(true);
        const sphere = new Box3()
          .setFromObject(source)
          .getBoundingSphere(new Sphere());
        this.beanBase = new Matrix4()
          .makeScale(1 / sphere.radius, 1 / sphere.radius, 1 / sphere.radius)
          .multiply(
            new Matrix4().makeTranslation(sphere.center.clone().negate()),
          )
          .multiply(source.matrixWorld);

        const streams = Math.max(0, this.flowItems().length - 1);
        this.streamCount = streams * BEANS_PER_STREAM;
        if (!this.streamCount) return;

        const material = source.material as MeshStandardMaterial;
        const stream = new InstancedMesh(
          source.geometry,
          material,
          this.streamCount,
        );
        stream.frustumCulled = false;
        for (let index = 0; index < this.streamCount; index += 1) {
          // Первый поток — сырое зерно, после ростера оно уже обжарено.
          const raw = index < BEANS_PER_STREAM;
          stream.setColorAt(index, raw ? RAW_TINT : ROASTED_TINT);
          this.beans.push({
            phase: Math.random(),
            speed: MathUtils.randFloat(0.8, 1.25),
            jitter: new Vector3(
              MathUtils.randFloatSpread(1),
              MathUtils.randFloatSpread(1),
              MathUtils.randFloatSpread(1),
            ),
            spin: new Vector3(
              MathUtils.randFloatSpread(5),
              MathUtils.randFloatSpread(5),
              MathUtils.randFloatSpread(3),
            ),
          });
        }
        this.disposables.push(
          source.geometry,
          material,
          ...collectTextures(material),
        );
        return this.renderer
          .compileAsync(stream, this.camera, this.scene)
          .then(() => {
            if (this.disposed) return;
            this.stream = stream;
            this.scene.add(stream);
          });
      })
      .catch(() => undefined);
  }

  dispose() {
    this.disposed = true;
    gsap.ticker.remove(this.tick);
    gsap.ticker.remove(this.drawStill);
    window.removeEventListener("pointermove", this.onPointer);
    window.removeEventListener("scroll", this.requestStill);
    window.removeEventListener("resize", this.requestStill);
    this.scene.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      const material = node.material as MeshStandardMaterial;
      node.geometry.dispose();
      for (const texture of collectTextures(material)) texture.dispose();
      material.dispose();
    });
    this.stream?.dispose();
    for (const item of this.disposables) item.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  private flowItems() {
    return this.items
      .filter((item) => item.model.flow !== undefined)
      .sort((a, b) => (a.model.flow ?? 0) - (b.model.flow ?? 0));
  }

  private load(item: Item) {
    item.requested = true;
    this.loader
      .loadAsync(item.model.url)
      .then((gltf) => {
        if (this.disposed) return;
        // Геометрия квантована: без матриц узлов размеры модели не настоящие.
        gltf.scene.updateMatrixWorld(true);

        gltf.scene.traverse((node) => {
          if (!(node instanceof Mesh)) return;
          const material = node.material as MeshStandardMaterial;
          if (material.name === "latte") item.liquid = part(node);
          if (material.name === "ice") item.ice = part(node);
          tuneMaterial(node, material);
        });

        const sphere = new Box3()
          .setFromObject(gltf.scene)
          .getBoundingSphere(new Sphere());
        gltf.scene.position.copy(sphere.center).negate();
        const holder = new Group();
        holder.add(gltf.scene);
        // Приводим к единичной сфере: дальше размер задаёт место в вёрстке.
        holder.scale.setScalar(1 / sphere.radius);
        // Шейдеры — в фоне, до показа: иначе первый кадр с моделью подвисает.
        return this.renderer
          .compileAsync(holder, this.camera, this.scene)
          .then(() => holder);
      })
      .then((holder) => {
        if (this.disposed || !holder) return;
        item.pivot.add(holder);
        item.loaded = true;
        if (!this.animated) this.requestStill();
      })
      // Модель — украшение: без неё секция остаётся с текстом.
      .catch(() => undefined);
  }

  private onPointer = (event: PointerEvent) => {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  };

  // Один кадр в тикере GSAP; повторные запросы в том же кадре его не дублируют.
  private drawStill = () => {
    gsap.ticker.remove(this.drawStill);
    this.draw(0);
  };

  private requestStill = () => {
    gsap.ticker.add(this.drawStill);
  };

  private tick = (_time: number, deltaMs: number) => {
    if (this.disposed) return;
    // Ограничение шага: после возврата на вкладку ничего не «прыгает».
    const dt = Math.min(deltaMs / 1000, 1 / 20);
    this.time += dt;

    // Быстрая прокрутка разгоняет потоки зёрен — как бегущую строку.
    const scrollY = window.scrollY;
    const speed = dt > 0 ? Math.abs(scrollY - this.scrollY) / dt : 0;
    this.scrollY = scrollY;
    this.boost = MathUtils.damp(this.boost, Math.min(speed / 900, 3), 4, dt);
    this.flowTime += dt * (0.32 + this.boost * 0.5);

    this.draw(dt);
  };

  /**
   * Ставит холст на текущую прокрутку. Внутри закреплённой секции (pin)
   * вёрстка стоит на экране — туда же фиксируется и холст; в остальной
   * странице он лежит в документе и прокручивается вместе с моделями.
   */
  private place() {
    const canvas = this.canvas;
    const stage = canvas.parentElement;
    if (!stage) return;
    const fullHeight = canvas.offsetHeight;
    const overscan = Math.round((fullHeight * OVERSCAN) / (1 + 2 * OVERSCAN));
    const pinned = ScrollTrigger.getAll().some(({ pin }) => {
      // Смотрим на сам стиль: с anticipatePin закрепление ставится раньше isActive.
      if (!(pin instanceof HTMLElement) || pin.style.position !== "fixed")
        return false;
      return this.items.some((item) => pin.contains(item.slot));
    });

    let y = -overscan;
    if (pinned) {
      canvas.style.position = "fixed";
    } else {
      canvas.style.position = "absolute";
      // Не выходим за низ сцены: иначе холст удлиняет страницу.
      const room = (stage.parentElement?.offsetHeight ?? Infinity) - fullHeight;
      y = Math.min(y - stage.getBoundingClientRect().top, room);
    }
    canvas.style.transform = `translate3d(0, ${Math.round(y)}px, 0)`;
  }

  private draw(dt: number) {
    this.place();
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    if (!width || !height) return;
    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    // Сколько мировых единиц в одном CSS-пикселе на плоскости z = 0.
    const unit =
      (2 * DISTANCE * Math.tan(MathUtils.degToRad(FOV / 2))) / height;
    const flow = this.flowItems();
    const horizontal = this.isHorizontal(flow);
    // Ход анимаций считаем от экрана, а не от холста: холст выше экрана.
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;

    let anyVisible = false;
    for (const item of this.items) {
      const box = item.slot.getBoundingClientRect();
      const vx = box.left + box.width / 2;
      const vy = box.top + box.height / 2;
      const cx = vx - rect.left;
      const cy = vy - rect.top;
      item.center.set((cx - width / 2) * unit, -(cy - height / 2) * unit, 0);
      item.radius = (Math.min(box.width, box.height) / 2) * unit;
      item.offset = horizontal
        ? (vx - vw / 2) / (vw / 2)
        : (vy - vh / 2) / (vh / 2);
      item.progress = clamp01((vh * 0.95 - vy) / (vh * 0.5));
      // Впервые показанная модель сразу встаёт в нужное состояние.
      item.eased =
        item.visible && item.loaded
          ? MathUtils.damp(item.eased, item.progress, 8, dt)
          : item.progress;

      const near = box.bottom > -vh && box.top < vh * 2 && box.width > 0;
      if (near && !item.requested) this.load(item);
      item.visible =
        box.width > 0 &&
        box.bottom > -vh * 0.2 &&
        box.top < vh * 1.2 &&
        box.right > -vw * 0.2 &&
        box.left < vw * 1.2;
      anyVisible ||= item.visible && item.loaded;
    }

    if (!anyVisible) {
      // Вне сцены холст пустой и ничего не стоит.
      if (this.drawn) this.renderer.clear();
      this.drawn = false;
      return;
    }
    this.drawn = true;

    const p = this.pointer;
    p.sx = MathUtils.damp(p.sx, p.x, 3, dt);
    p.sy = MathUtils.damp(p.sy, p.y, 3, dt);

    for (const item of this.items) this.pose(item, dt);
    this.pour(flow, horizontal);
    this.renderer.render(this.scene, this.camera);
  }

  // Лента идёт вбок (desktop, секция закреплена) или вниз (телефон).
  private isHorizontal(flow: Item[]) {
    if (flow.length < 2) return true;
    const [a, b] = flow;
    return (
      Math.abs(b.center.x - a.center.x) > Math.abs(b.center.y - a.center.y)
    );
  }

  private pose(item: Item, dt: number) {
    const { pivot, model } = item;
    pivot.visible = item.visible && item.loaded;
    if (!pivot.visible) return;

    item.appear = Math.min(1, item.appear + dt / 0.9);
    const shown = easeOut(item.appear);
    const t = this.time + item.phase;
    const idle = this.animated ? 1 : 0;
    const p = this.pointer;
    const size = item.radius * (model.scale ?? 1) * 1.25;
    const yaw = model.yaw ?? 0;

    pivot.position.copy(item.center);
    pivot.position.y += Math.sin(t * 0.9) * 0.03 * size * idle;

    if (model.behavior === "turn") {
      // Предмет поворачивается, проезжая мимо, и крупнее всего в центре.
      const offset = item.offset * idle;
      const focus = 1 - 0.2 * Math.min(1, Math.abs(offset));
      pivot.rotation.set(p.sy * 0.15, yaw + offset * 1.1 + p.sx * 0.25, 0);
      pivot.scale.setScalar(Math.max(0.001, size * focus * shown));
    } else if (model.behavior === "arrive") {
      // Заказ едет издалека и докручивается к зрителю «лицом».
      const arrived = this.animated ? easeOut(item.eased) : 1;
      pivot.position.z = MathUtils.lerp(-16, 0, arrived);
      pivot.position.y -= (1 - arrived) * size * 1.2;
      pivot.rotation.set(
        p.sy * 0.15,
        yaw + (1 - arrived) * 5 + Math.sin(t * 0.5) * 0.3 * arrived * idle,
        (1 - arrived) * 0.35,
      );
      pivot.scale.setScalar(Math.max(0.001, size * shown));
    } else {
      // Напиток поднимается по стакану, под конец сверху падает лёд.
      const filled = this.animated ? clamp01(item.eased / 0.7) : 1;
      const dropped = this.animated ? clamp01((item.eased - 0.65) / 0.35) : 1;
      if (item.liquid) fill(item.liquid, Math.max(0.02, easeOut(filled)));
      if (item.ice) {
        const fall = 1 - easeOut(dropped);
        item.ice.node.position.y = item.ice.y + fall * 1.6;
        item.ice.node.visible = dropped > 0;
      }
      pivot.rotation.set(p.sy * 0.15, yaw + t * 0.3 * idle + p.sx * 0.25, 0);
      pivot.scale.setScalar(Math.max(0.001, size * shown));
    }
  }

  // Потоки зёрен между соседними шагами: виден тот, чьи концы сейчас у
  // центра экрана, — прокрутка «передаёт» зерно от предмета к предмету.
  private pour(flow: Item[], horizontal: boolean) {
    const stream = this.stream;
    if (!stream) return;
    const middle = 0;

    for (let segment = 0; segment < flow.length - 1; segment += 1) {
      const a = flow[segment];
      const b = flow[segment + 1];
      const start = horizontal ? a.center.x : -a.center.y;
      const end = horizontal ? b.center.x : -b.center.y;
      const span = end - start || 1;
      const reach = (middle - start) / span;
      const weight =
        clamp01(1.6 - Math.abs(reach - 0.5) * 2.4) *
        easeOut(a.appear) *
        easeOut(b.appear) *
        (a.loaded && b.loaded ? 1 : 0);

      // Зерно вылетает из верха одного предмета и падает в верх другого.
      this.from.copy(a.center);
      this.from.y += a.radius * 0.55;
      this.to.copy(b.center);
      this.to.y += b.radius * 0.6;
      const dx = Math.abs(this.to.x - this.from.x);
      const dy = Math.abs(this.to.y - this.from.y);
      this.control.addVectors(this.from, this.to).multiplyScalar(0.5);
      this.control.y += dx * 0.3;
      this.control.x += dy * 0.28;
      this.control.z += (a.radius + b.radius) * 0.4;
      const beanSize = (a.radius + b.radius) * 0.055;

      for (let index = 0; index < BEANS_PER_STREAM; index += 1) {
        const id = segment * BEANS_PER_STREAM + index;
        const bean = this.beans[id];
        const t = (this.flowTime * bean.speed + bean.phase) % 1;
        const k = 1 - t;
        // Квадратичная кривая Безье: дуга от предмета к предмету.
        this.dummy.position
          .copy(this.from)
          .multiplyScalar(k * k)
          .addScaledVector(this.control, 2 * k * t)
          .addScaledVector(this.to, t * t)
          .addScaledVector(bean.jitter, beanSize * 2.2 * Math.sin(Math.PI * t));
        this.dummy.rotation.set(
          bean.spin.x * this.flowTime,
          bean.spin.y * this.flowTime,
          bean.spin.z * this.flowTime,
        );
        const envelope =
          MathUtils.smoothstep(t, 0, 0.12) *
          (1 - MathUtils.smoothstep(t, 0.86, 1));
        this.dummy.scale.setScalar(beanSize * weight * envelope);
        this.dummy.updateMatrix();
        stream.setMatrixAt(
          id,
          this.matrix.multiplyMatrices(this.dummy.matrix, this.beanBase),
        );
      }
    }
    stream.instanceMatrix.needsUpdate = true;
  }
}

function part(node: Object3D): Part {
  const box = new Box3().setFromObject(node);
  const floor = node.parent
    ? node.parent.worldToLocal(new Vector3(0, box.min.y, 0)).y
    : box.min.y;
  return { node, y: node.position.y, scaleY: node.scale.y, floor };
}

// Сжатие по высоте от дна: дно остаётся на месте, верх опускается.
function fill(liquid: Part, amount: number) {
  liquid.node.scale.y = liquid.scaleY * amount;
  liquid.node.position.y = liquid.y * amount + liquid.floor * (1 - amount);
}

// Стекло и лёд в файле заданы только именем материала и прозрачностью:
// настоящее преломление слишком дорого, блики окружения дают тот же образ.
function tuneMaterial(node: Mesh, material: MeshStandardMaterial) {
  if (material.name === "glass") {
    material.transparent = true;
    material.opacity = 0.22;
    material.roughness = 0.03;
    material.envMapIntensity = 3;
    material.depthWrite = false;
    node.renderOrder = 2;
  } else if (material.name === "ice") {
    material.transparent = true;
    material.opacity = 0.6;
    material.roughness = 0.08;
    material.envMapIntensity = 2;
    material.depthWrite = false;
    node.renderOrder = 1;
  }
}

function collectTextures(material: MeshStandardMaterial): Texture[] {
  return [
    material.map,
    material.normalMap,
    material.roughnessMap,
    material.metalnessMap,
    material.emissiveMap,
  ].filter((texture): texture is Texture => Boolean(texture));
}
