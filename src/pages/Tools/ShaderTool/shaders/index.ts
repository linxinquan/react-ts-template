import borderFragment from './border_fragment.glsl';
import borderVertex from './border_vertex.glsl';
import stripeFragment from './stripe_fragment.glsl';
import stripeVertex from './stripe_vertex.glsl';

const borderShader = { fragment: borderFragment, vertex: borderVertex };
const stripeShader = { fragment: stripeFragment, vertex: stripeVertex };

export { borderShader, stripeShader };
