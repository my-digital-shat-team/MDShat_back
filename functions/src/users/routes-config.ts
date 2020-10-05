import { Application } from "express";
// eslint-disable-next-line import/no-unresolved
import {all, create, get, patch, remove} from "./controller";
// eslint-disable-next-line import/no-unresolved
import { isAuthenticated } from "../auth/authenticated";
// import { isAuthorized } from "../auth/authorized";

export function routesConfig(app: Application) {
    // create a user
    app.post('/users',
        create
    );
    // lists all users
    app.get('/users', [
        isAuthenticated,
        all
    ]);
    // get :id user
    app.get('/users/:id', [
        isAuthenticated,
        get
    ]);
    // updates :id user
    app.patch('/users/:id', [
        isAuthenticated,
        patch
    ]);
    // deletes :id user
    app.delete('/users/:id', [
        isAuthenticated,
        remove
    ]);
}
