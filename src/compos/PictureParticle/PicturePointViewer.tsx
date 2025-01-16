import { useContext, useEffect } from 'react';
import { useCreation } from 'ahooks';
import { RendererContext, RendererViewerHOC } from '@/compos/RendererHOC';
import ParticleCreator from '@/compos/PictureParticle';

interface ViewerProps {
  imgUrl?: string;
  allPaths?: string[];
}

function Viewer({ imgUrl, allPaths }: ViewerProps) {
  const renderer = useContext(RendererContext);
  const creator = useCreation(() => new ParticleCreator(renderer), [renderer]);

  useEffect(() => () => creator.dispose(), []);

  useEffect(() => {
    if (allPaths) {
      creator.loadImgs(allPaths);
    }
  }, [allPaths]);

  useEffect(() => {
    if (imgUrl) {
      creator.updateGeometry(imgUrl);
    }
  }, [imgUrl]);

  // useEffect(() => {
  //   creator.createPoints(imgUrl);
  // }, [imgUrl]);

  return <div />;
}

export default RendererViewerHOC(Viewer);
