import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import { validateRequest, BadRequestError } from "@tickets/common";

const router = express.Router();

const signUpValidator = [
  body("email").isEmail().withMessage("Email must be valid"),
  body("password")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Password must be between 4 and 20"),
];

router.post(
  "/api/users/signup",
  signUpValidator,
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    console.log("existingUser inside signup",existingUser)
    if (existingUser) {
      throw new BadRequestError("Invalid email or password");
    }
    const user = await User.create({ email, password });
    const userToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!,
    );
    req.session = { jwt: userToken };
    res.status(201).send(user);
  },
);

export { router as signUpRouter };
