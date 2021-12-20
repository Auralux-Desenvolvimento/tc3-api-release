require('dotenv').config();
import app from "./app";
import connection from "./database";
import getFirstKeyModerator from "./utils/functions/getFirstKeyModerator";

connection().then(() => {
  getFirstKeyModerator().then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server is running!")
    });
  });
})