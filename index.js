var synaptic = require('synaptic');

var Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;

var myPerceptron = new Architect.Perceptron(2,3,1);
var myTrainer = new Trainer(myPerceptron);

var trainingSet = [
    {
        input: [0.5,0],
        output: [0.25]
    },
    {
        input: [0.5,0.25],
        output: [0.36]
    },
    {
        input: [0,0.6],
        output: [0.3]
    },
    {
        input: [1,1],
        output: [1]
    },
    {
        input: [0.1,0.1],
        output: [0.1]
    },
    {
        input: [0.3,0.6],
        output: [0.45]
    }
];
myTrainer.train(trainingSet);

var res = myPerceptron.activate([0.2,0.2]);
console.log(res);
