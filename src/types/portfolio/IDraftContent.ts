/*A summarized version of the interfaces "RawDraftContentBlock" and "RawDraftContentState" taken from @types/draft-js*/

export interface IBlock {
  text: string;
}

export default interface IDraftContent {
  blocks: Array<IBlock>;
}