import { ValidationError } from "class-validator";

export default function parseClassValidatorErrors (errors: ValidationError[]) {
  const messages: {
    property: string,
    value: any,
    constraints: {
      [type: string]: any
    }|undefined
  }[] = [];
  errors.forEach(e => {
    const message: {
      property: string,
      value: any,
      constraints: {
        [type: string]: any
      }|undefined
    } = {
      property: e.property,
      value: e.value,
      constraints: e.constraints
    };
    messages.push(message);
  });
  return messages;
}