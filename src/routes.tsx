import React, { useEffect, useState } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import DefectForm from "./components/defect-form/defect-form.component";
import Footer from "./components/footer/footer.component";
import Navbar from "./components/navbar/navbar.component";
import ViewTickets from "./components/view-tickets/view-tickets.component";
import { auth, createUserProfileDocument } from "./firebase/firebase.utils";
import Homepage from "./pages/homepage/homepage.component";
import RegisterAndLogin from "./pages/register-and-login/register-and-login.component";
import TicketDetailsPage from "./pages/ticket-details/ticket-details.component";
import CurrentUserContext from "./providers/current-user/current-user.provider";
import { CurrentUser } from "./typescript-interfaces/current-user.interface";

const Routes = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: "",
    email: "",
    displayName: "",
    role: "",
    myTickets: [],
  });

  useEffect(() => {
    const unsubscribeFromAuth = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        const userRef = await createUserProfileDocument(userAuth, undefined);

        userRef?.onSnapshot((snapShot) => {
          setCurrentUser({
            id: snapShot.id,
            email: snapShot.data()?.email,
            displayName: snapShot.data()?.displayName,
            role: snapShot.data()?.role,
            myTickets: snapShot.data()?.myTickets,
          });
        });
      }
    });
    return () => {
      unsubscribeFromAuth();
    };
  }, []);

  return (
    <div>
      <CurrentUserContext.Provider value={currentUser}>
        <BrowserRouter>
          <Navbar />
          <Switch>
            <Route exact path={"/bugtrail-v2"} component={Homepage} />
            <Route
              exact
              path={"/bugtrail-v2/register-and-login"}
              component={RegisterAndLogin}
            />
            <Route
              exact
              path={"/bugtrail-v2/new-defect"}
              component={DefectForm}
            />
            <Route path={"/bugtrail-v2/view-tickets"} component={ViewTickets} />
            <Route
              exact
              path={"/bugtrail-v2/ticket-details/:ticketId"}
              component={TicketDetailsPage}
            />
          </Switch>
        </BrowserRouter>
      </CurrentUserContext.Provider>
      <Footer />
    </div>
  );
};

export default Routes;
