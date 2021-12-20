import IPost from "./IPost";

export default interface IPostWithId extends IPost {
  id: string;
}