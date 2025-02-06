uniform vec3 color;
varying vec2 vUv;
void main() {
    gl_FragColor = vec4(color, 1.0 );

    float yPos = step(abs(vUv.y - 0.5), 0.4);
    float xPos = step(abs(vUv.x - 0.5), 0.4);
    gl_FragColor = mix(vec4(0.,0.,0.,1.),vec4(color,1.0), yPos * xPos);
}
