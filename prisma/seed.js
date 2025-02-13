const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "Comment_id_seq" RESTART WITH 1`;
  // Clear existing data
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.comment.deleteMany({});

  // Create 5 users
  const users = [];
  for (let x = 0; x < 5; x++) {
    const user = await prisma.user.create({
      data: {
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: "xxxxxx",
      },
    });
    users.push(user);
  }

  // Create 15 posts
  const posts = [];
  for (let y = 0; y < 15; y++) {
    const post = await prisma.post.create({
      data: {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(),
        userId: users[Math.floor(Math.random() * users.length)].id,
      },
    });
    posts.push(post);
  }
  // Create 30 comments
  const comments = [];
  for (let z = 0; z < 30; z++) {
    const comment = await prisma.comment.create({
      data: {
        title: faker.book.title(),
        content: faker.hacker.phrase(),
        userId: users[Math.floor(Math.random() * users.length)].id,
        postId: posts[Math.floor(Math.random() * posts.length)].id,
      },
    });
    comments.push(comment);
  }

  console.log("Created:", {
    users: users.length,
    posts: posts.length,
    comments: comments.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
