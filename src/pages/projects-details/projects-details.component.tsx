import "./projects-details.styles.scss";
import React, { useContext, useEffect, useState } from "react";
import { Project } from "../../typescript-interfaces/project.interface";
import { firestore as db } from "../../firebase/firebase.utils";
import { Link, useParams } from "react-router-dom";
import { firestore } from "firebase";
import CurrentUserContext from "../../providers/current-user/current-user.provider";

interface Member {
  id: string;
  displayName: string;
  email: string;
  role: string;
  projects: Array<string>;
}

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const currentUser = useContext(CurrentUserContext);

  const [refresh, setRefresh] = useState(false);
  const [project, setProject] = useState<Project>();
  const [projectMembers, setProjectMembers] = useState<Array<Member>>([]);
  const [nonMembers, setNonMembers] = useState<Array<Member>>([]);
  const [personToAdd, setPersonToAdd] = useState("");

  const [priorityLow, setPriorityLow] = useState(0);
  const [priorityMedium, setPriorityMedium] = useState(0);
  const [priorityHigh, setPriorityHigh] = useState(0);
  const [prioritySevere, setPrioritySevere] = useState(0);
  const [priorityFeatureRequest, setPriorityFeatureRequest] = useState(0);

  useEffect(() => {
    db.collection("projects")
      .doc(projectId)
      .get()
      .then((doc: firestore.DocumentData) => {
        if (doc.exists) {
          const { name, description, status } = doc.data();
          setProject({
            id: doc.id,
            name,
            description,
            status,
          });
        } else {
          console.log("No such document!");
        }
      })
      .then(() => {
        setProjectMembers([]);
        setNonMembers([]);

        db.collection("users")
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach(function (doc) {
              // If the user is a member of this project then add him to "people" array.
              const { displayName, email, role, projects } = doc.data();
              if (projects.includes(projectId)) {
                setProjectMembers((prevState) => [
                  ...prevState,
                  {
                    id: doc.id,
                    displayName,
                    email,
                    role,
                    projects,
                  },
                ]);
              } else {
                setNonMembers((prevState) => [
                  ...prevState,
                  {
                    id: doc.id,
                    displayName,
                    email,
                    role,
                    projects,
                  },
                ]);
              }
            });
          });
      })
      .then(() => {
        setPriorityFeatureRequest(0);
        setPriorityHigh(0);
        setPriorityLow(0);
        setPriorityMedium(0);
        setPrioritySevere(0);

        db.collection("tickets")
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc: firestore.DocumentData) => {
              if (doc.data().project.projectId === projectId) {
                switch (doc.data().priority) {
                  case "Low":
                    setPriorityLow((prevState) => prevState + 1);
                    break;

                  case "Medium":
                    setPriorityMedium((prevState) => prevState + 1);
                    break;

                  case "High":
                    setPriorityHigh((prevState) => prevState + 1);
                    break;

                  case "Severe":
                    setPrioritySevere((prevState) => prevState + 1);
                    break;

                  case "Feature request":
                    setPriorityFeatureRequest((prevState) => prevState + 1);
                    break;

                  default:
                    break;
                }
              }
            });
          })
          .catch((error) => {
            console.error("Ticket priorities couldn't be fetched: ", error);
          });
      })
      .catch(function (error) {
        console.log("Error getting document:", error);
      });
  }, [projectId, refresh]);

  const handleChangePersonToAdd = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPersonToAdd(event.target.value);
  };

  const handleAddMember = (event: React.FormEvent) => {
    event.preventDefault();

    let projectsArray: Array<string>;

    db.collection("users")
      .doc(personToAdd)
      .get()
      .then((doc: firestore.DocumentData) => {
        if (doc.exists) {
          projectsArray = doc.data().projects;
        } else {
          console.log("No such document!");
        }
      })
      .then(() => {
        db.collection("users")
          .doc(personToAdd)
          .set(
            {
              projects: [...projectsArray, projectId],
            },
            { merge: true }
          )
          .then(() => {
            console.log("projects updated successfully!");
          })
          .then(() => {
            refreshComponent();
          })
          .catch((error) => {
            console.error("couldn't update projects!", error);
          });
      })
      .catch((error) => {
        console.error("Error getting document: ", error);
      });
  };

  const handleRemoveMember = (memberId: string) => (event: React.FormEvent) => {
    event.preventDefault();

    let projectsArray: Array<string> = [];

    db.collection("users")
      .doc(memberId)
      .get()
      .then((doc: firestore.DocumentData) => {
        if (doc.exists) {
          projectsArray = doc.data().projects;

          if (projectsArray && projectsArray.includes(projectId)) {
            projectsArray.splice(projectsArray.indexOf(projectId), 1);
          } else {
            console.log("User isn't a part of this project!");
          }
        }
      })
      .then(() => {
        console.log("Entered 2nd then block");

        db.collection("users")
          .doc(memberId)
          .set(
            {
              projects: projectsArray,
            },
            { merge: true }
          )
          .then(() => {
            console.log("project removed successfully!");
          })
          .then(() => {
            refreshComponent();
          })
          .catch((error) => {
            console.error("couldn't remove project!", error);
          });
      })
      .catch((error) => {
        console.error("Couldn't remove user from project: ", error);
      });
  };

  const refreshComponent = () => {
    // window.location.reload();
    setRefresh((prevState) => !prevState);
  };

  return (
    <div
      className={"pt-3 pb-3 pl-2 pr-2 mt-5 mr-3 ml-3 mb-5"}
      style={{ minHeight: "81vh" }}
    >
      <h2 className="text-center">Project Details Page</h2>
      <div className="card border-dark mb-3">
        <div className="card-header text-white bg-dark">
          Name: {project?.name}
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 col-sm-12">
              <div className="card border-dark mb-3">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <Link
                      className={"text-decoration-none text-dark"}
                      to={`/bugtrail-v3/new-defect/${projectId}`}
                    >
                      Raise a new Defect
                    </Link>
                  </li>
                  <li className="list-group-item">
                    <Link
                      className={"text-decoration-none text-dark"}
                      to={`/bugtrail-v3/view-tickets/?projectId=${projectId}&type=all`}
                    >
                      View all tickets for:-
                      <div
                        style={{
                          textTransform: "uppercase",
                          fontWeight: "bold",
                        }}
                      >
                        {project?.name}
                      </div>
                    </Link>
                  </li>
                  {currentUser.role === "Admin" ? (
                    <li className="list-group-item">
                    Add people to the project
                    <form onSubmit={handleAddMember}>
                      <div className={"form-group mt-3"}>
                        <select
                          className={"form-control"}
                          value={personToAdd}
                          onChange={handleChangePersonToAdd}
                          name="addMembers"
                        >
                          <option>--Select One--</option>
                          {nonMembers.map((person) => {
                            return (
                              <option value={person.id} key={person.id}>
                                {person.displayName}@{person.email}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <button type={"submit"} className="btn btn-dark">
                        Add Member
                      </button>
                    </form>
                  </li>
                  ) : undefined}
                </ul>
              </div>
            </div>
            <div className="col-md-9 col-sm-12">
              <div className="card border-dark">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <span className="badge badge-pill badge-dark">ID</span>{" "}
                    {project?.id}
                  </li>
                  <li className="list-group-item">
                    <span className="badge badge-pill badge-dark">
                      Descrition
                    </span>{" "}
                    {project?.description}
                  </li>
                  <li className="list-group-item">
                    <span className="badge badge-pill badge-dark">status</span>{" "}
                    {project?.status}
                  </li>
                  <li className="list-group-item">
                    <span className="badge badge-pill badge-dark">Severe</span>{" "}
                    {prioritySevere}
                  </li>
                  <li className="list-group-item">
                    <span className="badge badge-pill badge-dark">High</span>{" "}
                    {priorityHigh}
                  </li>
                  <li className="list-group-item">
                    <span className="badge badge-pill badge-dark">Medium</span>{" "}
                    {priorityMedium}
                  </li>
                  <li className="list-group-item">
                    <span className="badge badge-pill badge-dark">Low</span>{" "}
                    {priorityLow}
                  </li>
                  <li className="list-group-item">
                    <span className="badge badge-pill badge-dark">
                      Feature Request
                    </span>{" "}
                    {priorityFeatureRequest}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <table className="table table-striped table-bordered table-dark mb-5">
        <thead>
          <tr>
            <th scope="col">S.No.</th>
            <th scope="col">Project Members</th>
            <th scope="col">Members Emails</th>
            <th scope="col">Roles</th>
          </tr>
        </thead>
        <tbody>
          {projectMembers.map((person, index) => {
            return (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{person.displayName}</td>
                <td>{person.email}</td>
                <td>{person.role}</td>
                <td className={"text-center"}>
                  <button
                    className="btn btn-danger"
                    onClick={handleRemoveMember(person.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectDetails;
