import { request, Request, Response, Router } from "express";
import { IProfile, Profile } from "../models/profiles";
import { authenticationRequired } from "../middlewares/authenticationRequired";
import { getAllProfiles, getProfile, updateProfile } from '../controllers/profiles';

const router = Router();

router.get("/me", authenticationRequired, (request: Request, response: Response) => {
  if(!request.user) { return response.status(401).send() }
  return response.json((request.user as IProfile).getSafeProfile());
});

router.patch("/", authenticationRequired, (request: Request, response: Response) => {
  if(!request.user) { return response.status(401).send() }
  const { email, firstname, lastname, password } = request.body;

  updateProfile(request.user as IProfile, email, firstname, lastname, password)
    .then(profile => {
      if(!profile) return response.status(404).send("Profile not found");
      return response.status(200).send(profile.getSafeProfile());
    })
    .catch(error => {
      console.error(error);
      return response.status(500).send();
    });
})

router.delete('/', authenticationRequired, (req: Request, res: Response) => {
  if(!request.user) { return res.status(401).send() }
  (request.user as IProfile).deleteOne()
    .then(_profile => res.status(200).send('Utilisateur supprimé'))
    .catch(error => {
      console.error(error);
      return res.status(500).send();
    });
})

router.post("/", (req: Request, res: Response) => {
  const { email, firstname, lastname, password } = req.body;

  const newProfile = new Profile({
    email: email,
    firstname: firstname,
    lastname: lastname,
  });
  newProfile.setPassword(password);
  newProfile.save()
  .then(profile => {
    return res.send(profile.getSafeProfile());
  }).catch(error => {
    console.error(error);
    return res.status(500).send();
  });

  // res.send("Utilisateur créé");
});

router.get(
  "/:profileId",
  authenticationRequired,
  (req: Request, res: Response) => {
    const profileId = req.params["profileId"];

    getProfile(profileId)
    .then(profile => {
      if(profile === null) { return res.status(404).send("Profile not found"); }
      return res.send(profile.getSafeProfile());
    }).catch(error => {
      console.error(error);
      return res.status(500).send()
    }
  )

      // res.send(profile);
      // res.send(profile.email);
    });
  


router.get('/', (req: Request, res: Response) => {
  getAllProfiles()
    .then(profiles => profiles.map(profile => profile.getSafeProfile()))
    .then(safeProfiles => {
      return res.status(200).send(safeProfiles);
    })
    .catch(error => {
      console.error(error);
      return res.status(500).send();
    })
})

export default router;
