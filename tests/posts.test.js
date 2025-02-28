const { prisma } = require("./testSetup");
const index = require("../routes/postsRoutes");
const request = require("supertest");
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const setupTestAuth = require("./passportSetup");

const app = express();
// setupTestAuth(app);
app.use(express.json());
require("../config/passport");
app.use(passport.initialize());
app.use("/posts", index);

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error fetching posts" });
});

describe("Posts endpoints", () => {
  let testUser;
  let adminUser;
  let adminToken;
  let regularToken;

  const testPosts = [
    {
      title: "Published Post 1",
      content: "Content 1",
      published: true,
      createdAt: new Date("2024-02-15T10:00:00Z"),
    },
    {
      title: "Published Post 2",
      content: "Content 2",
      published: true,
      createdAt: new Date("2024-02-15T11:00:00Z"),
    },
    {
      title: "Draft Post",
      content: "Draft Content",
      published: false,
      createdAt: new Date("2024-02-15T12:00:00Z"),
    },
  ];

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        email: "testuser@example.com",
        username: "testuser",
        password: "password123",
      },
    });
    adminUser = await prisma.user.create({
      data: {
        email: "testAdmin@example.com",
        username: "testadmin",
        password: "password123",
        admin: true,
      },
    });

    await Promise.all(
      testPosts.map((post) =>
        prisma.post.create({
          data: {
            ...post,
            user: {
              connect: {
                id: testUser.id,
              },
            },
          },
        })
      )
    );
    adminToken = jwt.sign({ id: adminUser.id }, process.env.JWT_SECRET);
    regularToken = jwt.sign({ id: testUser.id }, process.env.JWT_SECRET);
  });

  test("should return all published posts in descending order", async () => {
    const response = await request(app)
      .get("/posts")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);
    expect(response.body[0].title).toBe("Published Post 2");
    expect(response.body[1].title).toBe("Published Post 1");

    response.body.forEach((post) => {
      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("title");
      expect(post).toHaveProperty("content");
      expect(post).toHaveProperty("published", true);
      expect(post).toHaveProperty("createdAt");
      expect(post).toHaveProperty("userId", testUser.id);
    });
  });

  test("should return 404 when no published posts exist", async () => {
    await prisma.post.deleteMany();

    const response = await request(app)
      .get("/posts")
      .expect("Content-Type", /json/)
      .expect(404);

    expect(response.body).toHaveProperty("message", "No posts found");
  });

  test("reject requests from regular users", async () => {
    const response = await request(app)
      .get("/posts/admin/desc")
      .set("Authorization", `Bearer ${regularToken}`)
      .expect("Content-Type", /json/)
      .expect(403);
    expect(response.body).toHaveProperty("message", "Not authorized");
  });

  test("accept requests if user is admin", async () => {
    await Promise.all(
      testPosts.map((post) =>
        prisma.post.create({
          data: {
            ...post,
            user: {
              connect: {
                id: testUser.id,
              },
            },
          },
        })
      )
    );

    const response = await request(app)
      .get("/posts/admin/desc?option=all")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect("Content-Type", /json/)
      .expect(200);
    expect(response.body.length).toBe(3);
  });

  test("asc get the posts in from the older", async () => {
    const response = await request(app)
      .get("/posts/admin/asc?option=all")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect("Content-Type", /json/)
      .expect(200);
    expect(response.body.length).toBe(3);
    const timestamps = response.body.map((post) =>
      new Date(post.createdAt).getTime()
    );
    expect(response.body[0].title).toBe("Published Post 1");
    expect(response.body[2].title).toBe("Draft Post");
  });  

  test("No comments found fetch empty array", async () => {
    const response = await request(app)
      .get("/posts/1/comments")
      .expect("Content-Type", /json/)
      .expect(200);
    expect(response.body).toHaveLength(0);
  });

//   test("fetch comments", async () => {
//     const testComments = [
//       {
//         title: "Comment 1",
//         content: "Content 1",
//         postId: 1,
//       },
//       {
//         title: "COmment 2",
//         content: "Content 2",
//         postId: 1,
//       },
//       {
//         title: "Comment 3",
//         content: "Content 3",
//         postId: 2,
//       },
//       {
//         title: "Comment 4",
//         content: "Content 4",
//         postId: 1,
//       },
//     ];
//     await Promise.all(
//       testComments.map((comment) =>
//           prisma.comment.create({
//           data: {
//             ...comment,
//             user: {
//               connect: {
//                 id: testUser.id,
//               },
//             },
//           },
//         })
//       )
//     );

//     const response = await request(app)
//       .get("/posts/1/comments")
//       .expect("Content-Type", /json/)
//       .expect(200);
//     expect(response.body).toHaveLength(0);
//   });
});
