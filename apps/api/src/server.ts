import "dotenv/config";
import { buildApp } from "./app";

const port = Number(process.env.PORT ?? 8080);

buildApp()
  .then((app) =>
    app.listen({ port, host: "0.0.0.0" }).then(() => {
      app.log.info(`Dreamari API on http://localhost:${port} · docs at /docs`);
    }),
  )
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
