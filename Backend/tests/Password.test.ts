import request from "supertest";
import sequelize from "../src/config/database";
import app from "../src/app"; // Ajuste o caminho conforme necessário
//import UserModel from "../src/models/UserModel";

describe("User Controller - Password Validation", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close(); // Fecha a conexão após os testes
  });

  test("Deve aceitar uma senha válida", async () => {
    const response = await request(app).post("/users").send({
      id: 1,
      name: "Bruce Lee",
      email: "bruce.lee@example.com",
      CPF: "123.456.789-00",
      password: "Senha@123",
      type: "student",
    });

    expect(response.status).toBe(201);
  });

  test("Deve falhar se a senha tiver menos de 8 caracteres", async () => {
    const response = await request(app).post("/users").send({
      name: "Bruce Lee",
      email: "bruce.lee@example.com",
      CPF: "123.456.789-00",
      password: "Aa1@",
      type: "student",
    });
    expect(response.status).toBe(400);
  });

  test("Deve falhar se a senha não tiver pelo menos um número", async () => {
    const response = await request(app).post("/users").send({
      name: "Bruce Lee",
      email: "bruce.lee@example.com",
      CPF: "123.456.789-00",
      password: "SenhaFort@",
      type: "student",
    });

    expect(response.status).toBe(400);
  });

  test("Deve falhar se a senha não tiver pelo menos uma letra maiúscula", async () => {
    const response = await request(app).post("/users").send({
      name: "Bruce Lee",
      email: "bruce.lee@example.com",
      CPF: "123.456.789-00",
      password: "senha@123",
      type: "student",
    });

    expect(response.status).toBe(400);
  });

  test("Deve falhar se a senha não tiver pelo menos um caractere especial", async () => {
    const response = await request(app).post("/users").send({
      name: "Bruce Lee",
      email: "bruce.lee@example.com",
      CPF: "123.456.789-00",
      password: "Senha1234",
      type: "student",
    });

    expect(response.status).toBe(400);
  });
});
