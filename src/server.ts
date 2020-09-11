import express, { Request, Response, ErrorRequestHandler } from "express";
import morgan from "morgan";
import helmet from "helmet";
import { configuration, IConfig } from "./config";
import { connect } from "./database";
import profileRoutes from "./routes/profileRoute";
import { Profile } from "./models/profiles";
import loginRoute from "./routes/loginRoute";
import {
  authenticationInitialize,
  authenticationSession,
} from "./controllers/authentification";
import session from "express-session";
import connectMongo from "connect-mongo";
import mongoose from "mongoose";
import cors from "cors";

const MongoStore = connectMongo(session);

export function createExpressApp(config: IConfig): express.Express {
  const { express_debug, session_secret, session_cookie_name } = config;

  const app = express();

  app.use(morgan("combined"));
  app.use(helmet());
  app.use(express.json());
  app.use(cors({credentials: true, origin: true}));

  app.use(
    session({
      name: session_cookie_name,
      secret: session_secret,
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
  );

  app.use(authenticationInitialize());
  app.use(authenticationSession());

  app.use(((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).send(!express_debug ? "Oups" : err);
  }) as ErrorRequestHandler);

  app.use("/profile", profileRoutes);
  // app.use("/profile", profileRoutes);

  app.use("/login", loginRoute);

  app.get("/", (req: Request, res: Response) => {
    res.send("This is the boilerplate for Flint Messenger app");
  });

  /*app.post("/profile", (req: Request, res: Response) => {
    const { email, firstname, lastname } = req.body;
    const newProfile = new Profile({
      email: email,
      firstname: firstname,
      lastname: lastname,
      //password: password,
    });
    newProfile.save();
    res.send("Utilisateur créée");
  });*/

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

// curl http://localhost:3000/profile -X POST --data '{"email": "thomas.falcone06@gmail.com", "firstname": "thomas", "lastname": "thomas", "password": "Abcd"}' -H'Content-type:application/json'
// curl http://localhost:3000/login -X POST --data '{"username": "thomas.falcone06@gmail.com", "password": "Abcd"}' -H'Content-type:application/json'
