import { useContext } from 'react';
import { useCreation } from 'ahooks';
import { RendererContext, RendererViewerHOC } from '@/compos/RendererHOC';
import Editor from './Editor';

function ShaderPreview() {
  const renderer = useContext(RendererContext);
  useCreation(() => new Editor(renderer), [renderer]);

  return <div />;
}

export default RendererViewerHOC(ShaderPreview);
