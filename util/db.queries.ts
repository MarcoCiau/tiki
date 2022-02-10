import ReadsModel from "../models/reads";

export const executeReadsQuery = (query: string, from: number = 0, limit: number = 5, sort: number = 1) => {
    return new Promise((resolve, reject) => {
        let queryObj:object = {};
        if (query === "") {
            reject({error: "invalid query object"});
        }
        queryObj = {...JSON.parse(query)};
        ReadsModel.find(queryObj)
            .skip(from)
            .limit(limit)
            .sort({ timestamp: sort })
            .exec(function (err, reads) {
                if (err) {
                    console.log("Error while querying reads collection!");
                    reject(err);
                };
                resolve(reads);
            });

    });
}