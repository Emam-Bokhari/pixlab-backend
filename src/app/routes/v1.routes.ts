import express from 'express';
import { UpscaleRoutes } from '../modules/upscale/upscale.route';
import { ReduceRoutes } from '../modules/reduce/reduce.route';
import { ResizeRoutes } from '../modules/resize/resize.route';
import { BgRemoveRoutes } from '../modules/bgRemove/bgRemove.route';

const v1Router = express.Router();

const apiRoutes = [
  {
    path: '/upscales',
    route: UpscaleRoutes,
  },
  {
    path: '/reduce',
    route: ReduceRoutes,
  },
  {
    path: '/resize',
    route: ResizeRoutes,
  },
  {
    path: '/bg-remove',
    route: BgRemoveRoutes,
  },
];

apiRoutes.forEach((route) => v1Router.use(route.path, route.route));

export default v1Router;
