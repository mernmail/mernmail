const handler = require("./handler.js");
// Environment variables are already loaded in the "handler.js" file

const port = process.env.PORT || 3000;

handler.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
