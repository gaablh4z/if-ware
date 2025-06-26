import { Router } from 'express';
import IndexController from '../controllers/index';

const router = Router();
const indexController = new IndexController();

export const setRoutes = (app) => {
    app.use('/api/posts', router);
    router.post('/', indexController.createPost);
    router.get('/', indexController.getPosts);
    router.delete('/:id', indexController.deletePost);
};