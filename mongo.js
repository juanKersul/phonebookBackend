const moongoose = require("mongoose");
if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}
const password = process.argv[2];
const url = `mongodb+srv://juanka:${password}@cluster0.jomjz18.mongodb.net/?retryWrites=true&w=majority`;

moongoose.set("strictQuery", false);
moongoose.connect(url);

const personSchema = new moongoose.Schema({
  name: String,
  number: String,
});

const Person = moongoose.model("Person", personSchema);

const commands = process.argv.length;

switch (commands) {
  case 3:
    Person.find({}).then((result) => {
      result.forEach((person) => {
        console.log(person);
      });
      moongoose.connection.close();
    });
    break;
  case 5:
    const person = new Person({
      name: process.argv[3],
      number: process.argv[4],
    });
    person.save().then((result) => {
      console.log(`added ${result.name} number ${result.number} to phonebook`);
      moongoose.connection.close();
    });
    break;
  default:
    console.log("bad command");
    break;
}
