import { Color, Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from 'three';

interface CheckerBoardOption {
  width: number;
  height: number;
  squareSize: number;
}

const DefaultOptions = {
  width: 600,
  height: 90,
  squareSize: 18,
};

export default class CheckerBoard3D extends Mesh {
  private options: CheckerBoardOption;

  constructor(options = DefaultOptions) {
    super();
    this.options = options;
    const { width, height } = this.options;
    this.geometry = new PlaneGeometry(width, height);
    this.material = new ShaderMaterial({
      transparent: true,
      uniforms: {
        opacity: { value: 0 },
        squareColor: { value: new Color(0xffffff) },
        highLightCoord: { value: new Vector2() }, // 随机生成一个坐标
        highLightOpacity: { value: 0.08 },
        planeSize: { value: this.getPlaneSize() },
        fogColor: { value: new Color(0x0c111f) },
      },
      vertexShader: `
      varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
      fragmentShader: `
          varying vec2 vUv;
          uniform vec3 squareColor;
          uniform vec3 fogColor;
          uniform vec2 highLightCoord;
          uniform vec2 planeSize;
          uniform float opacity;
          uniform float highLightOpacity;
          
          void main() {
            float fogFactor = smoothstep(0.8, 1.0, vUv.y);
            vec2 uv = vUv * planeSize;
            vec2 grid = floor(uv);
            bool isEven = mod(grid.x + grid.y, 2.0) == 0.0;
            // x+y为偶数的上色
            if(opacity > 0.0 && isEven) {
              float alpha = grid == highLightCoord ? highLightOpacity : opacity;
              gl_FragColor = mix(vec4(squareColor, alpha), vec4(fogColor, opacity), fogFactor);
            } else {
              discard;
            }
            #include <colorspace_fragment>
          }
        `,
    });
  }

  getPlaneSize() {
    const { width, height, squareSize } = this.options;
    const squareWidth = squareSize * 4;
    return new Vector2(width / squareWidth, height / squareSize);
  }
}
