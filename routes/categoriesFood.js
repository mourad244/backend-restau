const { CategorieFood } = require('../models/categorieFood');
const auth = require('../middleware/auth');
const express = require('express');
const uploadImages = require('../middleware/uploadImages');
const deleteImages = require('../middleware/deleteImages');
const getPathData = require('../middleware/getPathData');
const { Restaurant } = require('../models/restaurant');
const validations = require('../startup/validations');

const fs = require('fs');
const path = require('path');
const router = express.Router();

const validateObjectId = require('../middleware/validateObjectId');
const sharp = require('sharp');

router.get('/', async (req, res) => {
	const categoriesFood = await CategorieFood.find().populate('restaurantsId', 'nom').select('-__v').sort('nom');
	res.send(categoriesFood);
});

router.post('/', auth, async (req, res) => {
	try {
		await uploadImages(req, res);
	} catch (error) {
		res.status(500).send({
			message: `Could not upload the images: ${req.files.originalname}. ${err}`
		});
	}

	if (req.files == undefined) {
		return res.status(400).send({ message: 'Please upload multiple images!' });
	}

	const { error } = validations.categorieFood(req.body);
	if (error) {
		deleteImages(req.files);
		return res.status(400).send(error.details[0].message);
	}

	const { image: images } = getPathData(req.files);

	images.map(async (image) => {
		await sharp(image.path)
			.jpeg({ mozjpeg: true })
			.toFile(path.resolve(image.destination, 'compressed', image.filename));
		fs.unlinkSync(image.path);
	});

	const { nom, restaurantsId } = req.body;

	// to comments if a another fonction verifies its existance before
	if (restaurantsId) {
		const restaurant = await Restaurant.find({
			_id: { $in: restaurantsId }
		});
		if (restaurant.length == 0) {
			deleteImages(req.files);
			return res.status(400).send('id restaurant non trouvé.');
		}
	}

	const categorieFood = new CategorieFood({
		nom: nom,
		images: images ? images.map((image) => image.destination + '/compressed/' + image.filename) : [],
		restaurantsId: restaurantsId
	});
	await categorieFood.save();
	res.send(categorieFood);
});

router.put('/:id', auth, async (req, res) => {
	try {
		await uploadImages(req, res);
	} catch (error) {
		res.status(500).send({
			message: `Could not upload the images: ${req.files.originalname}. ${error}`
		});
	}

	const { error } = validations.categorieFood(req.body);
	if (error) {
		deleteImages(req.files);
		return res.status(400).send(error.details[0].message);
	}

	// to comments if a another fonction verifies its existance before

	const categorieFood = await CategorieFood.findOne({ _id: req.params.id });
	if (!categorieFood) {
		deleteImages(req.files);
		return res.status(404).send("categorie Food avec cet id n'existe pas");
	}
	const { nom, restaurantsId } = req.body;

	if (restaurantsId) {
		const restaurant = await Restaurant.find({
			_id: { $in: restaurantsId }
		});

		if (restaurant.length == 0) {
			deleteImages(req.files);
			return res.status(400).send('id restaurant non trouvé.');
		}
	}

	const { image: images } = getPathData(req.files);

	if (images)
		images.map(async (image) => {
			await sharp(image.path)
				.jpeg({ mozjpeg: true })
				.toFile(path.resolve(image.destination, 'compressed', image.filename));
			fs.unlinkSync(image.path);
		});

	if (images)
		categorieFood.images.push(...images.map((image) => image.destination + '/compressed/' + image.filename));

	categorieFood.nom = nom;
	categorieFood.restaurantsId = restaurantsId;

	await categorieFood.save();

	if (!categorieFood) return res.status(404).send("categorie food avec cette id n'existe pas");
	res.send(categorieFood);
});

router.get('/:id', validateObjectId, async (req, res) => {
	const categorieFood = await CategorieFood.findById(req.params.id).select('-__v');
	if (!categorieFood) return res.status(404).send("categorieFood avec cette id n'existe pas");
	res.send(categorieFood);
});

router.delete('/:id', auth, async (req, res) => {
	const categorieFood = await CategorieFood.findByIdAndRemove(req.params.id);
	if (!categorieFood) return res.status(404).send("categorieFood avec cette id n'existe pas");
	if (categorieFood.images) deleteImages(categorieFood.images);

	res.send(categorieFood);
});

module.exports = router;
