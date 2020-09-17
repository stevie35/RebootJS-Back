import { Request, Response, Router } from "express";
import { authenticationRequired } from "../middlewares/authenticationRequired";
import * as messageController from '../controllers/messages';
import { IProfile } from "../models/profiles";

const router = Router()

router.get('/', authenticationRequired, async (req: Request, res: Response) => {
  if(!req.user) { return res.status(401).send('You must be authenticated')};
  return await messageController.getAllMessages(req.user as IProfile);
});

router.get('/:conversationId', authenticationRequired, async (req: Request, res: Response) => {
  if(!req.user) { return res.status(401).send('You must be authenticated')};
  return await messageController.getAllMessages(req.user as IProfile, req.params['conversationId']);
});

router.post('/', authenticationRequired, async (req: Request, res: Response) => {
  if(!req.user) { return res.status(401).send('You must be authenticated')};
  const { conversationId, targets, content } = req.body;
  const user = req.user as IProfile;
  return await messageController.createMessage(conversationId, targets, user._id, content);
})

export default router;