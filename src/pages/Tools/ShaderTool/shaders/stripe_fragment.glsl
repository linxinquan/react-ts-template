uniform vec3 color;
varying vec2 vUv;

void main() {
    float uSlope = 0.4;
    float repeatTime = 4.;
    // 倾斜后的uv坐标
    vec2 slopeUv = vec2(vUv.x + uSlope * vUv.y, vUv.y);
    vec3 lineColor = vec3(1.,1.,1.);
    // 生成重复条纹
    vec3 color = mix(color, lineColor, step(0.5, fract(slopeUv.x * repeatTime)));
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
}