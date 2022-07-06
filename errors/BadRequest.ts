import { StatusCodes } from "http-status-codes";
import CustomAPIError from "./CustomAPIError";

class BadRequestError extends CustomAPIError {
    constructor(message: string, moreInfo: string [] = []) {
        super(StatusCodes.BAD_REQUEST, message, moreInfo);
    }
}

export default BadRequestError;
