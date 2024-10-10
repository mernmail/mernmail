const handler = require("./handler.js");

const port = 3000;

handler.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
