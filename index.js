const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");
const app = express();
const PORT = process.env.PORT || 3001;

morgan.token("body", (req, res) => {
  return JSON.stringify(req.body);
});
const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  next(error);
};
const unknownEndpoint = (request, response) => {
  return response.status(404).send({ error: "unknown endpoint" });
};

app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);
app.use(cors());
app.use(express.static("dist"));

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    return response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        return response.json(person);
      } else {
        return response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.get("/info", function (request, response) {
  Person.find({}).then((persons) => {
    const res = `<p>Phonebook has info for ${persons.length} people<p/> 
    <p>${new Date()}<p/>`;
    return response.send(res);
  });
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      return response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (!body || !body.name || !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  } else {
    const person = new Person({
      name: body.name,
      number: body.number,
    });
    person.save().then((savedPerson) => {
      return response.json(savedPerson);
    });
  }
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  if (!body || !body.name || !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  } else {
    const person = {
      name: body.name,
      number: body.number,
    };
    Person.findByIdAndUpdate(request.params.id, person, {
      new: true,
      runValidators: true,
      context: "query",
    })
      .then((updatedPerson) => {
        return response.json(updatedPerson);
      })
      .catch((error) => next(error));
  }
});

app.use(unknownEndpoint);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
