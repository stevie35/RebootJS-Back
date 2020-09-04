import express, { Request, Response, ErrorRequestHandler } from "express";
import morgan from "morgan";
import helmet from "helmet";
import { configuration, IConfig } from "./config";
import { connect } from "./database";
import profileRoutes from "./routes/profileRoute";
import { Profile } from "./models/profiles";

export function createExpressApp(config: IConfig): express.Express {
  const { express_debug } = config;

  const app = express();

  app.use(morgan("combined"));
  app.use(helmet());
  app.use(express.json());

  app.use(((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).send(!express_debug ? "Oups" : err);
  }) as ErrorRequestHandler);

  app.use("/profile", profileRoutes);

  app.get("/", (req: Request, res: Response) => {
    res.send("This is the boilerplate for Flint Messenger app");
  });

  app.post("/profile", (req: Request, res: Response) => {
    const { email, firstname, lastname } = req.body;
    const newProfile = new Profile({
      email: email,
      firstname: firstname,
      lastname: lastname,
    });
    newProfile.save();
    res.send("Utilisateur créée");
  });

  /*app.get("/profile/:id", (req: Request, res: Response) => {
    const id = req.params["id"];
    if (id !== undefined) {
      Profile.findById(id)
        .then((profil: any) => {
          // console.log(profil)
          res.status(200).send(profil);
        })
        .catch((error: any) => {
          // console.log('error get by id:', id, error.message)
          res.status(400).header("Error", error.message).send("no user");
        });
    } else {
      return res.status(404).send("No parameter id");
    }
  });*/

  /*app.post("/profile", (req: Request, res: Response) => {
    const { email, firstname, lastname } = req.body;
    const newProfile = new Profile({
      email: email,
      firstname: firstname,
      lastname: lastname,
    });
    newProfile
      .save()
      .then((response) => {
        // console.log(response)
        return res.status(201).send(response);
      })
      .catch((error) => {
        // console.log("Post error : ", error.message)
        return res.status(401).header("Error", error.message).send(null);
      });
  });*/

  return app;
}

const config = configuration();
const { PORT } = config;
const app = createExpressApp(config);
connect(config).then(() =>
  app.listen(PORT, () => console.log(`Flint messenger listening at ${PORT}`))
);
