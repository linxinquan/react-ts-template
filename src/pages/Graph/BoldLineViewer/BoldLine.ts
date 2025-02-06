import polylineNormals from 'polyline-normals';
import {
  BufferGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  Uint16BufferAttribute,
} from 'three';
import RendererCore from '@/utils/RendererCore';

/*
 本质是mesh
 加粗线段
 支持虚线
 支持渐变色
 支持纹理
*/
export default class BoldLine {
  renderer: RendererCore;

  lineMesh?: Mesh;

  material?: ShaderMaterial;

  // gui: GUI;

  // guiParams: {
  //   color:string;
  //   endColor:string;

  // }

  time: number;

  constructor(renderer: RendererCore) {
    this.renderer = renderer;

    const geom = new PlaneGeometry(20, 100);
    const mesh = new Mesh(geom, new MeshBasicMaterial({ color: '#c1c1c1' }));
    mesh.position.z = -1;
    this.renderer.add(mesh);
    this.renderer.render();
    this.time = 0;
  }

  clean() {
    this.renderer.cleanup(this.lineMesh);
    this.time = 0;
    this.renderer.cancelAnimate();
  }

  draw(points: number[][]) {
    const geom = BoldLine.createGeometry(points);
    const material = BoldLine.createMaterial();
    this.material = material;
    const mesh = new Mesh(geom, material);
    const canvas = BoldLine.createRainbow();
    // Create texture from canvas and set it in material uniforms
    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    material.uniforms.map.value = texture;
    this.lineMesh = mesh;
    this.renderer.add(mesh);
    this.renderer.render();
    this.time = 0;

    // this.gui.add(this.)
    this.renderer.animate(this.animation.bind(this));
  }

  static createRainbow() {
    // Create a canvas texture with rainbow colors
    const canvas = document.createElement('canvas');
    canvas.width = 20;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create rainbow gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#FF0000'); // Red
      gradient.addColorStop(0.17, '#FF7F00'); // Orange
      gradient.addColorStop(0.33, '#FFFF00'); // Yellow
      gradient.addColorStop(0.5, '#00FF00'); // Green
      gradient.addColorStop(0.67, '#0000FF'); // Blue
      gradient.addColorStop(0.83, '#4B0082'); // Indigo
      gradient.addColorStop(0.95, '#8F00FF'); // Violet
      gradient.addColorStop(1, '#FF0000'); // Red

      // Fill canvas with gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    return canvas;
  }

  animation() {
    this.time += 0.01;
    if (this.material) {
      this.material.uniforms.time.value = this.time;
    }
  }

  static createMaterial() {
    const material = new ShaderMaterial({
      uniforms: {
        color: { value: new Color('#0000ff') },
        endColor: { value: new Color('#ffffff') },
        time: { value: 0 },
        map: { value: null }, // 添加贴图变量
        dash: { value: false },
      },
      vertexShader: `
      attribute float lineMiter;
      attribute vec2 lineNormal; 
      attribute float pDistance;
      attribute float allDistance;
      varying float lineU;
      varying float lineAll;
      varying vec2 vUv;

      void main() {
        float thickness = 6.0;
        lineU = pDistance;
        lineAll = allDistance;
        vUv = uv;
        vec3 pointPos = position.xyz + vec3(lineNormal * thickness / 2.0 * lineMiter, 0.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pointPos, 1.0);
      }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 endColor;
        uniform float time;
        uniform sampler2D map;
        uniform bool dash; 
        varying float lineU;
        varying float lineAll;
        varying vec2 vUv;

        void main() {
            float flowOffset = (sin(time + lineU/lineAll * 6.28) + 1.0) * 0.5;
            vec3 aColor = mix(color, endColor, flowOffset);
            float dashSize = 3.;
            float gapSize = 1.;
            // 虚线
            float offset = time * 2.0;
            if(dash && mod(lineU + offset, (dashSize + gapSize)) > dashSize) {
              discard;
            }
           
            // 如果有贴图就使用贴图颜色，否则使用aColor
            // 给纹理采样添加流动效果
            vec2 flowUV = vUv;
            flowUV.y = mod(flowUV.y + time * 0.5, 1.0); // 纹理Y方向流动
            vec4 texColor = texture2D(map, flowUV);
            float len = length(texColor);
            if ( len > 0.) {
              gl_FragColor = vec4(texColor.rgb, 1.0);
            } else {
              gl_FragColor = vec4(aColor, 1.0);
            }
        }
      `,
    });
    return material;
  }

  static createGeometry(points: number[][]) {
    const normalsByPolyline: [number[], number][] = polylineNormals(points);
    const indices: number[] = [];
    const positions: number[][] = [];
    const lineDistance = [];
    const uvs: number[] = [];
    let distance = 0;
    let index = 0;
    for (let i = 0; i < points.length; i += 1) {
      const idx = index;
      const point = points[i];
      positions.push(point, point);
      // 添加UV坐标
      const v = i / (points.length - 1);
      uvs.push(0, v, 1, v);
      if (i !== points.length - 1) {
        indices.push(idx + 2, idx + 1, idx + 0, idx + 3, idx + 1, idx + 2);
      }
      let d = 0;
      if (i > 0) {
        const prevP = points[i - 1];
        d = Math.sqrt(
          (prevP[0] - point[0]) * (prevP[0] - point[0]) +
            (prevP[1] - point[1]) * (prevP[1] - point[1]),
        );
      }
      distance += d;
      lineDistance.push(distance, distance);
      index += 2;
    }
    const lineNormal: number[] = [];
    const lineMiter: number[] = [];
    normalsByPolyline.forEach((item) => {
      const norm = item[0];
      const miter = item[1];
      lineNormal.push(norm[0], norm[1], norm[0], norm[1]);
      lineMiter.push(-miter, miter);
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions.flat(), 3));
    geometry.setAttribute('lineNormal', new Float32BufferAttribute(lineNormal, 2));
    geometry.setAttribute('lineMiter', new Float32BufferAttribute(lineMiter, 1));
    geometry.setAttribute('pDistance', new Float32BufferAttribute(lineDistance, 1));
    geometry.setAttribute(
      'allDistance',
      new Float32BufferAttribute(
        lineDistance.map(() => distance),
        1,
      ),
    );
    geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    geometry.setIndex(new Uint16BufferAttribute(indices, 1));
    return geometry;
  }
}
