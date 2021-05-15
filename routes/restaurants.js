const { Restaurant } = require('../models/restaurant');
const auth = require('../middleware/auth');
const express = require('express');
const uploadImages = require('../middleware/uploadImages');
const deleteImages = require('../middleware/deleteImages');
const { CategorieFood } = require('../models/categorieFood');
const validations = require('../startup/validations');
const getPathData = require('../middleware/getPathData');
const compressImage = require('../utils/compressImage');
const router = express.Router();
const _ = require('lodash');

const validateObjectId = require('../middleware/validateObjectId');

router.get('/', async (req, res) => {
	const restaurants = await Restaurant.find().populate('categorieFoodsId', 'nom').select('-__v').sort('nom');
	res.send(restaurants);
});

router.get('/:id', validateObjectId, async (req, res) => {
	const restaurant = await Restaurant.findById(req.params.id).select('-__v');

	if (!restaurant) return res.status(404).send("restaurant avec cette id n'existe pas");
	res.send(restaurant);
});

router.post('/', auth, async (req, res) => {
	try {
		await uploadImages(req, res);
	} catch (error) {
		res.status(500).send({
			message: `Could not upload the images: ${req.files.originalname}. ${error}`
		});
	}

	if (req.files == undefined) {
		return res.status(400).send({ message: 'Please upload multiple images!' });
	}

	const { error } = validations.restaurant(req.body);
	if (error) {
		deleteImages(req.files);
		return res.status(400).send(error.details[0].message);
	}

	const { image: images, qrCode } = getPathData(req.files);

	if (images) compressImage(images);
	if (qrCode) compressImage(qrCode);
	const { nom, description, h_ouverture, h_fermeture, telephone, latitude, longitude, categorieFoodsId } = req.body;

	const restaurant = new Restaurant({
		nom: nom,
		images: images ? images.map((image) => image.destination + '/compressed/' + image.filename) : [],
		qrCode: qrCode ? qrCode[0].destination + '/compressed/' + qrCode[0].filename : '',
		description: description,
		h_ouverture: h_ouverture,
		h_fermeture: h_fermeture,
		telephone: telephone,
		latitude: latitude,
		longitude: longitude,
		categorieFoodsId: categorieFoodsId
	});

	// update the categorie when adding new restaurant
	if (categorieFoodsId && categorieFoodsId.length != 0) {
		await CategorieFood.find({
			_id: { $in: categorieFoodsId }
		}).updateMany({ $set: { restaurantsId: restaurant._id } });
	}

	await restaurant.save();
	res.send(restaurant);
});

router.put('/:id', auth, async (req, res) => {
	try {
		await uploadImages(req, res);
	} catch (error) {
		res.status(500).send({
			message: `Could not upload the images: ${req.files.originalname}. ${error}`
		});
	}

	const { error } = validations.restaurant(req.body);
	if (error) {
		deleteImages(req.files);
		return res.status(400).send(error.details[0].message);
	}

	const { image: images, qrCode } = getPathData(req.files);
	const { nom, description, h_ouverture, h_fermeture, telephone, latitude, longitude, categorieFoodsId } = req.body;

	// to comments if a another fonction verifies its existance before

	// categoriesFood = await CategorieFood.find({
	//   _id: { $in: categorieFoodsId },
	// }).updateMany({ $set: { restaurantsId: restaurant._id } });

	const restaurant = await Restaurant.findOne({ _id: req.params.id });
	if (!restaurant) {
		deleteImages(req.files);
		return res.status(400).send('restaurant with this id not found');
	}
	if (images) {
		compressImage(images);
		restaurant.images.push(...images.map((image) => image.destination + '/compressed/' + image.filename));
	}
	if (qrCode) {
		compressImage(qrCode);

		deleteImages(restaurant.qrCode);
		restaurant.qrCode = qrCode[0].destination + '/compressed/' + qrCode[0].filename;
	}

	restaurant.nom = nom;
	restaurant.description = description;
	restaurant.h_ouverture = h_ouverture;
	restaurant.h_fermeture = h_fermeture;
	restaurant.telephone = telephone;
	restaurant.latitude = latitude;
	restaurant.longitude = longitude;
	restaurant.categorieFoodsId = categorieFoodsId;

	// updating categorie model when changing categorie of restaurant
	await CategorieFood.find({
		_id: { $in: categorieFoodsId }
	}).updateMany({ $set: { restaurantsId: restaurant._id } });

	await restaurant.save();

	// verifier si necessaire ou nn
	if (!restaurant) return res.status(404).send("restaurant avec cette id n'existe pas");

	res.send(restaurant);
});

router.delete('/:id', auth, async (req, res) => {
	const restaurant = await Restaurant.findByIdAndRemove(req.params.id);
	if (restaurant && restaurant.images) deleteImages(restaurant.images);
	if (restaurant && restaurant.qrCode) deleteImages(restaurant.qrCode);

	if (!restaurant) return res.status(404).send("restaurant avec cette id n'existe pas");
	res.send(restaurant);
});

module.exports = router;
