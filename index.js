const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');

const app = express();
const PORT = process.env.PORT || 3001;

/* eslint no-unused-vars: ["error", { "args": "none" }] */
morgan.token('body', (req, res) => JSON.stringify(req.body));
const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message });
  }
  return next(error);
};
const unknownEndpoint = (request, response) => response.status(404).send({ error: 'unknown endpoint' });

app.use(express.json());
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
);
app.use(cors());
app.use(express.static('dist'));

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => response.json(persons));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        return response.json(person);
      }
      return response.status(404).end();
    })
    .catch((error) => next(error));
});

app.get('/info', (request, response) => {
  Person.find({}).then((persons) => {
    const res = `<p>Phonebook has info for ${persons.length} people<p/> 
    <p>${new Date()}<p/>`;
    return response.send(res);
  });
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => response.status(204).end())
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const person = new Person({
    name: request.body.name,
    number: request.body.number,
  });
  person
    .save()
    .then((savedPerson) => response.json(savedPerson))
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;
  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    {
      new: true,
      runValidators: true,
      context: 'query',
    },
  )
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error));
});

app.use(unknownEndpoint);
app.use(errorHandler);
/* eslint no-console: ["error", { allow: ["log"] }] */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
