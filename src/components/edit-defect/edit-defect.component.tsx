import React, { useContext, useEffect, useState } from "react";
import CurrentUserContext from "../../providers/current-user/current-user.provider";
import { CurrentUser } from "../../typescript-interfaces/current-user.interface";
import { firestore as db, storage } from "../../firebase/firebase.utils";
import firebase, { firestore } from "firebase/app";
import { useParams, useHistory } from "react-router-dom";

interface Log {
  personName: string;
  personRole: string;
  timestamp: firestore.Timestamp;
  statusChangedTo: string;
}

const EditDefect = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [defectImage, setDefectImage] = useState<File>();
  const [priority, setPriority] = useState("");

  const { defectId } = useParams<{ defectId: string }>();
  const history = useHistory();

  let currentUser: CurrentUser = useContext(CurrentUserContext);

  useEffect(() => {
    db.collection("tickets")
      .doc(defectId)
      .get()
      .then((doc: firestore.DocumentData) => {
        const { title, description, priority } = doc.data();
        setTitle(title);
        setDescription(description);
        setPriority(priority);
      })
      .catch((error) => {
        console.error("Coudn't pre-populate the fields: ", error);
      });
  }, [defectId]);

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
    const updatedAt = new Date();
    let imageUrl = "";
    let logsArr: Array<Log> = [];

    if (defectImage) {
      var storageRef = storage.ref();

      var metadata = {
        contentType: "image/jpeg",
      };

      var uploadTask = storageRef
        .child("images/" + defectId)
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
              db.collection("tickets")
                .doc(defectId)
                .get()
                .then((doc: firestore.DocumentData) => {
                  if (doc.exists) {
                    logsArr = doc.data().logs;
                  }
                })
                .catch((error) => {
                  console.error("Couldnt' populate logs array: ", error);
                });
            })
            .then(() => {
              db.collection("tickets")
                .doc(defectId)
                .set(
                  {
                    lastEditedBy: {
                      id: currentUser.id,
                      displayName: currentUser.displayName,
                      email: currentUser.email,
                    },
                    title,
                    description,
                    imageUrl,
                    priority,
                    updatedAt,
                    status: "updated",
                    logs: [
                      ...logsArr,
                      {
                        personName: currentUser.displayName,
                        personRole: currentUser.role,
                        timestamp: updatedAt,
                        statusChangedTo: "updated",
                      },
                    ],
                  },
                  { merge: true }
                )
                .then(() => {
                  console.log("Ticket updated successfully!");
                })
                .then(() => {
                  setTitle("");
                  setDescription("");
                  setPriority("");
                  setDefectImage(undefined);
                })
                .catch(function (error) {
                  console.error("Error creating ticket: ", error);
                });
            })
            .catch((error) => {
              console.error("Something went wrong: ", error);
            })
            .finally(() => {
              history.push(`/bugtrail-v3/ticket-details/${defectId}`);
            });
        }
      );
    } else {
      db.collection("tickets")
        .doc(defectId)
        .get()
        .then((doc: firestore.DocumentData) => {
          if (doc.exists) {
            logsArr = doc.data().logs;
          }
        })
        .then(() => {
          db.collection("tickets")
            .doc(defectId)
            .set(
              {
                lastEditedBy: {
                  id: currentUser.id,
                  displayName: currentUser.displayName,
                  email: currentUser.email,
                },
                title,
                description,
                priority,
                updatedAt,
                status: "updated",
                logs: [
                  ...logsArr,
                  {
                    personName: currentUser.displayName,
                    personRole: currentUser.role,
                    timestamp: updatedAt,
                    statusChangedTo: "updated",
                  },
                ],
              },
              { merge: true }
            )
            .then(() => {
              console.log("Ticket updated successfully!");
            })
            .then(() => {
              setTitle("");
              setDescription("");
              setPriority("");
              setDefectImage(undefined);
            })
            .catch(function (error) {
              console.error("Error creating ticket: ", error);
            });
        })
        .catch((error) => {
          console.error("Couldnt' populate logs array: ", error);
        })
        .finally(() => {
          history.push(`/bugtrail-v3/ticket-details/${defectId}`);
        });
    }
  };

  return (
    <div
      className={"pt-3 pl-2 pr-2 mt-5 mr-3 ml-3"}
      style={{ minHeight: "86vh" }}
    >
      <h1 className={"text-center"}>Updating existing defect</h1>
      <form className={"mb-5"} onSubmit={handleSubmit}>
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

export default EditDefect;
