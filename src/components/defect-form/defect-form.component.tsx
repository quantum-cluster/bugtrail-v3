import React, { useContext, useState } from "react";
import CurrentUserContext from "../../providers/current-user/current-user.provider";
import { CurrentUser } from "../../typescript-interfaces/current-user.interface";
import { v4 } from "uuid";
import { firestore, storage } from "../../firebase/firebase.utils";
import firebase from "firebase/app";

const DefectForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [defectImage, setDefectImage] = useState<File>();
  const [priority, setPriority] = useState("");

  const currentUser: CurrentUser = useContext(CurrentUserContext);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    switch (name) {
      case "title":
        setTitle(value);
        break;

      case "description":
        setDescription(value);
        break;

      case "priority":
        setPriority(value);
        break;

      default:
        break;
    }
  };

  const handleDefectImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0].size <= 3145728) {
      setDefectImage(event.target.files ? event.target.files[0] : undefined);
      console.log(defectImage);
    } else {
      alert("The maximum image size allowed is 3MB");
      setDefectImage(undefined);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const uid = v4();
    const createdAt = new Date();
    let imageUrl = "";

    if (defectImage) {
      var storageRef = storage.ref();

      var metadata = {
        contentType: "image/jpeg",
      };

      var uploadTask = storageRef
        .child("images/" + defectImage.name)
        .put(defectImage, metadata);

      uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        function (snapshot: firebase.storage.UploadTaskSnapshot) {
          var progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED:
              console.log("Upload is paused");
              break;
            case firebase.storage.TaskState.RUNNING:
              console.log("Upload is running");
              break;
          }
        },
        (error: Error) => {
          console.error("Couldn't upload image: ", error);
        },
        () => {
          uploadTask.snapshot.ref
            .getDownloadURL()
            .then(function (downloadURL: string) {
              console.log("File available at", downloadURL);
              imageUrl = downloadURL;
            })
            .then(() => {
              firestore
                .collection("tickets")
                .doc(uid)
                .set({
                  owner: {
                    id: currentUser.id,
                    displayName: currentUser.displayName,
                    email: currentUser.email,
                  },
                  title,
                  description,
                  imageUrl,
                  priority,
                  createdAt,
                  status: "unassigned",
                  assignee: {
                    id: "",
                    displayName: "",
                    email: "",
                  },
                })
                .then(() => {
                  console.log("Ticket submitted successfully!");
                })
                .then(() => {
                  setTitle("");
                  setDescription("");
                  setPriority("");
                })
                .catch(function (error) {
                  console.error("Error creating ticket: ", error);
                });
            });
        }
      );
    }

    firestore
      .collection("users")
      .doc(currentUser.id)
      .set(
        {
          myTickets: [...currentUser.myTickets, uid],
        },
        { merge: true }
      );
  };

  return (
    <div className={"p-5"}>
      <h1 className={"text-center"}>Raising a new defect</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="defectTitle">Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            id="defectTitle"
            placeholder="Issue title here..."
            value={title}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="defectDescription">Description</label>
          <textarea
            className="form-control"
            name="description"
            id="defectDescription"
            placeholder="Write a detailed description of the issue here..."
            rows={3}
            value={description}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="defectImage">Defect Image</label>
          <input
            type="file"
            name="defectImage"
            className="form-control-file"
            onChange={handleDefectImageChange}
            id="defectImage"
          />
        </div>
        <div className="form-group">
          <label htmlFor="defectPriority">Priority Level</label>
          <select
            className="form-control"
            name="priority"
            id="defectPriority"
            value={priority}
            onChange={handleChange}
          >
            <option>--Select--</option>
            <option>Severe</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
            <option>Feature request</option>
          </select>
        </div>
        <button type={"submit"} className={"btn btn-dark"}>
          Submit Defect
        </button>
      </form>
    </div>
  );
};

export default DefectForm;
