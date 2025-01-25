export interface Comment {
  _id: string;
  content: string;
  author: { _id: string; name: string; role: string }; // Update the author field to include id, name, and role
  createdAt: string;
}