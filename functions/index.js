const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const cors = require('cors');
app.use(cors());

const { db } = require('./util/admin');
const {getAllNotes, postOneNote, getNote, deleteNote, shieldNote, unshieldNote, commentOnNote} = require('./handlers/notes');
const {signup,login,uploadImage, addUserDetails, getAuthenticatedUser,getUserDetails, markNotificationsRead} = require('./handlers/users');


  //Notes Routes
app.get('/notes',  getAllNotes); 
app.post('/note', FBAuth, postOneNote);
app.get('/note/:noteId', getNote);
app.delete('/note/:noteId', FBAuth, deleteNote)
app.get('/note/:noteId/shield', FBAuth, shieldNote);
app.get('/note/:noteId/unshield', FBAuth, unshieldNote);
app.post('/note/:noteId/comment', FBAuth, commentOnNote);

 //User routes 
 app.post('/signup', signup);
 app.post('/login', login);
 app.post('/user/image',FBAuth, uploadImage);
 app.post('/user', FBAuth, addUserDetails);
 app.get('/user', FBAuth, getAuthenticatedUser);
 app.get('/user/:handle', getUserDetails);
 app.post('/notifications', FBAuth, markNotificationsRead);

 exports.api= functions.region('asia-east2').https.onRequest(app);

//create a notification on shielding a note
 exports.createNotificationOnShield = functions.region('asia-east2').firestore.document('shields/{id}')
 .onCreate((snapshot) => {
  return db.doc(`/notes/${snapshot.data().noteId}`).get()
   .then((doc) => {
     if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
      return db.doc(`/notifications/${snapshot.id}`).set({
        createdAt: new Date().toISOString(),
        recipient: doc.data().userHandle,
        sender: snapshot.data().userHandle,
        type: 'shield',
        read: false,
        noteId: doc.id
      });
     }
   })
   .catch((err) => console.error(err));
  
 });
//deleting a notification on unshielding a post
exports.deleteNotificationOnUnshield =  functions.region('asia-east2').firestore.document('shields/{id}')
.onDelete((snapshot) => {
  return db.doc(`/notifications/${snapshot.id}`)
  .delete
  .catch((err) => {
    console.error(err);
    return;
  });
});
//create a notification on commenting on a post
 exports.createNotificationOnComment =  functions.region('asia-east2').firestore.document('comments/{id}')
 .onCreate((snapshot) => {
   return db.doc(`/notes/${snapshot.data().noteId}`).get()
   .then((doc) => {
     if(doc.exists  && doc.data().userHandle !== snapshot.data().userHandle){
      return db.doc(`/notifications/${snapshot.id}`).set({
        createdAt: new Date().toISOString(),
        recipient: doc.data().userHandle,
        sender: snapshot.data().userHandle,
        type: 'comment',
        read: false,
        noteId: doc.id
      });
     }
    })
  .catch((err) => {
    console.error(err);
    return ;
  });
});

//if a user changes the profile image, it changes in all the collections
exports.onUserImageChange = functions.region('asia-east2').firestore.document('/users/{userId}')
.onUpdate((change) => {
  console.log(change.before.data());
  console.log(change.after.data());
  if(change.before.data().imageUrl !== change.after.data().imageUrl){
    console.log('Image has changed');
    let batch = db.batch();
  return db.collection('notes').where('userHandle', '==', change.before.data().handle).get()
  .then((data) => {
    data.forEach((doc) =>{
      const note =db.doc(`/notes/${doc.id}`);
      batch.update(note, { userImage: change.after.data().imageUrl });
    })
    return batch.commit();
  })
  }else return true;
});

//delete all values about a note from all collections once a note is deleted  
exports.onNoteDelete = functions.region('asia-east2').firestore.document('/notes/{noteId}')
.onDelete((snapshot, context) => {
  const noteId = context.params.noteId;
  const batch = db.batch();
  return db
      .collection('comments')
      .where('noteId', '==', noteId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection('shields')
          .where('noteId', '==', noteId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/shields/${doc.id}`));
        });
        return db
          .collection('notifications')
          .where('noteId', '==', noteId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });
