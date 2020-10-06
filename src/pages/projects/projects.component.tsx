import React, { useContext, useEffect, useState } from "react";
import "./projects.styles.scss";
import { firestore } from "../../firebase/firebase.utils";
import { Project } from "../../typescript-interfaces/project.interface";
import { Link } from "react-router-dom";
import CurrentUserContext from "../../providers/current-user/current-user.provider";

const Projects = () => {
  const [projectsList, setProjectsList] = useState<Array<Project>>([]);

  const currentUser = useContext(CurrentUserContext);

  useEffect(() => {
    firestore
      .collection("projects")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (currentUser.role === "Admin") {
            setProjectsList((prevState) => [
              ...prevState,
              {
                id: doc.id,
                name: doc.data().name,
                description: doc.data().description,
                status: doc.data().status,
              },
            ]);
          } else if (currentUser.projects.includes(doc.id)) {
            setProjectsList((prevState) => [
              ...prevState,
              {
                id: doc.id,
                name: doc.data().name,
                description: doc.data().description,
                status: doc.data().status,
              },
            ]);
          }
        });
      });
  }, [currentUser.projects, currentUser.role]);

  return (
    <div
      className={"pt-5 pb-3 pl-2 pr-2 mt-5 mr-3 ml-3 mb-5"}
      style={{ minHeight: "81vh" }}
    >
      <h2 className={"text-center"}>PROJECTS PAGE</h2>
      <table className="table table-bordered table-striped table-dark mb-5">
        <thead>
          <tr>
            <th scope="col">S.No.</th>
            <th scope="col">Project Name</th>
            <th scope="col">Project Status</th>
          </tr>
        </thead>
        <tbody>
          {projectsList.map((project, index) => {
            return (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>
                  <Link
                    className={"text-white text-decoration-none"}
                    to={`/bugtrail-v3/project-details/${project.id}`}
                  >
                    {project.name}
                  </Link>
                </td>
                <td>{project.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Projects;
