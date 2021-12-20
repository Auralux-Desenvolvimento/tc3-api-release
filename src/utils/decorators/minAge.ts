import { ValidationOptions, registerDecorator } from "class-validator";

export function MinAge (minAge: number, options?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "minAge",
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate (value: Date, args) {
          const minimumAge = new Date();
          minimumAge.setFullYear(minimumAge.getFullYear() - minAge);

          return (value.getTime() <= minimumAge.getTime());
        }
      }
    });
  }
}