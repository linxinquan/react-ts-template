import { Suspense, lazy } from 'react';
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router';
import ErrorBoundary from '@/compos/ErrorBoundary';
import request from '@/utils/request';
import Home from './Home';

const GraphHome = lazy(() => import('./Graph/GraphHome'));
const Animation = lazy(() => import('./Graph/Animation'));
const Shader = lazy(() => import('./Graph/Shader'));

export default function RootRoute() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route errorElement={<ErrorBoundary />}>
          <Route path="/" element={<Home />}>
            <Route path="graph" element={<GraphHome />}>
              <Route index element={<Animation />} />
              <Route
                path="animation"
                loader={() => request.get('/api/error')}
                element={<Animation />}
              />
              <Route path="shader" element={<Shader />} />
            </Route>
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
