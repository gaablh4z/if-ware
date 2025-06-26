import { Request, Response } from 'express';

class IndexController {
    public createPost(req: Request, res: Response): void {
        // Lógica para criar uma nova postagem
        res.send('Postagem criada');
    }

    public getPosts(req: Request, res: Response): void {
        // Lógica para obter todas as postagens
        res.send('Lista de postagens');
    }

    public deletePost(req: Request, res: Response): void {
        // Lógica para deletar uma postagem
        res.send('Postagem deletada');
    }
}

export default IndexController;