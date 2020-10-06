import { firestore } from "firebase";
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { firestore as db } from "../../firebase/firebase.utils";
import CurrentUserContext from "../../providers/current-user/current-user.provider";
import { CurrentUser } from "../../typescript-interfaces/current-user.interface";
import { Ticket } from "../../typescript-interfaces/ticket.interface";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ViewTickets = () => {
  let query = useQuery();
  let type = query.get("type");
  let projectId = query.get("projectId");

  const [ticketsList, setTicketsList] = useState<Array<Ticket>>([]);

  const currentUser: CurrentUser = useContext(CurrentUserContext);

  useEffect(() => {
    setTicketsList([]);

    let ticketsArray: Array<Ticket> = [];

    db.collection("tickets")
      .orderBy("createdAt", "desc")
      .get()
      .then((querySnapshot: firestore.QuerySnapshot) => {
        querySnapshot.forEach((doc) => {
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

          ticketsArray.push({
            id: doc.id,
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
          });
        });
      })
      .then(() => {
        switch (type) {
          case "all":
            setTicketsList(
              ticketsArray.filter((ticket) => {
                if (projectId) {
                  if (ticket.project.projectId === projectId) {
                    return ticket;
                  } else {
                    return undefined;
                  }
                }
                return ticket;
              })
            );
            break;

          case "my":
            setTicketsList(
              ticketsArray.filter((ticket) => {
                if (ticket.owner.id === currentUser.id) {
                  if (projectId) {
                    if (ticket.project.projectId === projectId) {
                      return ticket;
                    }
                  } else {
                    return ticket;
                  }
                }
                return undefined;
              })
            );
            break;

          case "assigned-to-me":
            setTicketsList(
              ticketsArray.filter((ticket) => {
                if (ticket.assignee.id === currentUser.id) {
                  if (projectId) {
                    if (ticket.project.projectId === projectId) {
                      return ticket;
                    }
                  } else {
                    return ticket;
                  }
                }
                return undefined;
              })
            );
            break;

          case "unassigned":
            setTicketsList(
              ticketsArray.filter((ticket) => {
                if (ticket.status === "unassigned") {
                  if (projectId) {
                    if (ticket.project.projectId === projectId) {
                      return ticket;
                    }
                  } else {
                    return ticket;
                  }
                }
                return undefined;
              })
            );
            break;

          case "fixed":
            setTicketsList(
              ticketsArray.filter((ticket) => {
                if (ticket.status === "fixed") {
                  if (projectId) {
                    if (ticket.project.projectId === projectId) {
                      return ticket;
                    }
                  } else {
                    return ticket;
                  }
                }
                return undefined;
              })
            );
            break;

          case "failed":
            setTicketsList(
              ticketsArray.filter((ticket) => {
                if (ticket.status === "failed") {
                  if (projectId) {
                    if (ticket.project.projectId === projectId) {
                      return ticket;
                    }
                  } else {
                    return ticket;
                  }
                }
                return undefined;
              })
            );
            break;

          default:
            break;
        }
      })
      .catch((error) => {
        console.error("Couldn't fetch tickets: ", error);
      });
  }, [type, currentUser, projectId]);

  return (
    <div
      className="pt-3 pb-3 pl-2 pr-2 mt-5 mr-3 ml-3 mb-5"
      style={{ minHeight: "81vh" }}
    >
      <h2 className={"text-center"}>View Tickets Here</h2>
      {ticketsList.length > 0 ? (
        <table className="table table-bordered table-striped table-dark mb-5">
          <thead>
            <tr>
              <th scope="col">S.No.</th>
              <th scope="col">Issue Title</th>
              <th scope="col">Project</th>
              <th scope="col">Issue Priority</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {ticketsList.map((ticket, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>
                  <Link
                    className={"text-white"}
                    to={`/bugtrail-v3/ticket-details/${ticket.id}`}
                  >
                    {ticket.title}
                  </Link>
                </td>
                <td>
                  {ticket.project?.projectName
                    ? ticket.project.projectName
                    : ""}
                </td>
                <td>{ticket.priority}</td>
                <td>{ticket.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <h3 className={"text-center pt-5"}>No tickets found</h3>
      )}
    </div>
  );
};

export default ViewTickets;
