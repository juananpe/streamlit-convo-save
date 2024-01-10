var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

// Define a schema for the conversation
const ConversationSchema = new mongoose.Schema({
    model: String,
    name: String,
    userQueries: [String],
    assistantAnswers: [String]
});

// Create a model from the schema
const Conversation = mongoose.model('Conversation', ConversationSchema);


/* GET home page. */
router.get('/', async (req, res) => {
    try {
        const conversations = await Conversation.find({}).select(['_id','name']);
        res.render('index', { conversations });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.get('/remove/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send('Invalid ID format');
        }

        const result = await Conversation.findByIdAndDelete(id);
        console.log('Deletion result:', result);
        res.redirect('/');
    } catch (error) {
        console.error('Error during deletion:', error);
        res.status(500).send('Error removing conversation');
    }
});





router.post('/saveConv', async (req, res) => {
    try {
        const newConversation = new Conversation({
            model: req.body.model,
            name: req.body.name,
            userQueries: req.body.userQueries,
            assistantAnswers: req.body.assistantAnswers
        });

        await newConversation.save();
        res.status(201).send('Conversation saved');
    } catch (error) {
        res.status(500).send('Server error');
    }
});

const ObjectId = require('mongoose').Types.ObjectId;

router.get('/show/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send('Invalid ID format');
        }

        const message = await Conversation.findById(id);
        if (!message) {
            return res.status(404).send('Message not found');
        }

        console.log(message)

        res.render('show', { messages: message });
    } catch (error) {
        res.status(500).send('Server error');
    }
});


router.get('/test', async (req, res) => {
  // Define the data to be sent
  const postData = {
    userQueries: ["User question 1", "User question 2"],
    assistantAnswers: ["Assistant answer 1", "Assistant answer 2"]
  };

  try {
    const response = await fetch('http://localhost:3000/saveConv', {
      method: 'POST',
      body: JSON.stringify(postData),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.text();
    // Send back the response from /saveConv endpoint to the client
    res.status(200).send(data);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: 'Error making POST request', error: error.message });
  }
});




module.exports = router;
