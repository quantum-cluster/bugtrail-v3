import { firestore } from "firebase";
import { firestore as db } from "../../firebase/firebase.utils";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Ticket } from "../../typescript-interfaces/ticket.interface";
import CurrentUserContext from "../../providers/current-user/current-user.provider";
import { CurrentUser } from "../../typescript-interfaces/current-user.interface";

interface Assignee {
  id: string;
  displayName: string;
  email: string;
}

const TicketDetailsPage = () => {
  let { ticketId } = useParams<{ ticketId: string }>();
  const currentUser: CurrentUser = useContext(CurrentUserContext);

  const [usersList, setUsersList] = useState<Array<Assignee>>([]);
  const [assignee, setAssignee] = useState({
    id: "",
    displayName: "",
    email: "",
  });
  const [status, setStatus] = useState("");

  const [ticket, setTicket] = useState<Ticket>({
    id: "",
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
  });

  useEffect(() => {
    db.collection("tickets")
      .doc(ticketId)
      .get()
      .then(function (doc: firestore.DocumentData) {
        if (doc.exists) {
          const {
            title,
            description,
            imageUrl,
            priority,
            status,
            owner,
            assignee,
            createdAt,
          } = doc.data();
          setTicket({
            id: doc.id,
            title,
            description,
            imageUrl,
            priority,
            status,
            owner,
            assignee,
            createdAt: createdAt.toDate().toString(),
          });
          setAssignee(assignee);
          setStatus(status);
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      })
      .catch(function (error: firestore.FirestoreError) {
        console.error("Error getting document:", error);
      });

    db.collection("users")
      .get()
      .then((querySnapshot: firestore.QuerySnapshot) => {
        querySnapshot.forEach((doc) => {
          setUsersList((prevState) => [
            ...prevState,
            {
              id: doc.id,
              displayName: doc.data().displayName,
              email: doc.data().email,
            },
          ]);
        });
      })
      .catch((error: firestore.FirestoreError) => {
        console.error("couldn't fetch the users list: ", error);
      });
  }, [ticketId]);

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

    // Add a new document in collection "cities"
    db.collection("tickets")
      .doc(ticketId)
      .set(
        {
          assignee,
          status,
        },
        { merge: true }
      )
      .then(() => {
        console.log("Document successfully written!");
      })
      .then(() => {
        refreshComponent();
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  };

  const refreshComponent = () => {
    window.location.reload();
  };

  const handleChangeStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(event.target.value);
  };

  const handleSubmitStatus = (event: React.FormEvent) => {
    event.preventDefault();

    db.collection("tickets")
      .doc(ticketId)
      .set(
        {
          status,
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
  };

  return (
    <div className={"pt-3 pb-3 pl-2 pr-2 mt-5 mr-3 ml-3 mb-5"}>
      <h2 className={"text-center"}>Ticket Details Page</h2>
      <div className="card border-dark mb-5">
        <ul className="list-group">
          <li className="list-group-item">
            <span className={"badge badge-dark"}>ID</span> {ticketId}
          </li>
          <li className="list-group-item">
            <span className={"badge badge-dark"}>Title</span> {ticket.title}
          </li>
          <li className="list-group-item">
            <span className={"badge badge-dark"}>Description</span>{" "}
            {ticket.description}
          </li>
          <li className={"list-group-item"}>
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
            {currentUser.role === "triage" ? (
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
                case "tester":
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

                case "triage":
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
                      </select>{" "}
                      <button
                        className="btn btn-sm btn-dark"
                        onClick={handleSubmitStatus}
                      >
                        Change Status
                      </button>
                    </div>
                  );

                case "developer":
                  return ticket.assignee.displayName ===
                    currentUser.displayName ? (
                    <div className={"mt-3"}>
                      <select
                        className="text-center"
                        name={"assignee"}
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
    </div>
  );
};

export default TicketDetailsPage;
