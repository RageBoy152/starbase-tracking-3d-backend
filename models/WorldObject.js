const mongoose = require('mongoose');
const Schema = mongoose.Schema;





//    MAP OBJECT UNIQUE SETTINGS    \\

const MegaBayDef = {
  lights: { type: Number, required: true },
  doorPosition: { type: Number, required: true },
  doorSpeed: { type: Number, required: true }
}


const objectUniqueDefinitions = {
  RingStand2: {
    wheelCovers: { type: String, required: true }
  },
  HighBay: {
    lights: { type: Number, required: true }
  },
  MegaBay1: MegaBayDef,
  MegaBay2: MegaBayDef,
  SanchezWall_Main: {
    lights: { type: Number, required: true }
  }
}





//    VALIDATE OBJECT UNIQUE SETTINGS    \\

function validateObjectUniqueSettings(value) {
  if (!value) return true;

  // invalid if more than one object type settings
  const keys = Object.keys(value);
  if (keys.length != 1) return false;

  const settingType = keys[0];
  const settingsData = value[settingType];


  // console.log(objectUniqueDefinitions[settingType]);
  // console.log(settingType);


  // check schema exists in objectUniqueDefinitions
  const schema = objectUniqueDefinitions[settingType];
  if (!schema) return false;


  // create temp model and validate
  let Model;
  if (mongoose.models.TempValidationModel) {
    Model = mongoose.models.TempValidationModel;
  } else {
    Model = mongoose.model('TempValidationModel', schema);
  }

  const validationDoc = new Model(settingsData);
  const validationError = validationDoc.validateSync();
  return validationError === undefined;
}



//    OBJECT UNIQUE SETTING SCHEMAS    \\

const RingStand2Schema = new Schema(objectUniqueDefinitions.RingStand2, { _id: false });
const HighBaySchema = new Schema(objectUniqueDefinitions.HighBay, { _id: false });
const MegaBay1Schema = new Schema(objectUniqueDefinitions.MegaBay1, { _id: false });
const MegaBay2Schema = new Schema(objectUniqueDefinitions.MegaBay2, { _id: false });
const SanchezWall_MainSchema = new Schema(objectUniqueDefinitions.SanchezWall_Main, { _id: false });



//    OBJECT UNIQUE SETTINGS SCHEMA    \\

const ObjectUniqueSettingsSchema = new Schema({
  RingStand2: RingStand2Schema,
  HighBay: HighBaySchema,
  MegaBay1: MegaBay1Schema,
  MegaBay2: MegaBay2Schema,
  SanchezWall_Main: SanchezWall_MainSchema
})



//    WORLD OBJECT SCHEMA    \\

const WorldObjectSchema = new Schema({
  staticObject: { type: Boolean, required: true },
  worldObjectId: { type: String, required: true },
  prefabName: { type: String, required: true },
  prefabPath: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true }
  },
  rotation: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true },
    w: { type: Number, required: true }
  },
  scale: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true }
  },
  objectUniqueSettings: {
    type: Schema.Types.Mixed,
    validate: {
      validator: validateObjectUniqueSettings,
      message: props => `${JSON.stringify(props.value)} is not a valid unique setting`
    },
    required: false
  }
}, {timestamps:true})

const WorldObject = mongoose.model('WorldObject', WorldObjectSchema);
module.exports = WorldObject;