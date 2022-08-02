import { StatusCodes } from "http-status-codes";
import CustomAPIError from "./CustomAPIError";

class NotFoundError extends CustomAPIError {
    constructor(message: string, moreInfo: string [] = []) {
        super(StatusCodes.NOT_FOUND, message, moreInfo);
    }
}

export default NotFoundError;