import { useContext, useEffect } from 'react';
import { AxesHelper, Object3D } from 'three';
import { useLoaderData } from 'react-router';
import { RendererContext, RendererViewerHOC } from '@/compos/RendererHOC';
import { IModels } from '@/utils/Loader';

function LoaderViewer() {
  const renderer = useContext(RendererContext);
  const data = useLoaderData<IModels>();

  useEffect(() => {
    const wheel = data['model-wheel'] as Object3D;
    renderer.add(new AxesHelper(20), wheel);
    renderer.render();
  }, []);
  return <div />;
}

export default RendererViewerHOC(LoaderViewer);
