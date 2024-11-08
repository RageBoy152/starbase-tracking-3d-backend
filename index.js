// modules
const dotenv = require("dotenv").config();

// express setup
const app = require("express")();
const cors = require("cors");
const bodyParser = require("body-parser");

// mongoose setup
const mongoose = require("mongoose");
const WorldObject = require("./models/WorldObject");
const SceneObject = require("./models/SceneObject");



// cors - url whitelist setup

const urlWhiteList = ['https://keen-lokum-70f628.netlify.app', undefined];     // undefined is for when we go straight to the backend url

app.use(cors({
  origin: function (origin, callback) {
    if (urlWhiteList.indexOf(origin) !== -1) { callback(null, true); }
    else { callback(new Error(`Not allowed by CORS. SRC: ${origin}`)); }
  }
}));

app.use(bodyParser.json());



// connect to db

const dbURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PWD}@cluster0.gv34w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.connect(dbURI)
  .then((res) => {
    console.log("Connected ot database.");
    
    // start express listen
    app.listen(3001, () => {
      console.log("Backend listening on port 3001");
    });
  })
  .catch((err) => {
    console.log(`Error connecting to database. ${err}`);
  });



// get worldobjects data

app.get('/get-worldobjects', (req, res) => {
  WorldObject.find()
  .then(dbRes => {
    res.send(dbRes)
  })
  .catch(err => {
    console.log(`Error fetching WorldObjects from database. ${err}`);
    res.send({ error_message: `Error fetching WorldObjects from database`, error: err.toString() });
  });
});



// get sceneobjects data

app.get('/get-sceneobjects', (req, res) => {
  SceneObject.find()
  .then(dbRes => {
    res.send(dbRes)
  })
  .catch(err => {
    console.log(`Error fetching SceneObjects from database. ${err}`);
    res.send({ error_message: `Error fetching SceneObjects from database`, error: err.toString() });
  });
});



// save one sceneobjects data

app.post('/set-sceneobject-data', (req, res) => {
  const { sceneObjectDocId, sceneObjectId, sceneObjectSettingsSchemaName, objectUniqueSettings } = req.body;

  // console.log(docId, sceneObjectId, sceneObjectSettingsSchemaName, objectUniqueSettings);

  const newObjectUniqueSettings = {
    [sceneObjectSettingsSchemaName]: objectUniqueSettings.reduce((acc, setting) => {
      acc[setting.settingName] = setting.settingValue;
      return acc;
    }, {})
  };

  let newSceneObjectData = {
    sceneObjectId: sceneObjectId,
    sceneObjectSettings: sceneObjectSettingsSchemaName,
    objectUniqueSettings: newObjectUniqueSettings
  }


  console.log(sceneObjectDocId, newSceneObjectData);


  const sceneObject = new SceneObject(newSceneObjectData);


  if (sceneObjectDocId) {
    // editing

    SceneObject.findOneAndUpdate({ _id: sceneObjectDocId }, newSceneObjectData, { new: true })
    .then(dbRes => {
      res.send(dbRes)
    })
    .catch(err => {
      let errMsg = `Error updating SceneObject in database. | doc_id: ${sceneObjectDocId}, sceneObjectId: ${sceneObjectId} | ${err}`;
      console.log(errMsg);
      res.send({ error_message: errMsg, error: err.toString() });
    });
  }
  else {
    // adding

    sceneObject.save()
    .then(dbRes => {
      res.send(dbRes)
    })
    .catch(err => {
      let errMsg = `Error adding SceneObject to database. | sceneObjectId: ${sceneObjectId} | ${err}`;
      console.log(errMsg);
      res.send({ error_message: errMsg, error: err.toString() });
    });
  }
});




// save one worldobjects data

app.post('/set-worldobject-data', (req, res) => {
  const { deleteObject, editorId, docId, staticObject, worldObjectId, prefabPath, prefabName, position, rotation, scale, objectUniqueSettings } = req.body;

  if (!process.env.VALID_EDITOR_IDS.split(",").includes(editorId)) {
    res.send({ error_message: `Editor ID not authorized`, error: "Int_401" });
    return;
  }

  const newObjectUniqueSettings = {
    [prefabName]: objectUniqueSettings.reduce((acc, setting) => {
      acc[setting.settingName] = setting.settingValue;
      return acc;
    }, {})
  };


  let newWorldObjectData = {
    staticObject: staticObject,
    worldObjectId: worldObjectId,
    prefabName: prefabName,
    prefabPath: prefabPath,
    position: position,
    rotation: rotation,
    scale: scale,
    objectUniqueSettings: newObjectUniqueSettings
  }


  console.log(worldObjectId, deleteObject, docId);


  const worldObject = new WorldObject(newWorldObjectData);

  console.log(worldObject);

  if (docId && !deleteObject) {
    // editing

    WorldObject.findOneAndUpdate({ _id: docId }, newWorldObjectData, { new: true })
    .then(dbRes => {
      res.send(dbRes)
    })
    .catch(err => {
      let errMsg = `Error updating WorldObject in database. | doc_id: ${docId}, worldObjectId: ${worldObjectId} | ${err}`;
      console.log(errMsg);
      res.send({ error_message: errMsg, error: err.toString() });
    });
  }
  else if (docId && deleteObject) {
    // deleting

    WorldObject.findOneAndDelete({ _id: docId })
    .then(dbRes => {
      res.send({ deleted: true, worldObjectId: worldObjectId, dbRes: dbRes })
    })
    .catch(err => {
      let errMsg = `Error deleting WorldObject in database. | doc_id: ${docId}, worldObjectId: ${worldObjectId} | ${err}`;
      console.log(errMsg);
      res.send({ error_message: errMsg, error: err.toString() });
    });
  }
  else {
    // adding

    worldObject.save()
    .then(dbRes => {
      res.send({ spawned: true, worldObjectId: worldObjectId, docId: dbRes._id.toString(), dbRes: dbRes })
    })
    .catch(err => {
      let errMsg = `Error adding WorldObject to database. | worldObjectId: ${worldObjectId} | ${err}`;
      console.log(errMsg);
      res.send({ error_message: errMsg, error: err.toString() });
    });
  }
});




// check for editor perms

app.post('/check-editor-id', (req, res) => {
  const { editorId } = req.body;

  res.send({ authorized: process.env.VALID_EDITOR_IDS.split(",").includes(editorId).toString() });
});