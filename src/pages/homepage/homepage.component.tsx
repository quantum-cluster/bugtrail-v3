import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import CurrentUserContext from "../../providers/current-user/current-user.provider";
import { CurrentUser } from "../../typescript-interfaces/current-user.interface";
import "./homepage.styles.scss";

const Homepage = () => {
  const currentUser: CurrentUser = useContext(CurrentUserContext);

  useEffect(() => {
    console.log("Current User Context: ", currentUser);
  }, [currentUser]);

  return (
    <div className={"pt-3 pb-3 mt-5"}>
      {currentUser.email ? (
        <div className="card border-dark m-5">
          <h5 className="card-header text-white bg-dark">User Dashboard</h5>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3 mb-5">
                <div className="card border-dark">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      <Link
                        className={"link-font"}
                        to={"/bugtrail-v3/projects"}
                      >
                        {currentUser.role === "admin"
                          ? "View All Projects"
                          : "View My Projects"}
                      </Link>
                    </li>
                    <li className="list-group-item">
                      <Link
                        className={"link-font"}
                        to={"/bugtrail-v3/new-project"}
                      >
                        Create A New Project
                      </Link>
                    </li>
                    <li className="list-group-item">
                      <Link
                        className={"link-font"}
                        to={"/bugtrail-v3/new-defect"}
                      >
                        Raise A New Defect
                      </Link>
                    </li>
                    <li className="list-group-item">
                      <Link
                        className={"link-font"}
                        to={"/bugtrail-v3/view-tickets?type=my"}
                      >
                        My Tickets
                      </Link>
                    </li>
                    <li className="list-group-item">
                      <Link
                        className={"link-font"}
                        to={"/bugtrail-v3/view-tickets?type=all"}
                      >
                        All Tickets
                      </Link>
                    </li>
                    <li className="list-group-item">
                      <Link
                        className={"link-font"}
                        to={"/bugtrail-v3/view-tickets?type=assigned-to-me"}
                      >
                        Tickets Assigned To Me
                      </Link>
                    </li>
                    {currentUser.role === "triage" ? (
                      <li className="list-group-item">
                        <Link
                          className={"link-font"}
                          to={"/bugtrail-v3/view-tickets?type=unassigned"}
                        >
                          Unassigned Tickets
                        </Link>
                      </li>
                    ) : null}
                    {currentUser.role === "triage" ? (
                      <li className="list-group-item">
                        <Link
                          className={"link-font"}
                          to={"/bugtrail-v3/view-tickets?type=fixed"}
                        >
                          Fixed Tickets
                        </Link>
                      </li>
                    ) : null}
                    {currentUser.role === "triage" ? (
                      <li className="list-group-item">
                        <Link
                          className={"link-font"}
                          to={"/bugtrail-v3/view-tickets?type=failed"}
                        >
                          Failed Tickets
                        </Link>
                      </li>
                    ) : null}
                  </ul>
                </div>
              </div>

              <div className="col-md-9 mb-5">
                <div className="card border-dark">
                  <h5 className="card-header text-white bg-dark">
                    {currentUser.displayName}
                  </h5>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      <span className="badge badge-dark badge-pill">
                        User ID
                      </span>{" "}
                      {currentUser.id}
                    </li>
                    <li className="list-group-item">
                      <span className="badge badge-dark badge-pill">Name</span>{" "}
                      {currentUser.displayName}
                    </li>
                    <li className="list-group-item">
                      <span className="badge badge-dark badge-pill">Email</span>{" "}
                      {currentUser.email}
                    </li>
                    <li className="list-group-item">
                      <span className="badge badge-dark badge-pill">
                        Role Assigned
                      </span>{" "}
                      {currentUser.role}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <h2 className={"text-center"}>
          Welcome to Bugtrail. A bug tracking software. Please register or login
          to continue.
        </h2>
      )}
    </div>
  );
};

export default Homepage;
