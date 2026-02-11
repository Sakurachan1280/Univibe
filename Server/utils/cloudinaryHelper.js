const cloudinary = require('../config/cloudinary');

/**
 * Generate optimized audio URL for streaming
 * @param {string} publicId - Cloudinary public ID
 * @returns {string} Optimized streaming URL
 */
const getAudioStreamUrl = (publicId) => {
    return cloudinary.url(publicId, {
        resource_type: 'video',
        format: 'mp3',
        quality: 'auto',
        fetch_format: 'auto'
    });
};

/**
 * Generate optimized image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Transformation options
 * @returns {string} Optimized image URL
 */
const getImageUrl = (publicId, options = {}) => {
    const defaultOptions = {
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        width: options.width || 500,
        height: options.height || 500,
        crop: options.crop || 'fill'
    };

    return cloudinary.url(publicId, { ...defaultOptions, ...options });
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Full Cloudinary URL
 * @returns {string} Public ID
 */
const extractPublicId = (url) => {
    if (!url) return null;

    // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : null;
};

module.exports = {
    getAudioStreamUrl,
    getImageUrl,
    extractPublicId
};
