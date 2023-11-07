const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(express.json());
morgan.token("body", (req, res) => {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);
app.use(cors());

let persons = [
  {
    id: 1,
    name: "Artro Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary poppendick",
    number: "39-23-6423122",
  },
];
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/persons", (request, response) => {
  return response.json(persons);
});
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    return response.json(person);
  } else {
    return response.status(404).end();
  }
});
app.get("/info", function (request, response) {
  const res = `<p>Phonebook has info for ${persons.length} people<p/> 
  <p>${new Date()}<p/>`;
  return response.send(res);
});
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  return response.status(204).end();
});
app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (!body || !body.name || !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  } else if (persons.some((person) => person.name === body.name)) {
    return response.status(400).json({
      error: "the name already exist",
    });
  } else {
    const person = {
      id: Math.ceil(Math.random() * 50000),
      name: body.name,
      number: body.number,
    };
    persons = persons.concat(person);
    return response.json(person);
  }
});
