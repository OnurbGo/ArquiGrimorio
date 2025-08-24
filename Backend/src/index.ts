import sequelize from "./config/database";
import app from "./app";

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function establishConnectionWithRetry(maxRetries = 10, delayMs = 2000) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      console.log(
        `Tentativa de conectar ao MySQL (tentativa ${
          attempts + 1
        }/${maxRetries})…`
      );
      await sequelize.authenticate();
      console.log("MySQL conectado com sucesso!");
      return;
    } catch (err) {
      attempts++;
      console.log(
        `Falha ao conectar (tentativa ${attempts}/${maxRetries}). Aguardando ${delayMs}ms…`
      );
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  console.error(
    "Não foi possível conectar ao MySQL após várias tentativas. Encerrando."
  );
  process.exit(1);
}

(async () => {
  await establishConnectionWithRetry();

  try {
    await sequelize.sync({ alter: true });
    console.log("Database has been synchronized");
  } catch (error: any) {
    console.error("ERROR in Database synchronization:", error.message);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log("Server is running on port:", port);
  });
})();
