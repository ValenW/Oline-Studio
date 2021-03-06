var Spectrum = require('../models/Spectrum');
var Music = require('../models/Music');
var User = require('../models/User');
var Tag = require('../models/Tag');
var Comment = require('../models/Comment');
var MailSender = require('../middlewares/mail.js');

/**
 * showEditor() show a editor view to user
 * based on reqest parameters, set response.
 * deal with request URL : editor?spectrum_id=***
 *						 : /editor
 * @param <Object> req store parameters of the user request, such as req.query.spectrum_id.
 * @param <Object> res encapsulate content and methods of response to user request, such as res.render, res.json and res.send methods.
 * @param <Function> next encapsulate the next function needed to be execute if necessary
 * @return nothing
 */
exports.showEditor = function(req, res, next) {

	if (req.query.spectrum_id === undefined) {
		// first time create Spectrum
		res.render('editor', {
			spectrum: null,
			user: req.session.user === undefined ? null : {
				_id: req.session.user._id,
				username: req.session.user.username,
				profile: req.session.user.profile
			}
		});

	} else {
		// revise Spectrum according to spectrum_id
		var spectrum_id = req.query.spectrum_id;

		Spectrum.find({_id: spectrum_id}, function(err, spectrums) {
			if (err) {
				console.log ('Error in /editor interface.');
			} else {
				res.render('editor', {
					spectrum: spectrums[0],
					user: req.session.user === undefined ? null : {
						_id: req.session.user._id,
						username: req.session.user.username,
						profile: req.session.user.profile
					}
				});
			}
		});

	}
};


/**
 * saveSpectrum() save the information of the spectrum of the user
 * Based on reqest parameters, set response.
 * If spectrum_param has no _id, the new method create one.
 * elif spectrum_param has _id, just update the exist spectrum.
 * Deal with request URL : /save POST spectrum&user
 * @param <Object> req store parameters of the user request, such as req.body.spectrum and req.session.user.
 * @param <Object> res encapsulate content and methods of response to user request, such as res.render, res.json and res.send methods.
 * @param <Function> next encapsulate the next function needed to be execute if necessary
 * @return nothing
 */
exports.saveSpectrum = function(req, res, next) {

	// user not login, need to notice it
	var user = req.session.user;
	if (user === undefined) {	// user not login
		res.json({
			is_login: false
		});
		return;
	}

	// user login, continue to create or save spectrum
	spectrum_param = JSON.parse(req.body.spectrum);

	if (spectrum_param._id === undefined) {	// create Spectrum document
		// create Music document and set relationship between User and Music
		// create Spectrum
		var date = new Date();
		var spectrum = new Spectrum({
		    tempo : spectrum_param.tempo,
		    volume : spectrum_param.volume,
		    createDate : date,
		    lastModificationDate : date,
		    channels : spectrum_param.channels
		});
		spectrum.save();
		console.log ('Create Spectrum ', spectrum._id);

		// create Music info for Spectrum
		var date = new Date();
		var music = new Music({
			based_on: null,
			spectrum: spectrum,
			name: date.toString().substring(4, 24),
			author: user._id,
			cover: 'default_cover.png',
			date: date,
			tags: [],	// release version
			ranks: [],
			comments: [],
			listenN: 0,
			collectN: 0,
			commentN: 0,
			shareN: 0,
			is_music_public: false,
			is_spectrum_public: false,
			introduction: 'I am a piece of music.'
		});
		music.save();
		console.log ('Create Music ', music._id);

		// set relationship
		User.addOriginalMusicForUser({
			user_id: user._id,
			music_id: music._id
		}, function(rst) {
			if (rst == true) {
				res.json({
					is_login: true,
					_id: spectrum._id
				});
			} else {
				console.log('Something wrong in User.addOriginalMusicForUser method.');
			}
		});

	} else {	// update Spectrum document
		// if spectrum is in user's collected_musics list, <??remove it from user's collected_musics list and??> create a new Spectrum,a new Music and correlate with User's derivative_musics list.
		// elif sppectrum is in user's original_musics list or user's derivative_musics list, just update the spectrum.
		User.findOne({
			_id: user._id
		}, function(err, m_user) {
			if (err) {
				console.log ('Error in /save request while finding user.');
			    res.render('error/500');
			} else {
				// find music according to spectrum.
				Music.findOne({
					spectrum: spectrum_param._id
				}, function(err, music) {
					if (err) {
						console.log ('Error in /save request while finding music.');
						res.render('error/500');
					} else {
						// if the music is owned by the m_user, then just update it.
						// elif create a new music, a new spectrum and a new relationship.
						if (music.author.toString() == m_user._id.toString()) {	// just update
							// spectrum update begin.
							Spectrum.update({
								_id: spectrum_param._id
							}, {
								tempo				: spectrum_param.tempo,
								volume				: spectrum_param.volume,
								lastModificationDate: new Date(),
								channels			: spectrum_param.channels 
							}, {}, function(err, info) {
								if (err) {
									console.log ('Error in /save request, Spectrum.update method.');
									console.log (err);
									console.log ('Spectrum ---> \n', spectrum_param);
							        res.render('error/500');
								} else {
									console.log ('Update Spectrum ', spectrum_param._id);
									res.json({
										is_login: true,
										_id: spectrum_param._id
									});
								}
							});
							// spectrum update end.
						} else {	// create new music, new spectrum and new relationship between user and music.
							// create Spectrum begin.
							var date = new Date();
							Spectrum.create({
							    tempo : spectrum_param.tempo,
							    volume : spectrum_param.volume,
							    createDate : date,
							    lastModificationDate : date,
							    channels : spectrum_param.channels
							}, function(err, spectrum) {
								if (err) {
									console.log ('Error in /save request, Spectrum.create method');
							        res.render('error/500');
								} else {
									console.log ('Create Spectrum ', spectrum._id);
									console.log ('Spectrum.create', '\n', spectrum);

									// create Music begin.
									Music.create({
										based_on: music._id,
										spectrum: spectrum._id,
										name: date.toString().substring(4, 24),
										author: user._id,
										cover: 'default_cover.png',
										date: date,
										tags: [],	// release version
										ranks: [],
										comments: [],
										listenN: 0,
										collectN: 0,
										commentN: 0,
										shareN: 0,
										is_music_public: false,
										is_spectrum_public: false,
										introduction: 'I am a piece of music.'
									}, function(err, music) {
										if (err) {
											console.log ('Error in /save request, Music.create method.');
									        res.render('error/500');
										} else {
											console.log ('Create Music ', music._id);
											console.log ('Music.create', '\n', music);

											User.addDerivativeMusicForUser({
												user_id: m_user._id,
												music_id: music._id
											}, function(rst) {
												if (rst == true) {
													res.json({
														is_login: true,
														_id		: spectrum._id
													});
												} else {
													console.log('Something wrong in User.addOriginalMusicForUser method.');
												}
											});

										}
									});
									// create Music end.
								}
							});
							// create Spectrum end.
						}
					}
				});

			}
		});
	}

};

