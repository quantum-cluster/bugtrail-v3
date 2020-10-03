import { createContext } from "react";
import { CurrentUser } from "../../typescript-interfaces/current-user.interface";

const CurrentUserContext = createContext<CurrentUser>({
  id: "",
  email: "",
  displayName: "",
  role: "",
  myTickets: [],
  projects: [],
});

export default CurrentUserContext;
