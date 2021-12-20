import * as yup from 'yup'

export default yup.string()
  .min(8, "A password must have at least 8 characters")
  .max(30, "A password must have up to 30 characters")
;