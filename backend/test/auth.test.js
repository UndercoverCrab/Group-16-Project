import request from "supertest";
import app from "../index";

describe("Auth Routes", () => {
  let server;

  beforeAll(() => {
    server = app.listen(5000);
  });

  afterAll(() => {
    server.close();
  });

  const testUser = {
    email: "admin@gmail.com",
    password: "password123",
    role: "admin",
  };

  it("should register a new user", async () => {
    const response = await request(server)
      .post("/api/auth/register")
      .send(testUser);

    console.log("Register Response:", response.body);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "User registered successfully"
    );
  });

  it("should login a user", async () => {
    const response = await request(server).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    console.log("Login Response:", response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should go through verifyToken and return profile with decoded JWT", async () => {
    const registerRes = await request(server).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });

    expect(registerRes.status).toBe(201);

    const loginRes = await request(server).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "password123",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("token");

    const token = loginRes.body.token;

    console.log("Retrieved Token:", token);

    const profileRes = await request(server)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    console.log("Profile Response:", profileRes.body);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body).toHaveProperty("message", "User profile data");
    expect(profileRes.body).toHaveProperty("email", "testuser@example.com");
    expect(profileRes.body).toHaveProperty("role");
    expect(profileRes.body).toHaveProperty("userId");
  });

  it("should return an error when accessing profile without a token", async () => {
    const response = await request(server).get("/api/auth/profile");

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty(
      "message",
      "Access denied, no token provided"
    );
  });

  it("should return an error for invalid email during registration", async () => {
    const response = await request(server).post("/api/auth/register").send({
      email: "invalid@gmail.com",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid email address");
  });

  it("should return an error for short password during registration", async () => {
    const response = await request(server).post("/api/auth/register").send({
      email: testUser.email,
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Password must be at least 8 characters"
    );
  });

  it("should return an error for invalid email during login", async () => {
    const response = await request(server).post("/api/auth/login").send({
      email: "notarealemail@gmail.com",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid email address");
  });

  it("should return an error for short password during login", async () => {
    const response = await request(server).post("/api/auth/login").send({
      email: testUser.email,
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Password must be at least 8 characters"
    );
  });
});
