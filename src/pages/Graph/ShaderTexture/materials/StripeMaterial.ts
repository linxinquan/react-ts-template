import type { ColorRepresentation } from 'three';
import { Color, ShaderMaterial } from 'three';

export interface StripeMaterialOption {
  backgroundColor?: ColorRepresentation;
  lineColor?: ColorRepresentation;
}
/**
 * @description 条纹材质
 */
export default class StripeMaterial extends ShaderMaterial {
  constructor(option?: StripeMaterialOption) {
    const options = {
      uniforms: {
        lineColor: {
          value: new Color(option?.lineColor || '#FFFFFF'),
        },
        backgroundColor: {
          value: new Color(option?.backgroundColor || '#fcd041'),
        },
        // 条纹倾斜程度
        uSlope: { value: 0.4 },
        // 条纹重复次数，用于控制粗细
        repeatTime: { value: 4.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
          vUv = uv;
        }
      `,
      fragmentShader: `
        uniform vec3 backgroundColor;
        uniform vec3 lineColor;
        uniform float uSlope;
        uniform float repeatTime;
        varying vec2 vUv;

        void main() {
          // 倾斜后的uv坐标
          vec2 slopeUv = vec2(vUv.x + uSlope * vUv.y, vUv.y);
          // 生成重复条纹
          vec3 color = mix(backgroundColor, lineColor, step(0.5, fract(slopeUv.x * repeatTime)));
          gl_FragColor = vec4(color, 1.0);
          #include <colorspace_fragment>
        }
      `,
    };
    super(options);
  }
}
