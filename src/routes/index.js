var express     = require('express');
var router      = express.Router();
var fs          = require('fs');

var auth        = require('../middlewares/auth');
var uploadImg   = require('../middlewares/uploadImg');
var sign        = require('../controllers/sign');
var home        = require('../controllers/home');
var editor      = require('../controllers/editor');
var category    = require('../controllers/category');
var individual  = require('../controllers/individual');
var musicDetail = require('../controllers/musicDetail');
var musicInfo   = require('../controllers/musicInfo');

var debug       = require('../controllers/debug');


var data = require('../data/data');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   // headPath: path to the headcut
//   path = 'uploads/head/';
//   headPath = "";
//   if (req.session.user) {
//     uid = req.session.user._id;
//     fileName = uid + "_head";
//     try {
//       headPath = path + fileName;
//       console.log("ok?: " + headPath);
//       fs.accessSync('./bin/public/' + headPath, fs.R_OK);
//       console.log("ok: " + headPath);
//     } catch (e) {
//       headPath = path + 'ghost';
//     }
//   } else {
//     headPath = path + 'ghost';
//   }
//   res.render('home');
// });
router.get('/', home.showHome);

//调试
router.get('/effect', function(req, res, next) {
  res.render('effect');
});
router.get('/music_detail', function(req, res, next) {
  res.render('music_detail');
});
router.get('/share', function(req, res, next) {
  res.render('share');
});

// sign
router.get('/login', sign.showLogin);
router.post('/login', sign.login);
router.get('/signup', sign.showSignup);
router.post('/signup', sign.signup);
router.get('/wait', auth.isTempAuthenticated, sign.getWait);
router.get('/sendagain', auth.isTempAuthenticated, sign.getSendAgain);
router.get('/conf', sign.getConf);
router.get('/logout', sign.logout);

// home
router.get('/home', home.showHome);

// editor
router.get('/editor', editor.showEditor);
router.post('/editor/save', editor.saveSpectrum);
router.post('/editor/login', editor.login);
router.post('/editor/signup', editor.signup);
router.get('/editor/logout', editor.logout);

// category
router.get('/category', category.showCategory);

// individual
router.get('/user', individual.showIndividual);

// musicDetail
router.get('/music', musicDetail.showMusicDetail);
router.get('/music/saveMusicToRepo', auth.isAuthenticated, musicDetail.saveMusicToRepo);
router.get('/music/share', musicDetail.share);
router.get('/music/listen', musicDetail.listen);
router.get('/music/isCollect', auth.isAuthenticated, musicDetail.is_collect);
router.post('/music/insertComment', auth.isAuthenticated, musicDetail.insertComment);

// music_info
router.get('/music_info', auth.isAuthenticated, musicInfo.showMusicInfo);
router.post('/update_music_info', auth.isAuthenticated, musicInfo.updateMusicInfo);

// debug
router.get('/create_tags', debug.createTags);
router.get('/look_tags', debug.lookTags);
router.get('/clear_data', debug.clearData);
router.get('/look_musics', debug.lookMusics);
router.get('/look_users', debug.lookUsers);
router.get('/look_commments', debug.lookComments);
router.get('/look_spectrums', debug.lookSpectrums);

var testUploader = uploadImg('test/', function(req, file) {
  console.log(file);
  return 'test';
});
router.get('/look_uploadImage', debug.lookUploadImg);
router.post('/look_uploadImage', testUploader.single('image'), debug.uploadImg);

// create data
router.get('/create_data', data.createData);

module.exports = router;
