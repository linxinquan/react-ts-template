import { useContext, useEffect } from 'react';
import { useCreation } from 'ahooks';
import { RendererContext, RendererViewerHOC } from '@/compos/RendererHOC';
import BoldLine from './BoldLine';

function BoldLineViewer() {
  const renderer = useContext(RendererContext);
  const line = useCreation(() => new BoldLine(renderer), []);

  useEffect(() => {
    const points = [
      [-10, 0, 0],
      [0, 10, 0],
      [10, 0, 0],
      [15, 5, 0],
    ];
    line.draw(points);
    return () => {
      line.clean();
    };
  }, []);
  return <div />;
}

export default RendererViewerHOC(BoldLineViewer);
