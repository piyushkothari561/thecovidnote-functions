const { db } = require('../util/admin');

//to get all the notes
exports.getAllNotes =  (req, res) => {
    db.collection('notes').orderBy('createdAt','desc' ).get()
    .then((data) => {
      let notes = [];
      data.forEach((doc) => {
        notes.push({
          noteId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          shieldCount: doc.data().shieldCount,
          userImage: doc.data().userImage

        });
      });
      return res.json(notes);
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code })
    });
  };
//to post one note
  exports.postOneNote = (req, res) => {
    if(req.body.body.trim() === '' ){
      return res.status(400).json({ body: 'Body must not be empty'});

    }
     const newNote = { 
       body: req.body.body,
       userHandle: req.user.handle,
       userImage: req.user.imageUrl,
       createdAt: new Date().toISOString(),
       shieldCount: 0,
       commentCount: 0,
     };
 
     db
     .collection('notes')
     .add(newNote)
     .then((doc) =>{ 
       const resNote = newNote;
       resNote.noteId = doc.id;
       res.json(resNote);
     })
       .catch((err) => {
         res.status(500).json({ error: 'something went wrong'});
         console.error(err);
       });
  };
  // to get one note 

  exports.getNote = (req, res) => { 
    let noteData = { };
    db.doc(`/notes/${req.params.noteId}`).get()
    .then((doc) => {
      if(!doc.exists){
        return res.status(404).json({ error: 'Note not found'});
      }
      noteData = doc.data();
      noteData.noteId = doc.id;
      return db.collection('comments').orderBy('createdAt', 'desc')
      .where('noteId', '==', req.params.noteId).get();
    })
    .then((data) => {
      noteData.comments = [];
      data.forEach((doc) => {
        noteData.comments.push(doc.data())
      });
      return res.json(noteData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code});
    });
  };
//to comment on a note
  exports.commentOnNote = (req, res) => {
    if(req.body.body.trim() === '') return res.status(400).json({ comment : 'Must not be empty'});

    const newComment = { 
      body: req.body.body,
      createdAt: new Date().toISOString(),
      noteId: req.params.noteId,
      userHandle: req.user.handle,
      userImage: req.user.imageUrl
    };

    db.doc(`/notes/${req.params.noteId}`).get()
    .then((doc) => {
      if(!doc.exists) {
        return res.status(404).json({ error: 'Note not found'});
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1});
    })
    .then(() => {
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong'});
    });
  };
  //shield a note
  exports.shieldNote = (req, res) => {
      const shieldDocument = db.collection('shields')
      .where('userHandle', '==', req.user.handle)
      .where('noteId', '==', req.params.noteId).limit(1);

      const noteDocument = db.doc(`/notes/${req.params.noteId}`);

      let noteData = {};

      noteDocument.get()
      .then((doc) => {
        if(doc.exists){
          noteData = doc.data();
          noteData.noteId = doc.id;
          return shieldDocument.get();
        } else {
          return res.status(404).json({error: 'Note not found'});
        }
      })
      .then((data) => {
        if(data.empty){
          return db.collection('shields').add({
            noteId: req.params.noteId,
            userHandle: req.user.handle
          })
          .then(() => {
            noteData.shieldCount++
            return noteDocument.update({ shieldCount: noteData.shieldCount });
          })
          .then(() => {
            return res.json(noteData);
          })
        } else {
          return res.status(400).json({ error: 'Note already shielded'});
        }
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code});
      });
  };


  exports.unshieldNote = (req, res) => {
    const shieldDocument = db.collection('shields')
    .where('userHandle', '==', req.user.handle)
    .where('noteId', '==', req.params.noteId).limit(1);

    const noteDocument = db.doc(`/notes/${req.params.noteId}`);

    let noteData = {};

    noteDocument.get()
    .then((doc) => {
      if(doc.exists){
        noteData = doc.data();
        noteData.noteId = doc.id;
        return shieldDocument.get();
      } else {
        return res.status(404).json({error: 'Note not found'});
      }
    })
    .then((data) => {
      if(data.empty){
        return res.status(400).json({ error: 'Note not shielded'});
      } else {
        return db.doc(`/shields/${data.docs[0].id}`).delete()
        .then(() => {
          noteData.shieldCount--;
          return noteDocument.update({ shieldCount: noteData.shieldCount });
        })
        .then(() => {
          res.json(noteData);
        })
      }
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code});
    });
  };

  //delete a note
  exports.deleteNote = (req, res) => {
    const document = db.doc(`/notes/${req.params.noteId}`);
    document.get()
    .then((doc) => {
      if(!doc.exists){
        return res.status(404).json({ error: 'Note not found'});
      }
      if(doc.data().userHandle !== req.user.handle){
        return res.status(403).json({ error: 'Unauthorized'});
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: 'Note deleted successfully'});
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code});
    });
  };