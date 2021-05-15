const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

module.exports = compressImage = (images) => {
	images.map(async (image) => {
		await sharp(image.path)
			.png({ palette: true })
			.toFile(path.resolve(image.destination, 'compressed', image.filename));
		fs.unlinkSync(image.path);
	});
};
