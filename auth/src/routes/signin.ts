import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import { BadRequestError, validateRequest } from "@tickets/common";
import { Password } from "../services/password";
import jwt from "jsonwebtoken";
const router = express.Router();

const signinValidator = [
  body("email").isEmail().withMessage("Email must be valid"),
  body("password").trim().notEmpty().withMessage("You must supply a password"),
];

router.post(
  "/api/users/signin",
  signinValidator,
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    console.log('existingUser',existingUser)
    if (!existingUser) {
      throw new BadRequestError("Invalid email or password");
    }
    if (!(await Password.compare(existingUser.password, password))) {
      throw new BadRequestError("Invalid email or password");
    }
    const userToken = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!,
    );
    req.session = { jwt: userToken };
    res.status(200).send(existingUser);
  },
);

export { router as signInRouter };
