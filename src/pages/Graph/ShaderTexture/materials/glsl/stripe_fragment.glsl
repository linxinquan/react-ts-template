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