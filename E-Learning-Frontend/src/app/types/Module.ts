export interface Module {
    _id: string;
    course_id:string;
    title: string; // Title of the accordion item
    content: string;
    filePath :string[] 
    resources :string[]
    outdated:boolean
    uploadedBy:string
    createdAt:Date
  };