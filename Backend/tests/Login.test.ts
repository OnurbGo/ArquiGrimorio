import app from "../src/app"; 
import sequelize from "../src/config/database";
import request from "supertest";
import { authMiddleware } from "../src/middleware/authMiddleware";
import UserModel from "../src/models/UserModel";

jest.mock("../src/middleware/authMiddleware", () => {
  return {
    authMiddleware: (req: any, res: any, next: any) => {
      req.body.user = {
        name: "Gustavo Lima",
        email: "qualquer@exemplo.com",
        password: "@senhaBolada714",
      };

      next();
    },
  };
});

describe("Login Endpoint", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await UserModel.create({
      name: "Zangief",
      email: "tornadovermelho@gmail.com",
      password: "#Tornadoa255",
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("Login should to connect", async () => {
    const response = await request(app).post("/login").send({
      email: "tornadovermelho@gmail.com",
      password: "#Tornadoa255",
    });
    expect(response.status).toBe(200);
  });

  test("Login shouldn't to connect because the password is wrong", async () => {
    const response = await request(app).post("/login").send({
      email: "tornadovermelho@gmail.com",
      password: "#Tornadoa123",
    });
    expect(response.body).toHaveProperty(
      "error",
      "Email or Password are invalid"
    );

    expect(response.status).toBe(400);
  });

  test("Login shouldn't to connect because the email is wrong", async () => {
    const response = await request(app).post("/login").send({
      email: "tornadoazul@gmail.com",
      password: "#Tornado255",
    });
    expect(response.status).toBe(404);
  });

  test("Login shouldn't to connect because is empty", async () => {
    const response = await request(app).post("/login").send({
      email: "",
      password: "",
    });
    expect(response.body).toHaveProperty(
      "error",
      "Email or Password are required"
    );
    expect(response.status).toBe(400);
  });
});
