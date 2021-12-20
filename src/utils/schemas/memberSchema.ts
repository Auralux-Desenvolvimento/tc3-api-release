import * as yup from 'yup'
import urlRegex from '../regex/urlRegex'

export default yup.object().shape({
  name: yup.string()
    .min(2, "A member name must be longer than 2 characters")
    .max(254, "A member name mustn't be longer than 50 character")
    .required("A member name is required"),
  photoURL: yup.string()
    .matches(urlRegex,'Invalid URL')
    .nullable(),
  role: yup.string()
    .max(50, "A member role mustn't be longer than 50 character")
    .required("A member role is required"),
  birthday: yup.date()
    .required("A member birthday is required")
    .test("age", "A member cannot be younger than 15 years", (birthday) => {
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 15);
      return !!birthday && birthday.getTime() <= minAge.getTime();
    }),
  description: yup.string()
    .max(254, "A member description mustn't be longer than 254 characters")
    .nullable(),
})