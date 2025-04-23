export class Genre {
  id: string = "";
  name: string = "";
  parentId?: string;
  parent?: Genre;
  children?: Genre[];
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}
