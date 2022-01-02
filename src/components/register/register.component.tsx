import "./register.styles.scss";
import React, { useState } from "react";
import { auth, createUserProfileDocument } from "../../firebase/firebase.utils";
import { useHistory } from "react-router-dom";

interface UserRegister {
  [fieldName: string]: string;
}

const Register = () => {
  const history = useHistory();
  const [userCredentials, setUserCredentials] = useState<UserRegister>({
    fName: "Developer",
    lName: "Schwarz",
    role: "Developer",
    email: "developer@nikhil.com",
    password: "12345678",
    confirmPassword: "12345678",
  });

  const { fName, lName, role, email, password, confirmPassword } =
    userCredentials;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setUserCredentials((prevUserCredentials) => ({
      ...prevUserCredentials,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    console.log("Entered handleSubmit");
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const { user }: any = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      await createUserProfileDocument(user, {
        displayName: `${fName} ${lName}`,
        role,
        createdProjects: [""],
        projects: [""],
      });
      setUserCredentials({
        fName: "",
        lName: "",
        role: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      history.push("/bugtrail-v3");
    } catch (error) {
      console.error("Error creating user: ", error);
    }
  };

  return (
    <div className={"text-center mb-5 mt-5"}>
      <form className="form-signin" onSubmit={handleSubmit}>
        <img
          className="mb-4"
          src="https://banner2.cleanpng.com/20180526/ux/kisspng-software-bug-undocumented-feature-computer-softwar-5b093b61afe799.6982676615273316817205.jpg"
          alt="bugtrail"
          width="72"
          height="72"
        />
        <h1 className="h3 mb-3 font-weight-normal">Please Register</h1>
        <div className="form-group">
          <label htmlFor="firstName" className="sr-only">
            First Name
          </label>
          <input
            type="text"
            name="fName"
            id="firstName"
            className="form-control"
            placeholder="First Name"
            value={fName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName" className="sr-only">
            Last Name
          </label>
          <input
            type="text"
            name="lName"
            id="lastName"
            className="form-control"
            placeholder="Last Name"
            value={lName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <select
            className="form-control"
            name="role"
            id="role"
            value={role}
            onChange={handleChange}
          >
            <option>--Select--</option>
            <option>Developer</option>
            <option>Triage</option>
            <option>Tester</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="registerEmail" className="sr-only">
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="registerEmail"
            className="form-control"
            placeholder="Email address"
            onChange={handleChange}
            value={email}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="registerPassword" className="sr-only">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="registerPassword"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="inputConfirmPassword" className="sr-only">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="inputConfirmPassword"
            className="form-control"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="checkbox mb-3">
          <label>
            <input type="checkbox" value="remember-me" /> Remember me
          </label>
        </div>
        <button className="btn btn-lg btn-dark btn-block" type="submit">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
