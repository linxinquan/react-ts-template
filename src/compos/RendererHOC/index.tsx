import {
  useState,
  useEffect,
  useCallback,
  ComponentType,
  createContext,
  ReactNode,
  CSSProperties,
} from 'react';
import RendererCore from '@/utils/RendererCore';

const RendererContext = createContext<RendererCore>(null as unknown as RendererCore);

interface RendererProviderProps {
  children?: ReactNode;
  style?: CSSProperties;
  mode?: 'fullscreen' | 'inner';
}

function RendererProvider(props: RendererProviderProps) {
  const [renderer, setRenderer] = useState<RendererCore>(null as unknown as RendererCore);

  const containerRefCallback = useCallback((node: HTMLDivElement) => {
    setRenderer(() => {
      if (!node) {
        renderer?.dispose();
        return null as unknown as RendererCore;
      }
      return new RendererCore(node);
    });
  }, []);

  useEffect(() => () => {
    if (renderer) {
      renderer.dispose();
    }
  });

  const containerStyle: CSSProperties =
    props.mode === 'inner'
      ? props.style || {}
      : {
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          userSelect: 'none',
        };

  return (
    <RendererContext.Provider value={renderer}>
      <div ref={containerRefCallback} style={containerStyle} />
      {renderer && props.children}
    </RendererContext.Provider>
  );
}

function RendererViewerHOC<T>(Component: ComponentType<T>, option: RendererProviderProps = {}) {
  return (props: T) => (
    <RendererProvider {...option}>
      {/* @ts-expect-error: Unreachable code error */}
      <Component {...props} />
    </RendererProvider>
  );
}

export { RendererContext, RendererProvider, RendererViewerHOC };
