attribute vec3 initialPosition;
attribute vec3 velocity;
attribute float lifetime;
uniform float pointSize;
uniform float uProgress;
varying float vDepth;

void main() {
    vDepth = position.z;
    vec3 pos = mix(initialPosition, position, uProgress);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0 );
    gl_PointSize = pointSize;
}