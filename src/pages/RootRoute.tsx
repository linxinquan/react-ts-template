import { Suspense, lazy } from 'react';
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router';
import ErrorBoundary from '@/compos/ErrorBoundary';
import Home from './Home';
import Loader from '@/utils/Loader';

const GraphHome = lazy(() => import('./Graph/GraphHome'));
const Animation = lazy(() => import('./Graph/Animation'));
const Shader = lazy(() => import('./Graph/Shader'));
const Cannon = lazy(() => import('./Graph/Cannon'));
const ShaderTexture = lazy(() => import('./Graph/ShaderTexture'));
const LoaderViewer = lazy(() => import('./Graph/LoaderViewer'));
// const ToolsHome = lazy(() => import('./Tools/index'));
// const ShaderTool = lazy(() => import('./Tools/ShaderTool'));

const modelLoader = () => new Loader().loadResources();

export default function RootRoute() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route errorElement={<ErrorBoundary />}>
          <Route path="/" element={<Home />}>
            <Route path="graph" element={<GraphHome />}>
              <Route index element={<Animation />} />
              <Route path="animation" element={<Animation />} />
              <Route path="shader" element={<Shader />} />
              <Route path="cannon" loader={modelLoader} element={<Cannon />} />
              <Route path="shaderTexture" element={<ShaderTexture />} />
              <Route path="loader" loader={modelLoader} element={<LoaderViewer />} />
            </Route>
            {/* <Route path="tools" element={<ToolsHome />}>
              <Route index element={<ShaderTool />} />
              <Route path="shader" element={<ShaderTool />} />
            </Route> */}
          </Route>
          <Route path="*" element={<ErrorBoundary />} />
        </Route>
      </Route>,
    ),
  );
  return (
    <Suspense>
      <RouterProvider router={router} />
    </Suspense>
  );
}
