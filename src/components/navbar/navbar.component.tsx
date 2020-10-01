import React, { useContext } from "react";
import { Link, withRouter, useHistory } from "react-router-dom";
import { auth } from "../../firebase/firebase.utils";
import CurrentUserContext from "../../providers/current-user/current-user.provider";
import { CurrentUser } from "../../typescript-interfaces/current-user.interface";
import "./navbar.styles.scss";

const Navbar = () => {
  const history = useHistory();
  const currentUser: CurrentUser = useContext(CurrentUserContext);

  const refreshComponent = () => {
    window.location.reload();
  };

  return (
    <div className={"bootstrap-navbar"}>
      <nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
        <Link to={"/bugtrail-v3"} className={"navbar-brand"}>
          BUGTRAIL
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li
              className={`nav-item ${
                history.location.pathname === "/bugtrail-v3" ? "active" : ""
              }`}
            >
              <Link to={"/bugtrail-v3"} className={"nav-link"}>
                Home <span className="sr-only">(current)</span>
              </Link>
            </li>
            <li
              className={`nav-item ${
                history.location.pathname === "/bugtrail-v3/register-and-login"
                  ? "active"
                  : ""
              }`}
            >
              {!currentUser.email && (
                <Link
                  to={"/bugtrail-v3/register-and-login"}
                  className={"nav-link"}
                >
                  Login and Register
                </Link>
              )}
            </li>
            <li>
              {currentUser.email && (
                <div
                  className={"nav-link"}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    auth.signOut();
                    history.push("/bugtrail-v3");
                    refreshComponent();
                  }}
                >
                  Logout
                </div>
              )}
            </li>
          </ul>
          <span className="navbar-text ml-auto">
            {currentUser.email ? `Hi, ${currentUser.displayName}` : ""}
          </span>
        </div>
      </nav>
    </div>
  );
};

export default withRouter(Navbar);
