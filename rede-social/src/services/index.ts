class UserService {
    registerUser(username: string, email: string): User {
        // lógica para registrar um usuário
    }

    findUser(userId: string): User | null {
        // lógica para encontrar um usuário pelo ID
    }
}

class PostService {
    addPost(userId: string, content: string): Post {
        // lógica para adicionar uma nova postagem
    }

    removePost(postId: string): boolean {
        // lógica para remover uma postagem
    }
}

export { UserService, PostService };