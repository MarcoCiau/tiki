import { Router, Request, Response } from "express";
const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).json({ msg: 'Hello World' });
});

router.post('/', (req: Request, res: Response) => {
    console.log(req.body);
    res.status(200).json({ msg: 'OK' });
});


export default router;