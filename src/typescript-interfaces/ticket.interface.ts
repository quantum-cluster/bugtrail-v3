import { firestore } from "firebase";

export interface Ticket {
  id: string;
  project: {
    projectId: string;
    projectName: string;
  };
  title: string;
  description: string;
  imageUrl: string;
  priority: string;
  status: string;
  owner: {
    displayName: string;
    email: string;
    id: string;
  };
  assignee: {
    displayName: string;
    email: string;
    id: string;
  };
  createdAt: string;
  logs: Array<{
    personName: string;
    personRole: string;
    timestamp: firestore.Timestamp;
    statusChangedTo: string;
  }>;
  comments: Array<{
    personName: string;
    personRole: string;
    timestamp: firestore.Timestamp;
    comment: string;
  }>;
}
