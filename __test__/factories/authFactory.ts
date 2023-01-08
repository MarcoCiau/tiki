import request from "../../config/testConfig"

export const authURLBase: string = "/api/v1/auth";

export interface newUser {
    name?: string,
    email: string,
    password: string,
    timezone?: string,
}


export const userData: newUser = {
    name: "user1",
    email: 'user1@mail.com',
    password: 'Secret1234',
    timezone: "America/Merida"
}

//helper functions
/*
signup user
*/
export const signupUser = () => {

    return request
        .post(authURLBase + "/signup")
        .send(userData).set('Accept', 'application/json');

}
/*
signin user
*/
export const signinUser = () => {
    //workaround : signup before due the DB drop each test
    // execute Signin
    return request
        .post(authURLBase + "/signin")
        .send({
            email: userData.email,
            password: userData.password
        }).set('Accept', 'application/json');
}