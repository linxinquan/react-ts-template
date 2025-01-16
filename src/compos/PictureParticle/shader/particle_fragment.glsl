varying vec3 fragColor;
varying float vAlpha;

void main() {
    gl_FragColor = vec4(fragColor, vAlpha );
}