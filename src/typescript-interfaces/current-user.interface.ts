export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  myTickets: Array<string>;
  projects: Array<string>;
}
