const mongoose = require('mongoose');
const Schema = mongoose.Schema;



//    VALIDATE OBJECT UNIQUE SETTINGS    \\

function validateObjectUniqueSettings(value) {
  if (!value) return true;

  // invalid if more than one object type settings
  const keys = Object.keys(value);
  if (keys.length != 1) return false;

  const settingType = keys[0];
  const settingsData = value[settingType];

  // check schema exists in SceneObjectUniqueSettingsSchema
  const schema = SceneObjectUniqueSettingsSchema.obj[settingType];
  if (!schema) return false;


  // create temp model and validate
  const Model = mongoose.model('TempValidationModel', schema);
  const validationDoc = new Model(settingsData);

  const validationError = validationDoc.validateSync();
  return validationError === undefined;
}



//    OBJECT UNIQUE SETTINGS    \\

const MegaBaySchema = new Schema({
  doorPosition: { type: Number, required: true },
  doorSpeed: { type: Number, required: true },
  lights: { type: Number, required: true }
}, { _id: false });


const HighbaySchema = new Schema({
  lights: { type: Number, required: true }
}, { _id: false });



//    MAP OBJECT UNIQUE SETTINGS    \\

const SceneObjectUniqueSettingsSchema = new Schema({
  MegaBay: MegaBaySchema,
  Highbay: HighbaySchema
});



//    SCENE OBJECT SCHEMA    \\

const SceneObjectSchema = new Schema({
  sceneObjectId: { type: String, required: true },
  sceneObjectSettings: { type: String, required: true },
  objectUniqueSettings: {
    type: Schema.Types.Mixed,
    validate: {
      validator: validateObjectUniqueSettings,
      message: props => `${JSON.stringify(props.value)} is not a valid unique setting`
    },
    required: false
  }
}, {timestamps:true})

const SceneObject = mongoose.model('SceneObject', SceneObjectSchema);
module.exports = SceneObject;