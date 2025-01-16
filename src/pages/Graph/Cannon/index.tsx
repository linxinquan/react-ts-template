import { useEffect, useContext } from 'react';
import { useCreation } from 'ahooks';
import { useLoaderData } from 'react-router';
import { Object3D } from 'three';
import { RendererContext, RendererViewerHOC } from '@/compos/RendererHOC';
import CannonBuilder from './CannonBuilder';
import { IModels } from '@/utils/Loader';

function CannonViewer() {
  const renderer = useContext(RendererContext);
  const cannonBuilder = useCreation(() => new CannonBuilder(renderer), [renderer]);
  const data = useLoaderData<IModels>();

  useEffect(() => {
    const car = data['model-car'] as Object3D;
    const wheel = data['model-wheel'] as Object3D;
    cannonBuilder.addCar(car, wheel);
    return () => {
      cannonBuilder.dispose();
    };
  }, [cannonBuilder]);

  return (
    <div>
      <div>自由驾驶</div>
      <div>规划路线驾驶</div>
    </div>
  );
}
export default RendererViewerHOC(CannonViewer);
