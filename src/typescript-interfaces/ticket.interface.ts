export interface Ticket {
  id: string;
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
}
