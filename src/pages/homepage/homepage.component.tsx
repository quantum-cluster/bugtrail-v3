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
    <div className={"pt-3 pr-5 pl-5"}>
      {currentUser.email ? (
        <div className="card border-dark">
          <h5 className="card-header text-white bg-dark">User Dashboard</h5>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3">
                <div className="card border-dark">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      <Link to={"/bugtrail-v2/new-defect"}>
                        Raise A New Defect
                      </Link>
                    </li>
                    <li className="list-group-item">
                      <Link to={"/bugtrail-v2/view-tickets?type=my"}>
                        My Tickets
                      </Link>
                    </li>
                    <li className="list-group-item">
                      <Link to={"/bugtrail-v2/view-tickets?type=all"}>
                        All Tickets
                      </Link>
                    </li>
                    <li className="list-group-item">
                      <Link
                        to={"/bugtrail-v2/view-tickets?type=assigned-to-me"}
                      >
                        Tickets Assigned To Me
                      </Link>
                    </li>
                    {currentUser.role === "triage" ? (
                      <li className="list-group-item">
                        <Link to={"/bugtrail-v2/view-tickets?type=unassigned"}>
                          Unassigned Tickets
                        </Link>
                      </li>
                    ) : null}
                    {currentUser.role === "triage" ? (
                      <li className="list-group-item">
                        <Link to={"/bugtrail-v2/view-tickets?type=fixed"}>
                          Fixed Tickets
                        </Link>
                      </li>
                    ) : null}
                    {currentUser.role === "triage" ? (
                      <li className="list-group-item">
                        <Link to={"/bugtrail-v2/view-tickets?type=failed"}>
                          Failed Tickets
                        </Link>
                      </li>
                    ) : null}
                  </ul>
                </div>
              </div>

              <div className="col-md-9">
                <div className="card border-dark">
                  <h5 className="card-header text-white bg-dark">{currentUser.displayName}</h5>
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
                      Tester
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <h2>
          Welcome to Bugtrail. A bug tracking software. Please register or login
          to continue.
        </h2>
      )}
    </div>
  );
};

export default Homepage;
