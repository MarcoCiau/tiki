class CustomAPIError extends Error {
    statusCode: number;
    moreInfo : string[];
    constructor(status: number = 500, message: string, moreInfo: string []) {
        super(message);
        this.statusCode = status;
        this.moreInfo = moreInfo;
    }
}

export default CustomAPIError;
