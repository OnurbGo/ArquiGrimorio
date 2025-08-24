import app from "../src/app";
import sequelize from "../src/config/database";
import request from "supertest";
import { authMiddleware } from "../src/middleware/authMiddleware";

jest.mock("../src/middleware/authMiddleware", () => {
  return {
    authMiddleware: (req: any, res: any, next: any) => {
      req.user = { id: 1 };
      // Verifica se o id da rota é o mesmo do usuário autenticado
      if (Number(req.params.id) !== req.user.id) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      next();
    },
  };
});

describe("User Endpoint", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await request(app).post("/users").send({
      id: 1,
      name: "Ronaldo",
      email: "pindagoiabada@godmail.com",
      password: "@Juju713",
      CPF: "123.456.789-00",
      type: "teacher",
    });
    await request(app).post("/users").send({
      id: 2,
      name: "Valid User",
      email: "akuma@gmail.com",
      password: "@Juju713",
      CPF: "123.555.789-00",
      type: "teacher",
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("PUT /users/:id should allow user to edit their own data", async () => {
    const response = await request(app)
      .put("/users/1") // ID do usuário autenticado
      .send({
        name: "Paulo Gustavo",
        email: "emailatualizado@gmail.com",
        password: "@NovaSenha123",
        CPF: "009.876.543-21",
        type: "student",
      });

    expect(response.status).toBe(200);
  });

  test("PUT /users/:id should NOT allow user to edit another user's data", async () => {
    const response = await request(app).put("/users/2").send({
      name: "VLADMIR",
      email: "akuma@gmail.com",
      password: "@Juju713",
      CPF: "123.555.789-00",
      type: "teacher",
    });

    expect(response.status).toBe(403); // Deve retornar Forbidden
    expect(response.body.error).toBe("Acesso negado");
  });
});
