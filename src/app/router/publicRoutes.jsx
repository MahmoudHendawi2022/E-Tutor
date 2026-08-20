import React from "react";
import { Route } from "react-router";
import MainLayout from "../../layouts/MainLayouts";
import Home from "../../pages/public/Home/Home";
import SignIn from "../../pages/public/SignIn/SignIn";
import Register from "../../pages/public/Register/Register";

export const publicRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/home" element={<Home />} />
    <Route path="/signin" element={<SignIn />} />
    <Route path="/register" element={<Register />} />
  </Route>
);
