const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_TOKEN;
const withAuth = require('../middlewares/auth');


/* GET users listing. */
router.post('/register', async (req, res)=>{
  const {name, email, password} = req.body;
  const user = new User({name,email, password});

  try {
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({error :'Error registering new user please try again'});
  }

})

router.put('/password', withAuth, async (req,res)=>{
  const {password} =req.body;

  try {
    let user = await User.findOne({_id: req.user._id});
     user.password = password;
     user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({error:'Problem to update a password'});
  }

 
})

router.put('/', withAuth, async (req,res)=>{
  const {name, email } =req.body;

  try {
    let user = await User.findOneAndUpdate(
      {_id: req.user._id}, 
      { $set: { name: name, email: email}}, 
      { upsert: true, 'new': true }
    )
    res.json(user);
  } catch (error) {
    res.status(500).json({error:'Problem to update a name and email'});
  }

 
})
router.delete('/', withAuth, async(req,res)=>{
  
  try {
    let user = await User.findOne({_id: req.user._id});
    await user.delete();
    res.json({message: 'OK'}).status(204);
  } catch (error) {
    res.status(500).json({error:'Problem to delet a user'});
  }
})

router.post('/login', async(req,res)=>{
  const {email, password} =req.body;
  try {
    let user = await User.findOne({ email })
    if (!user) {
      res.status(401).json({error: 'Incorrect email'});
    } else {
      user.isCorrectPassword(password, function(err, same) {
        if (!same) {
          res.status(401).json({error: 'Incorrect password'});
        } else {
          const token = jwt.sign({email}, secret, {expiresIn:'10d'});
          res.json({user: user, token: token });
          
        }
      });
    }
  } catch (error) {
    res.status(500).json({error :'Internal error, please try again'});
  }
})
module.exports = router;
