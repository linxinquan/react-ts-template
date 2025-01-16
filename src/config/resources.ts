interface IResource {
  name: string;
  path: string;
}
const resources: IResource[] = [
  {
    name: 'model-car',
    path: '/models/car.glb',
  },
  {
    name: 'model-wheel',
    path: '/models/wheel.glb',
  },
];

export { resources };
export type { IResource };
