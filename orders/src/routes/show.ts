import { NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from "@tickets/common"
import express, {Request, Response} from "express"
import { Order } from "../../models/orders"
import { param } from "express-validator"
import mongoose from "mongoose"

const router  = express.Router()

const validators = [
    param("orderId")
    .not()
    .isEmpty()
    .custom((input:string)=> mongoose.Types.ObjectId.isValid(input))
    .withMessage("A valid orderId is required")
]

router.get("/api/orders/:orderId",
    requireAuth,
    validators,
    validateRequest,
    async (req:Request,res:Response)=>{
    const order = await Order.findById(req.params.orderId).populate("ticket")
    if(!order) throw new NotFoundError()

    if(order.userId !== req.currentUser!.id) throw new NotAuthorizedError()

    res.send(order)
})

export {router as showOrderRouter }