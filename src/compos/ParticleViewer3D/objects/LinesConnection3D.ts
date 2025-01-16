import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  LineBasicMaterial,
  LineSegments,
} from 'three';

interface LinesConnectOptions {
  /* 可连接距离 */
  minDistance: number;
  /* 是否限制连接 */
  limitConnections: boolean;
  /* 单向最大连接数 */
  maxConnections: number;
  color: number | string;
}

const DefaultOptions = {
  minDistance: 40,
  limitConnections: true,
  maxConnections: 4,
  color: 0xffffff,
};

export default class LinesConnection3D extends LineSegments {
  private particleCount: number;

  private positions: Float32Array;

  private colors: Float32Array;

  private options: LinesConnectOptions;

  constructor(particleCount: number, options: Partial<LinesConnectOptions> = {}) {
    super();
    this.options = { ...DefaultOptions, ...options };
    this.particleCount = particleCount;
    const segments = particleCount * particleCount;
    this.positions = new Float32Array(segments * 3);
    this.colors = new Float32Array(segments * 3);
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new BufferAttribute(this.positions, 3).setUsage(DynamicDrawUsage),
    );
    geometry.setAttribute('color', new BufferAttribute(this.colors, 3).setUsage(DynamicDrawUsage));
    geometry.computeBoundingSphere();

    const material = new LineBasicMaterial({
      blending: AdditiveBlending,
      transparent: true,
      opacity: 0,
      vertexColors: true,
    });
    this.geometry = geometry;
    this.geometry.attributes.position.needsUpdate = true;
    this.material = material;
  }

  updateOptions(options: Partial<LinesConnectOptions> = {}) {
    this.options = { ...this.options, ...options };
  }

  updateGeometry(particlePositions: Float32Array) {
    let vertexPos = 0;
    let colorPos = 0;
    let numConnected = 0;
    const particlesData = Array.from({ length: this.particleCount }, () => ({ numConnections: 0 }));
    const lineColor = new Color(this.options.color);
    for (let i = 0; i < this.particleCount; i += 1) {
      const particleData = particlesData[i];
      for (let j = i + 1; j < this.particleCount; j += 1) {
        const particleDataB = particlesData[j];

        // 超过限制连接数跳出循环
        if (
          this.options.limitConnections &&
          particleDataB.numConnections >= this.options.maxConnections
        ) {
          continue;
        }

        const dx = particlePositions[i * 3] - particlePositions[j * 3];
        const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
        const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
        const distSquared = dx * dx + dy * dy + dz * dz;
        const minDistanceSquared = this.options.minDistance * this.options.minDistance;
        // 当距离满足最短距离，生成线段的两个端点
        if (distSquared < minDistanceSquared) {
          particleData.numConnections += 1;
          particleDataB.numConnections += 1;

          this.positions[vertexPos] = particlePositions[i * 3];
          this.positions[vertexPos + 1] = particlePositions[i * 3 + 1];
          this.positions[vertexPos + 2] = particlePositions[i * 3 + 2];

          this.positions[vertexPos + 3] = particlePositions[j * 3];
          this.positions[vertexPos + 4] = particlePositions[j * 3 + 1];
          this.positions[vertexPos + 5] = particlePositions[j * 3 + 2];

          // 线段越长，透明度越高
          const alpha = 1.0 - distSquared / minDistanceSquared;

          this.colors[colorPos] = alpha * lineColor.r;
          this.colors[colorPos + 1] = alpha * lineColor.g;
          this.colors[colorPos + 2] = alpha * lineColor.b;

          this.colors[colorPos + 3] = alpha * lineColor.r;
          this.colors[colorPos + 4] = alpha * lineColor.g;
          this.colors[colorPos + 5] = alpha * lineColor.b;

          vertexPos += 6;
          colorPos += 6;
          numConnected += 1;
        }
      }
    }
    this.geometry.setAttribute(
      'position',
      new BufferAttribute(this.positions, 3).setUsage(DynamicDrawUsage),
    );
    this.geometry.setAttribute(
      'color',
      new BufferAttribute(this.colors, 3).setUsage(DynamicDrawUsage),
    );
    this.geometry.setDrawRange(0, numConnected * 2);
    this.geometry.attributes.position.needsUpdate = true;
  }
}
