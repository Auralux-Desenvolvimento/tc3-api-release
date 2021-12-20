import AppError from "../../errors";
import IDraftContent from "../../types/portfolio/IDraftContent";

export default function parseDraft (draft: IDraftContent, errorMessage: string) {
  try {
    let content = draft.blocks.map(e => e.text);
    return content;
  } catch {
    throw new AppError([ 400, errorMessage ], -999);
  }
}