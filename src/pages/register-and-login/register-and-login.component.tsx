import "./register-and-login.styles.scss";
import React from "react";
import Login from "../../components/login/login.component";
import Register from "../../components/register/register.component";

const RegisterAndLogin = () => {
  return (
    <div className={"p-5"}>
      <div className="row">
        <div className="col-md-6 col-sm-12">
          <Login />
        </div>
        <div className="col-md-6 col-sm-12">
          <Register />
        </div>
      </div>
    </div>
  );
};

export default RegisterAndLogin;
