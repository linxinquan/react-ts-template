import { Suspense, lazy } from 'react';
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router';
import Loader from '@/utils/Loader';

const Home = lazy(() => import('./Home'));
const GraphHome = lazy(() => import('./Graph/GraphHome'));
const Animation = lazy(() => import('./Graph/Animation'));
const Shader = lazy(() => import('./Graph/Shader'));
const Cannon = lazy(() => import('./Graph/Cannon'));
const ShaderTexture = lazy(() => import('./Graph/ShaderTexture'));
const BoldLineViewer = lazy(() => import('./Graph/BoldLineViewer'));
const ToolsHome = lazy(() => import('./Tools/index'));
const ShaderTool = lazy(() => import('./Tools/ShaderTool'));
const DrawBoard = lazy(() => import('./Tools/DrawBoard'));
const ErrorBoundary = lazy(() => import('@/compos/ErrorBoundary'));
const PageNotFound = lazy(() => import('@/compos/ErrorBoundary/PageNotFound'));
const HomeLayout = lazy(() => import('./Layout/HomeLayout'));

const modelLoader = () => new Loader().loadResources();

export default function RootRoute() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route errorElement={<ErrorBoundary />}>
          <Route path="/" element={<Home />} />
          <Route path="/" element={<HomeLayout />}>
            <Route path="graph" element={<GraphHome />}>
              <Route index element={<Animation />} />
              <Route path="animation" element={<Animation />} />
              <Route path="shader" element={<Shader />} />
              <Route path="cannon" loader={modelLoader} element={<Cannon />} />
              <Route path="shaderTexture" element={<ShaderTexture />} />
              <Route path="boldLine" loader={modelLoader} element={<BoldLineViewer />} />
            </Route>
            <Route path="tools" element={<ToolsHome />}>
              <Route index element={<ShaderTool />} />
              <Route path="shader" element={<ShaderTool />} />
              <Route path="drawBoard" element={<DrawBoard />} />
            </Route>
          </Route>
          <Route path="*" element={<PageNotFound />} />
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
