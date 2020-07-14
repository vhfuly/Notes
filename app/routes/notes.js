const express = require('express');
const router = express.Router();
const Note = require('../models/note.js');
const withAuth = require('../middlewares/auth');

router.post('/', withAuth, async(req, res) =>  {
  const { title, body } = req.body;
  const note = new Note({title: title, body: body, author: req.user._id});
  try {
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(401).json({error: 'Problem to create a new note'});
  }

});

router.delete('/:id', withAuth, async(req,res)=>{
  const {id} =req.params;
  try {
    let note =await Note.findById(id);
    if(note && isOwner(req.user,note)){
      await note.delete();
      res.json({message: 'OK'}).status(204);
    }else{
      res.status(403).json({error: 'Permission denied'});
    }
  } catch (error) {
    res.status(500).json({error:'Problem to delet a note'});
  }
})

router.put('/:id', withAuth, async (req,res)=>{
  const {id} =req.params;
  const { title, body } = req.body;
  try {
    let note =await Note.findById(id);
    if(isOwner(req.user, note)){
      let note = await Note.findOneAndUpdate(
        {_id: id}, 
        { $set: { title: title, body: body}}, 
        { upsert: true, 'new': true }
      );
      res.json(note);
    }else{
      res.status(403).json({error: 'Permission denied'});
    }
   
  } catch (error) {
    res.status(500).json({error:'Problem to update a note'});
  }
})

router.get('/search',withAuth, async (req,res)=>{
  const {query}= req.query;
  try {
    let notes = await Note
   .find({author: req.user._id })
   .find({$text: {$search: query}})
    res.json(notes)
  } catch (error) {
    res.status(500).json({error:error});
  }
})

router.get ('/',withAuth, async (req,res)=>{
  try {
  let notes = await Note.find({author: req.user._id})
  res.json(notes);
  } catch (error) {
    res.status(500).json({error:error});
  }
})

router.get ('/:id',withAuth, async (req,res)=>{
  try {
    const {id} =req.params;
    let note =await Note.findById(id);
    if(isOwner(req.user ,note)){
      res.json(note);
    }else{
      res.status(403).json({error: 'Permission denied'});
    }
  } catch (error) {
    res.status(401).json({error: 'Problem to get a note'});
  }
})


const isOwner = (user, note)=>{
  if(JSON.stringify(user._id) == JSON.stringify(note.author._id))
  return true;
else
  return false;
}


module.exports = router;