/**
 * login() help login in editor page
 * Based on reqest parameters, set response.
 * login with username and password, return the result.
 * Deal with request URL : /editor/login POST username&password
 * @param <Object> req store parameters of the user request, such as req.body.username and req.body.password.
 * @param <Object> res encapsulate content and methods of response to user request, such as res.render, res.json and res.send methods.
 * @param <Function> next encapsulate the next function needed to be execute if necessary
 * @return nothing
 */
exports.login = function(req, res, next) {
    User.findOne({
        'username': req.body.username,
        'password': req.body.password
    }, function(err, user) {
        if (err) {
            console.log(err);
        } else {
            if (user === null) {
                res.json({
                	login_rst: 'fail',
                	message: 'The username or password is not correct'
                });
            } else {
                req.session.user = user;
                res.json({
                	login_rst: 'success',
                	user: {
						_id: req.session.user._id,
						username: req.session.user.username,
						profile: req.session.user.profile
                	}
                })
            }
        }
    });
};

/**
 * signup() help signup in editor page
 * Based on reqest parameters, set response.
 * signup with username,email and password, return the result.
 * Deal with request URL : /editor/signup POST username&password&email
 * @param <Object> req store parameters of the user request, such as req.body.username,req.body.password and req.body.email.
 * @param <Object> res encapsulate content and methods of response to user request, such as res.render, res.json and res.send methods.
 * @param <Function> next encapsulate the next function needed to be execute if necessary
 * @return nothing
 */
exports.signup = function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;

    User.find({$or: [ {'username': username}, {'email': email} ]}, function(err, users) {
        if (users.length > 0) {
        	var message = '';
            if (users[0].confed) {
                message = 'The username or email has been used';
            } else {
                message = 'The username hasn\'t been confired';
            }
            res.json({
            	signup_rst: 'fail',
            	message: message
            });
        } else {
            var date = new Date();
            User.create({
                'username': username,
                'password': password,
                'email': email,
                'confed': false,
                'createDate': date
            }, function(err, newUser) {
                var id = newUser._id.toString();
                if (err) {
                    console.log('error when create User!');
                } else {
                    MailSender.singup({
                        to: email
                    }, {
                        username: username,
                        link: 'http://localhost:3000/conf?id=' + id // TODO
                    }, function(err, info){
                        if(err){
                            console.log('Error');
                        } else {
                            console.log('Account Confer email sent');
                        }
                    });
                    req.session.user = newUser;
                    console.log("new user: ", req.session.user);
                    res.json({
                    	signup_rst: 'success',
                    	user: {
							_id: req.session.user._id,
							username: req.session.user.username,
							profile: req.session.user.profile
						}
                    });
                }
            });
        }
    });
}

/**
 * logout() help logout in editor page
 * Based on reqest parameters, set response.
 * logout with current user information, return the result.
 * Deal with request URL : /editor/logout GET
 * @param <Object> req store parameters of the user request, such as req.session.user.
 * @param <Object> res encapsulate content and methods of response to user request, such as res.render, res.json and res.send methods.
 * @param <Function> next encapsulate the next function needed to be execute if necessary
 * @return nothing
 */
exports.logout = function(req, res, next) {
    req.session.destroy();
    res.json({
    	logout: 'success'
    });
}
