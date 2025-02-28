const index = require("../routes/authRoutes");
const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.json());

app.use("/auth", index);

describe("Auth endpoints", () => {
  const testUser = {
    email: "testx@example.com",
    password: "password123",
    username: "Gino354",
  };
  test("Register new account", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(testUser)
      .expect("Content-Type", /json/)
      .expect(201);
    expect(response.body).toHaveProperty(
      "message",
      "User created successfully"
    );
    expect(response.body).toHaveProperty("id");
  });

  test("Login with valid credentials", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ email: testUser.email, password: testUser.password })
      .expect("Content-Type", /json/)
      .expect(200);
    expect(loginResponse.body).toHaveProperty("token");
    expect(loginResponse.body).toHaveProperty("user");
    expect(loginResponse.body.user).toHaveProperty("email", testUser.email);
  });

  test("Login with invalid password", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ email: testUser.email, password: "wrongpsw" })
      .expect("Content-Type", /json/)
      .expect(401);
    expect(loginResponse.body).toHaveProperty(
      "message",
      "Invalid credentials, password doesn't match"
    );
  });

  test("Login with invalid email", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "anypassword",
      })
      .expect("Content-Type", /json/)
      .expect(401);

    expect(loginResponse.body).toHaveProperty(
      "message",
      "Invalid credentials, user not found"
    );
  });
});
