import type { ColorRepresentation } from 'three';
import { Color, ShaderMaterial } from 'three';

export interface SpaceMaterialOption {
  backgroundColor?: ColorRepresentation;
  borderColor?: ColorRepresentation;
  borderWidth?: number;
  maxSpaceWidth?: number;
  height?: number;
  width: number;
}
const DefaultBackgroundColor = '#33b3f1';
const DefaultBorderColor = '#343332';
/**
 * @description 给定物体的宽度，生成能均分物体的间隔边框
  +----------------------------------------+
  |         |          |         |         |
  |         |          |         |         |
  |         |          |         |         |
  |         |          |         |         |
  |         |          |         |         |
  +----------------------------------------+
 * @param backgroundColor 物体颜色
 * @param borderColor 间隔边框颜色
 * @param borderWidth 间隔宽度 default 0.1
 * @param maxSpaceWidth 最大间距 default 3
 * @param height default 层高3.6
 * @param width necessary
 */

export default class SpaceMaterial extends ShaderMaterial {
  constructor(option: SpaceMaterialOption) {
    const { borderWidth = 0.1 } = option;
    // 获取间隔位置x坐标
    const spacePosition = SpaceMaterial.getSpacePosition(option.width, option.maxSpaceWidth);
    const options = {
      uniforms: {
        backgroundColor: {
          value: new Color(option.backgroundColor || DefaultBackgroundColor),
        },
        borderColor: {
          value: new Color(option.borderColor || DefaultBorderColor),
        },
        borderWidth: {
          value: borderWidth || 0.1,
        },
        height: {
          value: option.height || 3.6,
        },
        spaceArray: {
          value: spacePosition,
        },
      },
      vertexShader: `
      varying vec3 vPosition;
      void main() {
          vPosition = position;
          gl_Position =  projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
      uniform vec3 backgroundColor;
      uniform vec3 borderColor;
      varying vec3 vPosition;
      uniform float height;
      uniform float borderWidth;
      // 创建固定长度的数组
      ${`uniform float spaceArray[${spacePosition.length}];`}

      void main() {
        float lineColor = 0.0;
        for (int i = 0; i < spaceArray.length(); i++) {
          float xDist = abs(abs(vPosition.x) - spaceArray[i]);
          // 间隔边框
          lineColor = lineColor + step(xDist, borderWidth);
        }
        // 顶部底部的边框
        float zLineColor = step(height / 2.0 - borderWidth, abs(vPosition.z));
        // 限制在0-1之间
        lineColor = clamp(lineColor + zLineColor, 0.0, 1.0);
        gl_FragColor = mix(vec4(backgroundColor, 0.2), vec4(borderColor, 1.0), lineColor);
        #include <colorspace_fragment>
      }`,
      transparent: true,
    };
    super(options);
  }

  /**
   * @description 在不超过最大间距前提下，计算最大间隔数量，并返回每个间隔位置x坐标
   */
  private static getSpacePosition(width: number, maxSpaceWidth = 3) {
    const defaultSpaceCount = 1;
    let spaceCount = defaultSpaceCount;
    let spaceWidth = width / spaceCount;
    while (spaceWidth > maxSpaceWidth) {
      spaceCount += 1;
      spaceWidth = width / spaceCount;
    }
    const spacePosition = Array.from(
      { length: spaceCount },
      // 将坐标原点变为width中点
      (x, i) => spaceWidth * (i + 1) - width / 2,
    ).filter((x) => x >= 0);
    return spacePosition;
  }
}
