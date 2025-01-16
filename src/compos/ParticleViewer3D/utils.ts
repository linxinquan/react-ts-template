import { Color } from 'three';

export function transformCoordInLimit(coord: number, step: number, limit: number) {
  let transformed = coord;
  if (Math.abs(coord) > Math.abs(limit)) {
    transformed = -limit;
  }
  transformed += step;
  return transformed;
}

export function createDarkMaskShader() {
  return {
    uniforms: {
      tDiffuse: {
        value: null,
      },
      maskColor: {
        value: new Color(0x000000),
      },
      maskAlpha: {
        value: 0.1,
      },
      markRadius: {
        value: 0.1,
      },
      smoothSize: {
        value: 0.8,
      },
      resolution: { value: null },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }`,
    fragmentShader: `
        uniform float maskAlpha;
        uniform vec3 maskColor;
        uniform float markRadius;
        uniform float smoothSize;

        uniform sampler2D tDiffuse;

        varying vec2 vUv;

        float sdfCircle(vec2 coord, vec2 center, float radius)
        {
        	vec2 offset = coord - center;
        	return sqrt((offset.x * offset.x) + (offset.y * offset.y)) - radius;
        }

        void main() {
        	vec4 texel = texture2D(tDiffuse, vUv);
          float sdfValue = sdfCircle(vUv, vec2(0.5, 0.5), markRadius);
        	if (sdfValue > 0.0 || vUv.y > 0.9){
        		float a = smoothstep(0.0, smoothSize, sdfValue);
          	gl_FragColor = mix(texel, vec4(maskColor, 1.0), a);
        	} else{
         		gl_FragColor = texel;
        	}
          #include <colorspace_fragment>
        }
      `,
  };
}
