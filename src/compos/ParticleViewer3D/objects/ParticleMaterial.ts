import { AdditiveBlending, Color, ShaderMaterial } from 'three';

export interface ParticleMaterialOptions {
  fogNear?: number;
  fogFar?: number;
  pointSize?: number;
}

/**
 * @description 粒子材质，渲染为圆形的粒子，离相机越近粒子越大。
 * @param options.fogNear 线性雾效果，雾开始位置
 * @param options.fogFar 线性雾效果，雾结束位置
 * @param options.pointSize 粒子大小
 */

export default class ParticleMaterial extends ShaderMaterial {
  constructor(options?: ParticleMaterialOptions) {
    const option = {
      transparent: true,
      blending: AdditiveBlending,
      uniforms: {
        color: { value: new Color(0xffffff) },
        pointSize: { value: options?.pointSize || 4.0 },
        fogColor: { value: new Color(0x000000) },
        fogNear: { value: options?.fogNear || 1 },
        fogFar: { value: options?.fogFar || 2000 },
      },
      vertexShader: `
              varying float fogDepth;
              uniform float pointSize;
              void main() {
                vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
                fogDepth = - mvPosition.z;

                gl_PointSize = pointSize * min(abs(cameraPosition.z / -mvPosition.z), 3.0);

                gl_Position = projectionMatrix * mvPosition;
              }`,
      fragmentShader: `
              uniform vec3 color;
              uniform vec3 fogColor;
              uniform float fogNear;
              uniform float fogFar;
              varying float fogDepth;
              void main() {
                // 计算雾的混合因子
                float fogFactor = smoothstep(fogNear, fogFar, fogDepth);

                // 画圆
                if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
                gl_FragColor = mix(vec4( color, 0.8 ), vec4(fogColor, 1.0), fogFactor);
                #include <colorspace_fragment>
              }
              `,
    };
    super(option);
  }
}
