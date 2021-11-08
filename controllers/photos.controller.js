const Photo = require('../models/photo.model');
const Voter = require('../models/voter.model');
const requestIp = require('request-ip');

/****** SUBMIT PHOTO ********/
const acceptedExtensions = ['gif','jpg','jpeg','png'];

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;
    const ext = file.path.split('.').slice(-1)[0];

    const emailPattern =  /^[a-z\d]+[\w\d.-]*@(?:[a-z\d]+[a-z\d-]+\.){1,5}[a-z]{2,6}$/i;

    const titlePattern = /(([A-z0-9$%!"?,ąćęłńóśźżĄĘŁŃÓŚŹŻ]|\s|\.)*)/g;
    const isTitleCorrect = title.match(titlePattern).join('').length == title.length;

    const authorPattern = /(([A-ząćęłńóśźżĄĘŁŃÓŚŹŻ]|\s|\.)*)/g;
    const isAuthorCorrect = author.match(authorPattern).join('').length == author.length;

    if(title && author && email && file && acceptedExtensions.includes(ext) && email.match(emailPattern) && isTitleCorrect && isAuthorCorrect) { 

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  const clientIp = requestIp.getClientIp(req);
    
  try {

   if(!await Voter.findOne({ user: clientIp})) {
     const newVoter = new Voter( {user: clientIp} );
     await newVoter.save(); 
   }

    const voter = await Voter.findOne({ user: clientIp}); 

    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
 
      if(!photoToUpdate || !voter || voter.votes.includes(req.params.id)) res.status(404).json({ message: 'Not found or you cant votes anymore' });
      else {
        photoToUpdate.votes++;
        await photoToUpdate.save();

        voter.votes.push(req.params.id);
        await voter.save();

        res.send({ message: 'OK' });
      } 
   } catch(err) {
    res.status(500).json(err);
  }

};

