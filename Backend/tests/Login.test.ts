import app from "../src/app"; // Importando a aplicação (já deve estar no seu código)
import sequelize from "../src/config/database"; // Configuração do banco de dados
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
        CPF: "000.000.000-00",
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
      password: "#Tornadoa255", // Precisa ser hashado no modelo
      CPF: "123.456.789-00",
      type: "teacher",
    });
  });

  afterAll(async () => {
    await sequelize.close(); // Fecha a conexão após os testes
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
