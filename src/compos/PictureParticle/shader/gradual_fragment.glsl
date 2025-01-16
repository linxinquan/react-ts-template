uniform vec3 uColor;
varying float vDepth;

vec3 getColor(float depth, vec3 color) {
    float value = depth / -0.3 * 1.0;
    float r = clamp(color.r - value * 5.0/255.0, 0.0, 1.0);
    float g = clamp(color.g - value * 5.0/255.0, 0.0, 1.0);
    float b = clamp(color.b - value * 5.0/255.0, 0.0, 1.0);
    return vec3(r, g, b);
}

void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    float mask = smoothstep(0.5,0.499,dist);
    
    gl_FragColor = vec4(getColor(vDepth, uColor), 1.0 * mask );
}