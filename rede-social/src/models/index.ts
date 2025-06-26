class User {
    id: number;
    username: string;
    email: string;

    constructor(id: number, username: string, email: string) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    static createUser(id: number, username: string, email: string): User {
        return new User(id, username, email);
    }

    static findUser(users: User[], id: number): User | undefined {
        return users.find(user => user.id === id);
    }
}

class Post {
    id: number;
    userId: number;
    content: string;
    timestamp: Date;

    constructor(id: number, userId: number, content: string, timestamp: Date) {
        this.id = id;
        this.userId = userId;
        this.content = content;
        this.timestamp = timestamp;
    }

    static createPost(id: number, userId: number, content: string): Post {
        return new Post(id, userId, content, new Date());
    }

    static findPost(posts: Post[], id: number): Post | undefined {
        return posts.find(post => post.id === id);
    }
}

export { User, Post };