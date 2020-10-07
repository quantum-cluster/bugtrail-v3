import { firestore } from "firebase";
import { firestore as db } from "../../firebase/firebase.utils";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Ticket } from "../../typescript-interfaces/ticket.interface";
import CurrentUserContext from "../../providers/current-user/current-user.provider";
import { CurrentUser } from "../../typescript-interfaces/current-user.interface";

interface Assignee {
  id: string;
  displayName: string;
  email: string;
}

interface Comment {
  personName: string;
  personRole: string;
  timestamp: Date;
  comment: string;
}

const TicketDetailsPage = () => {
  let { ticketId } = useParams<{ ticketId: string }>();
  const currentUser: CurrentUser = useContext(CurrentUserContext);

  const [refresh, setRefresh] = useState(true);
  const [projectId, setProjectId] = useState("");
  const [usersList, setUsersList] = useState<Array<Assignee>>([]);
  const [assignee, setAssignee] = useState({
    id: "",
    displayName: "",
    email: "",
  });
  const [status, setStatus] = useState("");
  const [comment, setcomment] = useState("");
  const [ticket, setTicket] = useState<Ticket>({
    id: "",
    project: {
      projectId: "",
      projectName: "",
    },
    title: "",
    description: "",
    imageUrl: "",
    priority: "",
    status: "",
    owner: {
      displayName: "",
      email: "",
      id: "",
    },
    assignee: {
      displayName: "",
      email: "",
      id: "",
    },
    createdAt: "",
    logs: [],
    comments: [],
  });

  useEffect(() => {
    db.collection("tickets")
      .doc(ticketId)
      .get()
      .then(function (doc: firestore.DocumentData) {
        if (doc.exists) {
          const {
            project,
            title,
            description,
            imageUrl,
            priority,
            status,
            owner,
            assignee,
            createdAt,
            logs,
            comments,
          } = doc.data();
          setTicket({
            id: doc.id,
            project,
            title,
            description,
            imageUrl,
            priority,
            status,
            owner,
            assignee,
            createdAt: createdAt.toDate().toString(),
            logs,
            comments,
          });
          setAssignee(assignee);
          setStatus(status);
          setProjectId(project.projectId);
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      })
      .then(() => {
        db.collection("users")
          .get()
          .then((querySnapshot: firestore.QuerySnapshot) => {
            setUsersList([]);

            querySnapshot.forEach((doc) => {
              if (doc.data().projects.includes(projectId)) {
                setUsersList((prevState) => [
                  ...prevState,
                  {
                    id: doc.id,
                    displayName: doc.data().displayName,
                    email: doc.data().email,
                  },
                ]);
              }
            });
          })
          .catch((error: firestore.FirestoreError) => {
            console.error("couldn't fetch the users list: ", error);
          });
      })
      .catch(function (error: firestore.FirestoreError) {
        console.error("Error getting document:", error);
      });
  }, [ticketId, projectId, refresh]);

  const handleChangeAssignee = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    usersList.forEach((user) => {
      if (user.displayName === event.target.value) {
        setAssignee(user);
      }
    });
  };

  const handleSubmitAssignee = (event: React.FormEvent) => {
    event.preventDefault();
    const status = assignee ? "assigned" : "unassigned";

    let logsArray: Array<{
      personName: string;
      timestamp: Date;
      changedStatusTo: string;
    }> = [];

    db.collection("tickets")
      .doc(ticketId)
      .get()
      .then((doc: firestore.DocumentData) => {
        if (doc.exists) {
          logsArray = doc.data().logs;
        }
      })
      .then(() => {
        db.collection("tickets")
          .doc(ticketId)
          .set(
            {
              assignee,
              status,
              logs: [
                ...logsArray,
                {
                  personName: currentUser.displayName,
                  personRole: currentUser.role,
                  timestamp: new Date(),
                  statusChangedTo: status,
                },
              ],
            },
            { merge: true }
          )
          .then(() => {
            console.log("Status changed successfully!");
          })
          .then(() => {
            refreshComponent();
          })
          .catch((error) => {
            console.error("Error changing status: ", error);
          });
      })
      .catch((error) => {
        console.error("Couldn't fetch logs array: ", error);
      });
  };

  const refreshComponent = () => {
    setRefresh((prevState) => !prevState);
  };

  const handleChangeStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(event.target.value);
  };

  const handleSubmitStatus = (event: React.FormEvent) => {
    event.preventDefault();

    let logsArray: Array<{
      personName: string;
      timestamp: Date;
      changedStatusTo: string;
    }> = [];

    db.collection("tickets")
      .doc(ticketId)
      .get()
      .then((doc: firestore.DocumentData) => {
        if (doc.exists) {
          logsArray = doc.data().logs;
        }
      })
      .then(() => {
        db.collection("tickets")
          .doc(ticketId)
          .set(
            {
              status,
              logs: [
                ...logsArray,
                {
                  personName: currentUser.displayName,
                  personRole: currentUser.role,
                  timestamp: new Date(),
                  statusChangedTo: status,
                },
              ],
            },
            { merge: true }
          )
          .then(() => {
            console.log("Status changed successfully!");
          })
          .then(() => {
            refreshComponent();
          })
          .catch((error) => {
            console.error("Error changing status: ", error);
          });
      })
      .catch((error) => {
        console.error("Couldn't fetch logs array: ", error);
      });
  };

  const handleCommentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setcomment(event.target.value);
  };

  const handleSubmitComment = (event: React.FormEvent) => {
    event.preventDefault();

    let commentsArray: Array<Comment> = [];

    db.collection("tickets")
      .doc(ticketId)
      .get()
      .then((doc: firestore.DocumentData) => {
        if (doc.exists) {
          commentsArray = doc.data().comments;
        }
      })
      .then(() => {
        db.collection("tickets")
          .doc(ticketId)
          .set(
            {
              comments: [
                ...commentsArray,
                {
                  personName: currentUser.displayName,
                  personRole: currentUser.role,
                  timestamp: new Date(),
                  comment,
                },
              ],
            },
            { merge: true }
          )
          .then(() => {
            console.log("Successfully added the comment.");
            setcomment("");
          })
          .catch((error) => {
            console.error("Couldn't add the comment: ", error);
          })
          .finally(() => {
            refreshComponent();
          });
      })
      .catch((error) => {
        console.error("Couldn't fetch comments array: ", error);
      });
  };

  return (
    <div
      className={"pt-3 pb-3 pl-2 pr-2 mt-5 mr-3 ml-3 mb-5"}
      style={{ minHeight: "81vh" }}
    >
      <h2 className={"text-center"}>
        Ticket Details Page{" "}
        {currentUser.id === ticket.owner.id ? (
          <Link to={`/bugtrail-v3/edit-defect/${ticket.id}`}>
            <button className="btn btn-warning border-dark">Edit Ticket</button>
          </Link>
        ) : undefined}
      </h2>
      <div className="card border-dark mb-5">
        <ul className="list-group">
          <li className="list-group-item">
            <span className={"badge badge-dark"}>ID</span> {ticketId}
          </li>
          <li className="list-group-item">
            <span className={"badge badge-dark"}>Project Name</span>{" "}
            {ticket.project.projectName}
          </li>
          <li className="list-group-item">
            <span className={"badge badge-dark"}>Title</span> {ticket.title}
          </li>
          <li className="list-group-item">
            <span className={"badge badge-dark"}>Description</span>{" "}
            {ticket.description}
          </li>
          <li className="list-group-item">
            <span className={"badge badge-dark"}>Priority</span>{" "}
            {ticket.priority}
          </li>
          <li className={"list-group-item"}>
            <div className={"mb-3"}>
              <span className={"badge badge-dark"}>Screenshot</span>
            </div>

            <img
              src={ticket.imageUrl}
              alt="defect screenshot"
              className={"img-fluid"}
            />
          </li>
          <li className="list-group-item">
            <span className={"badge badge-dark"}>Created At</span>{" "}
            {ticket.createdAt}
          </li>
          <li className="list-group-item">
            <span className={"badge badge-dark"}>Owner</span>{" "}
            {ticket.owner.displayName}
          </li>
          <li className="list-group-item">
            <span className={"badge badge-dark"}>Asignee</span>{" "}
            {ticket.assignee.displayName}
            {currentUser.role === "Triage" || currentUser.role === "Admin" ? (
              <div className={"mt-3"}>
                <select
                  className="text-center"
                  name={"assignee"}
                  id="assignee"
                  value={assignee.displayName}
                  onChange={handleChangeAssignee}
                >
                  <option className={""}>--Select--</option>
                  {usersList.map((user, index) => (
                    <option key={index}>{user.displayName}</option>
                  ))}
                </select>{" "}
                <button
                  className="btn btn-sm btn-dark"
                  onClick={handleSubmitAssignee}
                >
                  Change Assignee
                </button>
              </div>
            ) : (
              ""
            )}
          </li>
          <li className="list-group-item">
            <span className={"badge badge-dark"}>Status</span> {ticket.status}
            {(function () {
              switch (currentUser.role) {
                case "Tester":
                  return ticket.assignee.displayName ===
                    currentUser.displayName ? (
                    <div className={"mt-3"}>
                      <select
                        className="text-center"
                        name={"status"}
                        id="status"
                        value={status}
                        onChange={handleChangeStatus}
                      >
                        <option className={""}>--Select--</option>
                        <option>passed</option>
                        <option>failed</option>
                      </select>{" "}
                      <button
                        className="btn btn-sm btn-dark"
                        onClick={handleSubmitStatus}
                      >
                        Change Status
                      </button>
                    </div>
                  ) : (
                    ""
                  );

                case "Triage":
                  return (
                    <div className={"mt-3"}>
                      <select
                        className="text-center"
                        name={"status"}
                        id="status"
                        value={status}
                        onChange={handleChangeStatus}
                      >
                        <option className={""}>--Select--</option>
                        <option>assigned</option>
                        <option>duplicate</option>
                        <option>rejected</option>
                        <option>closed</option>
                        <option>in-testing</option>
                        <option>tested</option>
                        <option>passed</option>
                        <option>failed</option>
                      </select>{" "}
                      <button
                        className="btn btn-sm btn-dark"
                        onClick={handleSubmitStatus}
                      >
                        Change Status
                      </button>
                    </div>
                  );

                case "Admin":
                  return (
                    <div className={"mt-3"}>
                      <select
                        className="text-center"
                        name={"status"}
                        id="status"
                        value={status}
                        onChange={handleChangeStatus}
                      >
                        <option className={""}>--Select--</option>
                        <option>assigned</option>
                        <option>duplicate</option>
                        <option>rejected</option>
                        <option>closed</option>
                        <option>in-testing</option>
                        <option>tested</option>
                        <option>in-progress</option>
                        <option>on-hold</option>
                        <option>fixed</option>
                      </select>{" "}
                      <button
                        className="btn btn-sm btn-dark"
                        onClick={handleSubmitStatus}
                      >
                        Change Status
                      </button>
                    </div>
                  );

                case "Developer":
                  return ticket.assignee.displayName ===
                    currentUser.displayName ? (
                    <div className={"mt-3"}>
                      <select
                        className="text-center"
                        name={"status"}
                        id="exampleFormControlSelect1"
                        value={status}
                        onChange={handleChangeStatus}
                      >
                        <option className={""}>--Select--</option>
                        <option>in-progress</option>
                        <option>on-hold</option>
                        <option>fixed</option>
                      </select>{" "}
                      <button
                        className="btn btn-sm btn-dark"
                        onClick={handleSubmitStatus}
                      >
                        Change Status
                      </button>
                    </div>
                  ) : (
                    ""
                  );

                default:
                  break;
              }
            })()}
          </li>
        </ul>
      </div>
      <h4 className={"text-center"}>Ticket change history</h4>
      <table className="table table-striped table-bordered table-dark">
        <thead>
          <tr>
            <th scope="col">S.No.</th>
            <th scope="col">Person</th>
            <th scope="col">Role</th>
            <th scope="col">Changed the status to</th>
            <th scope="col">on Date</th>
          </tr>
        </thead>
        <tbody>
          {ticket.logs.map((log, index) => {
            return (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{log.personName}</td>
                <td>{log.personRole}</td>
                <td>{log.statusChangedTo}</td>
                <td>{log.timestamp.toDate().toString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <h4 className={"text-center"}>Ticket comment history</h4>
      <table className="table table-striped table-bordered table-dark">
        <thead>
          <tr>
            <th scope="col">S.No.</th>
            <th scope="col">Person</th>
            <th scope="col">Role</th>
            <th scope="col">Comment</th>
          </tr>
        </thead>
        <tbody>
          {ticket.comments.map((comment, index) => {
            return (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{comment.personName}</td>
                <td>{comment.personRole}</td>
                <td>{comment.comment}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <form onSubmit={handleSubmitComment}>
        <div className="form-group">
          <label htmlFor="ticketComment">Add Comment</label>
          <textarea
            className={"form-control"}
            id="ticketComment"
            placeholder={"Enter your comment here..."}
            rows={3}
            value={comment}
            onChange={handleCommentChange}
          />
        </div>
        <button className="btn btn-dark">Submit Comment</button>
      </form>
    </div>
  );
};

export default TicketDetailsPage;
