import * as yup from 'yup'
import urlRegex from '../regex/urlRegex'

export default yup.object().shape({
  name: yup.string()
    .min(2, "An advisor name must be longer than 2 characters")
    .max(254, "An advisor name mustn't be longer than 254 character")
    .required("An advisor name is required"),
  photoURL: yup.string()
    .matches(urlRegex,'Invalid URL')
    .nullable(),
  email: yup.string()
    .email("An advisor email must be an email")
    .required("An advisor email is required"),
})