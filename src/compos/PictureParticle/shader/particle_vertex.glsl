attribute vec3 color;
attribute float lifetime;
attribute vec3 velocity;
attribute vec3 initialPosition;
uniform float pointSize;
uniform float lifeCycle;
uniform float time;
uniform float updateProbability;
varying vec3 fragColor;
varying float vAlpha;

void main() {
    fragColor = color;
    float life = mod(lifetime + time, lifeCycle);
    vAlpha = 1.0;
    vec3 pos = position;
    float ps = pointSize;
     if (lifetime > updateProbability) {
        pos -= velocity * life; 
        vAlpha = 1.0 - life / lifeCycle;
        ps = vAlpha * pointSize;
    }

    gl_PointSize = ps;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}