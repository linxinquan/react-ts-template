import type { ColorRepresentation } from 'three';
import { Color, ShaderMaterial } from 'three';

export interface BorderMaterialOption {
  backgroundColor?: ColorRepresentation;
  borderColor?: ColorRepresentation;
  borderWidth?: number;
  width: number;
  height: number;
}
const DefaultBackgroundColor = '#fcd041';
const DefaultBorderColor = '#FFFFFF';
/**
 * @description 给定物体的宽高，生成指定边距的边框；仅支持xy平面
 * @param backgroundColor 物体颜色
 * @param borderColor 边框颜色
 * @param borderWidth 边距 default 0.1
 * @param width necessary
 * @param height necessary
 */
export default class BorderMaterial extends ShaderMaterial {
  constructor(option: BorderMaterialOption) {
    const options = {
      uniforms: {
        backgroundColor: {
          value: new Color(option.backgroundColor || DefaultBackgroundColor),
        },
        borderColor: {
          value: new Color(option.borderColor || DefaultBorderColor),
        },
        borderWidth: {
          value: option.borderWidth || 0.1,
        },
        width: {
          value: option.width || 0.0,
        },
        height: {
          value: option.height || 0.0,
        },
      },
      vertexShader: `
                    varying vec3 vPosition;
                    void main() {
                        vPosition = position;
                        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
                    }`,
      fragmentShader: `
                    varying vec3 vPosition;
                    uniform vec3 backgroundColor;
                    uniform vec3 borderColor;
                    uniform float width;
                    uniform float height;
                    uniform float borderWidth;
                    void main() {
                        float x = width / 2.0 - borderWidth;
                        float y = height / 2.0 - borderWidth;
                        float yPos = step(abs(vPosition.y), y);
                        float xPos = step(abs(vPosition.x), x);
                        gl_FragColor = mix(vec4(borderColor, 1.0), vec4(backgroundColor, 1.0), yPos * xPos);
                        #include <colorspace_fragment>
                    }`,
    };
    super(options);
  }
}
