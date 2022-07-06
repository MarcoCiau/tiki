import { StatusCodes } from "http-status-codes";
import CustomAPIError from "./CustomAPIError";

class UnauthenticatedError extends CustomAPIError {
    constructor(message: string, moreInfo: string [] = []) {
        super(StatusCodes.UNAUTHORIZED, message, moreInfo);
    }
}

export default UnauthenticatedError;